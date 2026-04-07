import prisma from '@/lib/prisma';
import { getUser } from '@/lib/auth';
import { calculateFare } from '@/lib/fareCalculator';
import { expireStaleHolds } from '@/lib/expireHolds';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

function generateRefCode() {
  // 6-char alphanumeric uppercase: e.g. "MOR-A3X9K2"
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `MOR-${code}`;
}

export async function POST(request) {
  try {
    const user = await getUser(request);
    const { busId, seatId, pickupStopId, dropoffStopId, pickupStopIndex, dropoffStopIndex, guestName } = await request.json();

    // Must be logged in OR provide a guest name
    if (!user && !guestName?.trim()) {
      return NextResponse.json(
        { error: 'Please provide your name or log in to book' },
        { status: 400 }
      );
    }

    await expireStaleHolds(prisma, busId);

    // Check no existing ON_HOLD booking for this user/guest on this bus
    if (user) {
      const existingHold = await prisma.booking.findFirst({
        where: { userId: user.id, busId, status: 'ON_HOLD' },
      });
      if (existingHold) {
        return NextResponse.json(
          { error: 'You already have an active hold on this bus' },
          { status: 409 }
        );
      }
    }

    // Get the seat and verify it's AVAILABLE
    const seat = await prisma.seat.findUnique({ where: { id: seatId } });
    if (!seat || seat.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'Seat is not available' },
        { status: 400 }
      );
    }

    // Resolve stops — accept either IDs or orderIndex values
    let pickupStop, dropoffStop;
    if (pickupStopId && dropoffStopId) {
      [pickupStop, dropoffStop] = await Promise.all([
        prisma.stop.findUnique({ where: { id: pickupStopId } }),
        prisma.stop.findUnique({ where: { id: dropoffStopId } }),
      ]);
    } else if (pickupStopIndex !== undefined && dropoffStopIndex !== undefined) {
      const bus = await prisma.bus.findUnique({ where: { id: busId }, select: { routeId: true } });
      if (!bus) return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
      [pickupStop, dropoffStop] = await Promise.all([
        prisma.stop.findFirst({ where: { routeId: bus.routeId, orderIndex: pickupStopIndex } }),
        prisma.stop.findFirst({ where: { routeId: bus.routeId, orderIndex: dropoffStopIndex } }),
      ]);
    }

    if (!pickupStop || !dropoffStop) {
      return NextResponse.json(
        { error: 'Invalid pickup or dropoff stop' },
        { status: 400 }
      );
    }

    // Calculate fare — guests always get REGULAR pricing
    const userType = user?.userType || 'REGULAR';
    const isVerified = user?.verificationStatus === 'VERIFIED';
    const fareResult = calculateFare(
      pickupStop.orderIndex,
      dropoffStop.orderIndex,
      userType,
      isVerified
    );
    const fare = fareResult?.fare ?? 0;

    // One active discounted booking per user at a time
    if (user && fareResult?.isDiscounted) {
      const activeDiscounted = await prisma.booking.findFirst({
        where: {
          userId: user.id,
          fareType: { in: ['STUDENT', 'SENIOR_CITIZEN', 'PWD'] },
          status: { in: ['ON_HOLD', 'CONFIRMED'] },
        },
      });
      if (activeDiscounted) {
        return NextResponse.json(
          { error: 'You already have an active discounted booking. Complete your current trip first.' },
          { status: 409 }
        );
      }
    }

    // Interactive transaction: double-check seat and create booking
    const booking = await prisma.$transaction(async (tx) => {
      const freshSeat = await tx.seat.findUnique({ where: { id: seatId } });
      if (!freshSeat || freshSeat.status !== 'AVAILABLE') {
        throw new Error('Seat is no longer available');
      }

      await tx.seat.update({
        where: { id: seatId },
        data: { status: 'ON_HOLD' },
      });

      const newBooking = await tx.booking.create({
        data: {
          ...(user ? { userId: user.id } : {}),
          guestName: user ? null : guestName.trim(),
          referenceCode: user ? null : generateRefCode(),
          busId,
          seatId,
          pickupStopId: pickupStop.id,
          dropoffStopId: dropoffStop.id,
          fare,
          fareType: fareResult?.isDiscounted ? fareResult.fareType : 'REGULAR',
          status: 'ON_HOLD',
          holdExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
          qrCode: crypto.randomUUID(),
        },
        include: {
          seat: true,
          pickupStop: true,
          dropoffStop: true,
        },
      });

      return newBooking;
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    if (error.message === 'Seat is no longer available') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
