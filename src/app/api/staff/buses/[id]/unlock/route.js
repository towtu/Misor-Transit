import prisma from '@/lib/prisma';
import { requireStaff } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    await requireStaff(request);

    const { id } = await params;
    const { passcode } = await request.json();

    const [bus] = await prisma.$queryRaw`SELECT id, name, "plateNumber", passcode FROM "Bus" WHERE id = ${id} LIMIT 1`;

    if (!bus) {
      return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
    }

    if (!bus.passcode) {
      return NextResponse.json({ error: 'This bus has no passcode set. Ask an admin to set one.' }, { status: 403 });
    }

    const valid = await bcrypt.compare(passcode, bus.passcode);
    if (!valid) {
      return NextResponse.json({ error: 'Wrong passcode' }, { status: 403 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Unlock bus error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
