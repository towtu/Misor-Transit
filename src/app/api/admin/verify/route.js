import prisma from '@/lib/prisma';
import { requireStaff } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await requireStaff(request);

    const users = await prisma.user.findMany({
      where: { verificationStatus: 'PENDING' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
        verificationStatus: true,
        idPhotoUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Fetch pending verifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
