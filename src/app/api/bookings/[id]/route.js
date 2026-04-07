import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        seat: true,
        bus: true,
        pickupStop: true,
        dropoffStop: true,
        payment: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Strip sensitive fields
    const { userId, ...safeBooking } = booking;
    return NextResponse.json(safeBooking);
  } catch (error) {
    console.error('Fetch booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
