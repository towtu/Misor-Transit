import prisma from '@/lib/prisma';
import { expireStaleHolds } from '@/lib/expireHolds';
import { autoReleaseSeats } from '@/lib/autoRelease';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Expire holds that have timed out
    await expireStaleHolds(prisma, id);

    const bus = await prisma.bus.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        busType: true,
        status: true,
        direction: true,
        currentStopIdx: true,
        startStopIdx: true,
        simulationStartedAt: true,
        simSpeed: true,
      },
    });

    if (!bus) {
      return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
    }

    // Auto-release seats where bus has passed the dropoff stop
    if (bus.status === 'RUNNING') {
      await autoReleaseSeats(prisma, bus);
    }

    const seats = await prisma.seat.findMany({
      where: { busId: id },
      orderBy: [{ row: 'asc' }, { col: 'asc' }],
    });

    return NextResponse.json({
      busId: bus.id,
      busName: bus.name,
      busType: bus.busType,
      seats,
    });
  } catch (error) {
    console.error('Failed to fetch seats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seats' },
      { status: 500 }
    );
  }
}
