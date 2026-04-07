import prisma from '@/lib/prisma';
import { requireStaff } from '@/lib/auth';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request, { params }) {
  try {
    await requireStaff(request);

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { payment: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (!['ON_HOLD', 'CONFIRMED'].includes(booking.status)) {
      return NextResponse.json({ error: 'Booking cannot be confirmed' }, { status: 400 });
    }

    if (!booking.payment || booking.payment.method !== 'CASH' || booking.payment.status === 'PAID') {
      return NextResponse.json({ error: 'No pending cash payment for this booking' }, { status: 400 });
    }

    const now = new Date();
    const updates = [
      prisma.payment.update({
        where: { id: booking.payment.id },
        data: { status: 'PAID', paidAt: now },
      }),
    ];

    // If still ON_HOLD (old flow), also confirm booking and mark seat
    if (booking.status === 'ON_HOLD') {
      updates.push(
        prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'CONFIRMED', qrCode: crypto.randomUUID() },
        }),
        prisma.seat.update({
          where: { id: booking.seatId },
          data: { status: 'BOOKED' },
        })
      );
    }

    await prisma.$transaction(updates);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Confirm cash payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
