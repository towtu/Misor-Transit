import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(request) {
  try {
    const user = await requireAuth(request);

    const { idImageUrl, userType } = await request.json();

    if (!idImageUrl) {
      return NextResponse.json(
        { error: 'ID image URL is required' },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationIdUrl: idImageUrl,
        verificationStatus: 'PENDING',
        userType: userType || user.userType,
      },
    });

    return NextResponse.json({ message: 'Verification ID submitted successfully' });
  } catch (error) {
    console.error('Verify ID error:', error);
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
