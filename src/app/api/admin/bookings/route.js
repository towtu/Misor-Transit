import prisma from '@/lib/prisma';
import { requireStaff } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await requireStaff(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const busId = searchParams.get('busId');

    const refCode = searchParams.get('refCode');

    const where = {};
    if (status) where.status = status;
    if (busId) where.busId = busId;
    if (refCode) where.referenceCode = refCode.toUpperCase();

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            userType: true,
          },
        },
        seat: true,
        bus: true,
        pickupStop: true,
        dropoffStop: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Fetch bookings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
