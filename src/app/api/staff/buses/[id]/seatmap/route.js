import prisma from '@/lib/prisma';
import { requireStaff } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    await requireStaff(request);
    const { id } = await params;

    const seats = await prisma.seat.findMany({
      where: { busId: id },
      orderBy: [{ row: 'asc' }, { col: 'asc' }],
      include: {
        bookings: {
          where: { status: { in: ['ON_HOLD', 'CONFIRMED'] } },
          take: 1,
          include: {
            user: { select: { firstName: true, lastName: true } },
            pickupStop: { select: { name: true, orderIndex: true } },
            dropoffStop: { select: { name: true, orderIndex: true } },
            payment: { select: { method: true, status: true } },
          },
        },
      },
    });

    const result = seats.map((seat) => {
      const booking = seat.bookings?.[0] || null;
      return {
        id: seat.id,
        label: seat.label,
        row: seat.row,
        col: seat.col,
        status: seat.status,
        booking: booking
          ? {
              id: booking.id,
              status: booking.status,
              referenceCode: booking.referenceCode,
              guestName: booking.guestName,
              passengerName: booking.user
                ? `${booking.user.firstName} ${booking.user.lastName}`
                : booking.guestName,
              pickupStop: booking.pickupStop?.name,
              dropoffStop: booking.dropoffStop?.name,
              fare: booking.fare,
              paymentMethod: booking.payment?.method || null,
              paymentStatus: booking.payment?.status || null,
            }
          : null,
      };
    });

    return NextResponse.json({ seats: result });
  } catch (error) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Seatmap error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
