import prisma from '@/lib/prisma';
import { requireStaff } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    await requireStaff(request);

    const { userId } = await params;
    const { decision, note } = await request.json();

    if (!['approve', 'reject'].includes(decision)) {
      return NextResponse.json(
        { error: 'Decision must be approve or reject' },
        { status: 400 }
      );
    }

    const updateData = {};

    if (decision === 'approve') {
      updateData.verificationStatus = 'VERIFIED';
    } else {
      updateData.verificationStatus = 'REJECTED';
      updateData.verificationNote = note || null;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
        role: true,
        verificationStatus: true,
        verificationNote: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Verify user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
