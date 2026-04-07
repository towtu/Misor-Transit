import prisma from '@/lib/prisma';
import { requireStaff } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

const STOPS = [
  { name: 'Tagoloan', lat: 8.538466, lng: 124.753925, orderIndex: 0 },
  { name: 'Bugo', lat: 8.506133, lng: 124.753647, orderIndex: 1 },
  { name: 'Puerto', lat: 8.500947, lng: 124.750376, orderIndex: 2 },
  { name: 'Agusan', lat: 8.485274, lng: 124.733203, orderIndex: 3 },
  { name: 'Tablon', lat: 8.480028, lng: 124.725441, orderIndex: 4 },
  { name: 'Baloy', lat: 8.477565, lng: 124.720488, orderIndex: 5 },
  { name: 'Cugman', lat: 8.469894, lng: 124.705183, orderIndex: 6 },
  { name: 'Gusa', lat: 8.474541, lng: 124.685956, orderIndex: 7 },
  { name: 'USTP', lat: 8.484666, lng: 124.656748, orderIndex: 8 },
  { name: 'SM Downtown', lat: 8.485324, lng: 124.653744, orderIndex: 9 },
  { name: 'Gaisano', lat: 8.485766, lng: 124.651613, orderIndex: 10 },
];

const FARE_TABLE = {
  1: { regular: 13, discounted: 10 },
  2: { regular: 15, discounted: 12 },
  3: { regular: 20, discounted: 16 },
  4: { regular: 25, discounted: 20 },
  5: { regular: 30, discounted: 24 },
  6: { regular: 35, discounted: 28 },
  7: { regular: 38, discounted: 30 },
  8: { regular: 42, discounted: 34 },
  9: { regular: 46, discounted: 37 },
  10: { regular: 50, discounted: 40 },
};

function generateSeats() {
  const seats = [];
  seats.push({ label: '1A', row: 1, col: 1, isAisle: false });
  seats.push({ label: '1B', row: 1, col: 2, isAisle: false });
  for (let row = 2; row <= 7; row++) {
    seats.push({ label: `${row}A`, row, col: 1, isAisle: false });
    seats.push({ label: `${row}B`, row, col: 2, isAisle: false });
    seats.push({ label: `${row}C`, row, col: 4, isAisle: false });
    seats.push({ label: `${row}D`, row, col: 5, isAisle: false });
  }
  seats.push({ label: '8A', row: 8, col: 1, isAisle: false });
  seats.push({ label: '8B', row: 8, col: 2, isAisle: false });
  seats.push({ label: '8C', row: 8, col: 3, isAisle: false });
  seats.push({ label: '8D', row: 8, col: 4, isAisle: false });
  seats.push({ label: '8E', row: 8, col: 5, isAisle: false });
  return seats;
}

const BUS_CONFIGS = [
  { plateNumber: 'MOR-001', name: 'MisOr Express 1', direction: 'TAGOLOAN_TO_CDO', currentStopIdx: 0, passcode: 'bus001' },
  { plateNumber: 'MOR-002', name: 'MisOr Express 2', direction: 'CDO_TO_TAGOLOAN', currentStopIdx: 10, passcode: 'bus002' },
  { plateNumber: 'MOR-003', name: 'MisOr Express 3', direction: 'TAGOLOAN_TO_CDO', currentStopIdx: 3, passcode: 'bus003' },
  { plateNumber: 'MOR-004', name: 'MisOr Express 4', direction: 'CDO_TO_TAGOLOAN', currentStopIdx: 7, passcode: 'bus004' },
  { plateNumber: 'MOR-005', name: 'MisOr Express 5', direction: 'TAGOLOAN_TO_CDO', currentStopIdx: 5, passcode: 'bus005' },
];

const STAFF_ACCOUNTS = [
  { email: 'staff1@misortransit.com', firstName: 'Staff', lastName: 'One', password: 'staff1234' },
  { email: 'staff2@misortransit.com', firstName: 'Staff', lastName: 'Two', password: 'staff1234' },
];

export async function POST(request) {
  try {
    await requireStaff(request);

    const routeId = 'route-tagoloan-cdo';

    // Upsert route (safe, no destructive deletes)
    await prisma.route.upsert({
      where: { id: routeId },
      update: {},
      create: { id: routeId, name: 'Tagoloan - Cagayan de Oro' },
    });

    // Upsert stops
    for (const stop of STOPS) {
      await prisma.stop.upsert({
        where: { routeId_orderIndex: { routeId, orderIndex: stop.orderIndex } },
        update: { name: stop.name, lat: stop.lat, lng: stop.lng },
        create: { routeId, ...stop },
      });
    }

    // Upsert fare rules
    for (let from = 0; from <= 10; from++) {
      for (let to = 0; to <= 10; to++) {
        if (from === to) continue;
        const fares = FARE_TABLE[Math.abs(to - from)];
        await prisma.fareRule.upsert({
          where: { routeId_fromStopIndex_toStopIndex: { routeId, fromStopIndex: from, toStopIndex: to } },
          update: { regularFare: fares.regular, discountedFare: fares.discounted },
          create: { routeId, fromStopIndex: from, toStopIndex: to, regularFare: fares.regular, discountedFare: fares.discounted },
        });
      }
    }

    // Upsert 5 buses with passcodes
    let busesCreated = 0;
    for (const config of BUS_CONFIGS) {
      const hashedPasscode = await bcrypt.hash(config.passcode, 10);
      const bus = await prisma.bus.upsert({
        where: { plateNumber: config.plateNumber },
        update: {
          name: config.name,
          direction: config.direction,
          currentStopIdx: config.currentStopIdx,
          status: 'RUNNING',
          simulationStartedAt: new Date(),
          passcode: hashedPasscode,
        },
        create: {
          plateNumber: config.plateNumber,
          name: config.name,
          busType: 'COASTER',
          routeId,
          direction: config.direction,
          currentStopIdx: config.currentStopIdx,
          startStopIdx: config.currentStopIdx,
          status: 'RUNNING',
          simulationStartedAt: new Date(),
          passcode: hashedPasscode,
        },
      });

      const seatCount = await prisma.seat.count({ where: { busId: bus.id } });
      if (seatCount === 0) {
        const seats = generateSeats();
        await prisma.seat.createMany({
          data: seats.map((s) => ({ ...s, busId: bus.id })),
        });
        busesCreated++;
      }
    }

    // Upsert staff accounts
    for (const acc of STAFF_ACCOUNTS) {
      const hashed = await bcrypt.hash(acc.password, 10);
      await prisma.user.upsert({
        where: { email: acc.email },
        update: {},
        create: {
          email: acc.email,
          firstName: acc.firstName,
          lastName: acc.lastName,
          password: hashed,
          role: 'STAFF',
        },
      });
    }

    return NextResponse.json({
      message: `Seed complete! 5 buses (with passcodes) and 2 staff accounts created. ${busesCreated} new bus(es) had seats created.`,
      staffAccounts: STAFF_ACCOUNTS.map((a) => ({ email: a.email, password: a.password })),
      busPasscodes: BUS_CONFIGS.map((b) => ({ bus: b.name, passcode: b.passcode })),
    });
  } catch (error) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
