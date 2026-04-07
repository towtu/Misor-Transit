import prisma from '@/lib/prisma';
import { computeBusPosition } from '@/lib/busPosition';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const buses = await prisma.bus.findMany({
      where: { status: { not: 'MAINTENANCE' } },
      include: {
        route: true,
        _count: { select: { seats: true } },
      },
    });

    const result = await Promise.all(
      buses.map(async (bus) => {
        const position = computeBusPosition(bus);
        const availableSeats = await prisma.seat.count({
          where: { busId: bus.id, status: 'AVAILABLE' },
        });

        return {
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
          availableSeats,
          totalSeats: bus._count.seats,
          routeName: bus.route?.name ?? null,
        };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch buses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buses' },
      { status: 500 }
    );
  }
}
