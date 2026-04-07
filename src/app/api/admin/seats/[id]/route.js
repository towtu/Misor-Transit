import prisma from '@/lib/prisma';
import { requireStaff } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
  try {
    await requireStaff(request);

    const { id } = await params;
    const { status } = await request.json();

    if (!['AVAILABLE', 'DISABLED'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be AVAILABLE or DISABLED' },
        { status: 400 }
      );
    }

    const seat = await prisma.seat.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(seat);
  } catch (error) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Update seat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
