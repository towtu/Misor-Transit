import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const user = await requireAuth(request);

    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      include: {
        seat: true,
        bus: true,
        pickupStop: true,
        dropoffStop: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json(bookings);
  } catch (error) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Fetch bookings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
