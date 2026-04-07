import prisma from '@/lib/prisma';
import { requireStaff } from '@/lib/auth';
import { generateSeats } from '@/lib/seatLayout';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await requireStaff(request);

    const { plateNumber, name, busType } = await request.json();

    // Find the default route
    const route = await prisma.route.findFirst();

    if (!route) {
      return NextResponse.json(
        { error: 'No route found. Please seed data first.' },
        { status: 400 }
      );
    }

    const bus = await prisma.bus.create({
      data: {
        plateNumber,
        name,
        busType,
        routeId: route.id,
        direction: 'TAGOLOAN_TO_CDO',
        currentStopIdx: 0,
        startStopIdx: 0,
      },
    });

    // Generate and create seats
    const seats = generateSeats();
    await prisma.seat.createMany({
      data: seats.map((s) => ({ ...s, busId: bus.id })),
    });

    const createdBus = await prisma.bus.findUnique({
      where: { id: bus.id },
      include: {
        seats: true,
        route: true,
      },
    });

    return NextResponse.json(createdBus, { status: 201 });
  } catch (error) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Create bus error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
