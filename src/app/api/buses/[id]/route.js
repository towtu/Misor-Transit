import prisma from '@/lib/prisma';
import { computeBusPosition } from '@/lib/busPosition';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const bus = await prisma.bus.findUnique({
      where: { id },
      include: {
        route: {
          include: { stops: true },
        },
      },
    });

    if (!bus) {
      return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
    }

    const position = computeBusPosition(bus);

    return NextResponse.json({
      id: bus.id,
      name: bus.name,
      plateNumber: bus.plateNumber,
      busType: bus.busType,
      direction: bus.direction,
      status: bus.status,
      lat: position.lat,
      lng: position.lng,
      currentStopIdx: position.currentStopIdx,
      fracToNext: position.fracToNext,
      currentStopName: position.currentStopName,
      nextStopName: position.nextStopName,
      computedDirection: position.direction,
      route: bus.route
        ? {
            id: bus.route.id,
            name: bus.route.name,
            stops: bus.route.stops,
          }
        : null,
    });
  } catch (error) {
    console.error('Failed to fetch bus:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bus' },
      { status: 500 }
    );
  }
}
