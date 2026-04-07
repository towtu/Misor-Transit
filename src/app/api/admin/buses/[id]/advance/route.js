import prisma from '@/lib/prisma';
import { requireStaff } from '@/lib/auth';
import { computeBusPosition } from '@/lib/busPosition';
import { NextResponse } from 'next/server';

const MAX_STOP_INDEX = 7;

export async function POST(request, { params }) {
  try {
    await requireStaff(request);

    const { id } = await params;

    const bus = await prisma.bus.findUnique({ where: { id } });

    if (!bus) {
      return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
    }

    // Compute current position
    const pos = computeBusPosition(bus);
    let newStopIdx = pos.currentStopIdx;
    let newDirection = pos.direction || bus.direction;

    // Move one stop forward in current direction
    if (newDirection === 'TAGOLOAN_TO_CDO') {
      if (newStopIdx >= MAX_STOP_INDEX) {
        // At endpoint, reverse direction
        newDirection = 'CDO_TO_TAGOLOAN';
        newStopIdx = MAX_STOP_INDEX - 1;
      } else {
        newStopIdx += 1;
      }
    } else {
      if (newStopIdx <= 0) {
        // At endpoint, reverse direction
        newDirection = 'TAGOLOAN_TO_CDO';
        newStopIdx = 1;
      } else {
        newStopIdx -= 1;
      }
    }

    const updateData = {
      currentStopIdx: newStopIdx,
      direction: newDirection,
    };

    // If bus was RUNNING, restart simulation from new position
    if (bus.status === 'RUNNING') {
      updateData.simulationStartedAt = new Date();
      updateData.startStopIdx = newStopIdx;
    }

    const updatedBus = await prisma.bus.update({
      where: { id },
      data: updateData,
    });

    const updatedPosition = computeBusPosition(updatedBus);

    return NextResponse.json({
      ...updatedBus,
      position: updatedPosition,
    });
  } catch (error) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Advance bus error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
