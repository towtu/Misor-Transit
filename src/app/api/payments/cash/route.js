import prisma from '@/lib/prisma';
import { getUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const user = await getUser(request);
    const { bookingId } = await request.json();

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

    // Confirm booking atomically — seat reserved, passenger pays cash on board
    await prisma.$transaction([
      prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.fare,
          status: 'PENDING',
          method: 'CASH',
        },
      }),
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'CONFIRMED' },
      }),
      prisma.seat.update({
        where: { id: booking.seatId },
        data: { status: 'BOOKED' },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Cash payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
