import prisma from '@/lib/prisma';
import { getUser } from '@/lib/auth';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const user = await getUser(request);
    const { bookingId, method } = await request.json();

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.userId && user && booking.userId !== user.id) {
      return NextResponse.json({ error: 'Not your booking' }, { status: 403 });
    }

    if (booking.status !== 'ON_HOLD') {
      return NextResponse.json({ error: 'Booking is not on hold' }, { status: 400 });
    }

    if (new Date(booking.holdExpiresAt) <= new Date()) {
      return NextResponse.json({ error: 'Hold has expired' }, { status: 400 });
    }

    if (booking.payment) {
      return NextResponse.json({ error: 'Payment already initiated' }, { status: 400 });
    }

    const validMethods = ['GCASH', 'MAYA', 'CARD', 'GRABPAY', 'BPI', 'UNIONBANK'];
    const paymentMethod = validMethods.includes(method) ? method : 'CARD';

    const now = new Date();

    // Create payment + confirm booking + mark seat BOOKED in one transaction
    await prisma.$transaction([
      prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.fare,
          status: 'PAID',
          method: paymentMethod,
          paidAt: now,
        },
      }),
      prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CONFIRMED',
          qrCode: crypto.randomUUID(),
        },
      }),
      prisma.seat.update({
        where: { id: booking.seatId },
        data: { status: 'BOOKED' },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Mock payment confirm error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
