import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

async function confirmBooking(prismaClient, payment) {
  await prismaClient.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: 'PAID', paidAt: new Date() },
    });
    await tx.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'CONFIRMED' },
    });
    await tx.seat.update({
      where: { id: payment.booking.seatId },
      data: { status: 'BOOKED' },
    });
  });
}

async function checkPayMongoStatus(paymongoId) {
  try {
    const res = await fetch(
      `https://api.paymongo.com/v1/checkout_sessions/${paymongoId}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
        },
      }
    );
    if (!res.ok) return false;
    const data = await res.json();
    const payments = data?.data?.attributes?.payments ?? [];
    return payments.length > 0;
  } catch {
    return false;
  }
}

export async function GET(request, { params }) {
  try {
    const { bookingId } = await params;

    const payment = await prisma.payment.findFirst({
      where: { bookingId },
      include: {
        booking: {
          include: { seat: true, bus: true, pickupStop: true, dropoffStop: true },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Already confirmed
    if (payment.status === 'PAID') {
      return NextResponse.json({ booking: payment.booking, status: 'PAID' });
    }

    // Check PayMongo for actual payment status
    const isPaid = await checkPayMongoStatus(payment.paymongoId);

    if (isPaid) {
      // Payment went through — confirm regardless of current booking status.
      // This handles the case where the hold expired while the user was paying:
      // the seat may have been released, so we re-claim it.
      await confirmBooking(prisma, payment);

      const updated = await prisma.booking.findUnique({
        where: { id: payment.bookingId },
        include: { seat: true, bus: true, pickupStop: true, dropoffStop: true },
      });
      return NextResponse.json({ booking: updated, status: 'PAID' });
    }

    return NextResponse.json({ booking: payment.booking, status: 'PENDING' });
  } catch (error) {
    console.error('Payment status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
