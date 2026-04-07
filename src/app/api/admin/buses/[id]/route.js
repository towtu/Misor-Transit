import prisma from '@/lib/prisma';
import { requireStaff } from '@/lib/auth';
import { computeBusPosition } from '@/lib/busPosition';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
  try {
    const staff = await requireStaff(request);

    const { id } = await params;
    const body = await request.json();
    const { direction, status, simSpeed, passcode } = body;

    const bus = await prisma.bus.findUnique({ where: { id } });

    if (!bus) {
      return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
    }

    const updateData = {};

    // Handle passcode change (admin only) — use raw SQL to bypass stale Prisma client
    if (passcode !== undefined) {
      if (staff.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Only admins can set bus passcodes' }, { status: 403 });
      }
      const hashed = passcode ? await bcrypt.hash(passcode, 10) : null;
      await prisma.$executeRaw`UPDATE "Bus" SET passcode = ${hashed} WHERE id = ${id}`;
    }

    // Handle direction change
    if (direction && direction !== bus.direction) {
      // Compute and save current position before changing direction
      const pos = computeBusPosition(bus);
      updateData.currentStopIdx = pos.currentStopIdx;
      updateData.direction = direction;

      // If bus was RUNNING, restart simulation with new direction
      if (bus.status === 'RUNNING') {
        updateData.simulationStartedAt = new Date();
        updateData.startStopIdx = pos.currentStopIdx;
      } else {
        updateData.simulationStartedAt = null;
      }
    }

    // Handle simSpeed change
    if (simSpeed !== undefined && simSpeed !== bus.simSpeed) {
      // Compute and save current position before changing speed
      const pos = computeBusPosition(bus);
      updateData.currentStopIdx = pos.currentStopIdx;
      updateData.simSpeed = simSpeed;

      // If bus was RUNNING, restart simulation with new speed
      if (bus.status === 'RUNNING') {
        updateData.simulationStartedAt = new Date();
        updateData.startStopIdx = pos.currentStopIdx;
      }
    }

    // Handle status change
    if (status && status !== bus.status) {
      updateData.status = status;

      if (status === 'RUNNING') {
        updateData.simulationStartedAt = new Date();
        updateData.startStopIdx =
          updateData.currentStopIdx !== undefined
            ? updateData.currentStopIdx
            : bus.currentStopIdx;
      } else if (status === 'PAUSED') {
        const pos = computeBusPosition(bus);
        updateData.currentStopIdx = pos.currentStopIdx;
        updateData.simulationStartedAt = null;
      } else if (status === 'PARKED') {
        const effectiveDirection = updateData.direction || bus.direction;
        updateData.currentStopIdx =
          effectiveDirection === 'TAGOLOAN_TO_CDO' ? 0 : 7;
        updateData.simulationStartedAt = null;
      }
    }

    const updatedBus = await prisma.bus.update({
      where: { id },
      data: updateData,
      include: { route: true },
    });

    return NextResponse.json(updatedBus);
  } catch (error) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Update bus error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
