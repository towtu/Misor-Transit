import prisma from '@/lib/prisma';
import { getUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const user = await getUser(request);
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Auth check: logged-in users can only cancel their own bookings.
    // Guest bookings (userId is null) can be cancelled by anyone with the booking ID.
    if (booking.userId) {
      if (!user || booking.userId !== user.id) {
        return NextResponse.json(
          { error: 'Not authorized to cancel this booking' },
          { status: 403 }
        );
      }
    }

    if (booking.status !== 'ON_HOLD') {
      return NextResponse.json(
        { error: 'Only ON_HOLD bookings can be cancelled' },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.seat.update({
        where: { id: booking.seatId },
        data: { status: 'AVAILABLE' },
      });

      await tx.booking.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });
    });

    return NextResponse.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
