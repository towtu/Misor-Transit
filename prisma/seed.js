const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

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

/**
 * Real bus seat layout:
 *   Row 1 (Front): 2 seats left (A,B), empty right (door/stairs)
 *   Rows 2–7:      2 left (A,B) + 2 right (C,D)
 *   Row 8 (Back):   5-seat bench (A,B,C,D,E)
 *   Total: 31 seats
 */
function generateSeats() {
  const seats = [];
  // Row 1: only left side
  seats.push({ label: '1A', row: 1, col: 1, isAisle: false });
  seats.push({ label: '1B', row: 1, col: 2, isAisle: false });
  // Rows 2–7: 2×2
  for (let row = 2; row <= 7; row++) {
    seats.push({ label: `${row}A`, row, col: 1, isAisle: false });
    seats.push({ label: `${row}B`, row, col: 2, isAisle: false });
    seats.push({ label: `${row}C`, row, col: 4, isAisle: false });
    seats.push({ label: `${row}D`, row, col: 5, isAisle: false });
  }
  // Row 8: 5-seat bench
  seats.push({ label: '8A', row: 8, col: 1, isAisle: false });
  seats.push({ label: '8B', row: 8, col: 2, isAisle: false });
  seats.push({ label: '8C', row: 8, col: 3, isAisle: false });
  seats.push({ label: '8D', row: 8, col: 4, isAisle: false });
  seats.push({ label: '8E', row: 8, col: 5, isAisle: false });
  return seats;
}

const BUS_CONFIGS = [
  { plateNumber: 'MOR-001', name: 'MisOr Express 1', direction: 'TAGOLOAN_TO_CDO', currentStopIdx: 0 },
  { plateNumber: 'MOR-002', name: 'MisOr Express 2', direction: 'CDO_TO_TAGOLOAN', currentStopIdx: 10 },
  { plateNumber: 'MOR-003', name: 'MisOr Express 3', direction: 'TAGOLOAN_TO_CDO', currentStopIdx: 3 },
  { plateNumber: 'MOR-004', name: 'MisOr Express 4', direction: 'CDO_TO_TAGOLOAN', currentStopIdx: 7 },
  { plateNumber: 'MOR-005', name: 'MisOr Express 5', direction: 'TAGOLOAN_TO_CDO', currentStopIdx: 5 },
];

async function main() {
  console.log('Seeding database...');

  // Route
  const route = await prisma.route.upsert({
    where: { id: 'route-tagoloan-cdo' },
    update: {},
    create: { id: 'route-tagoloan-cdo', name: 'Tagoloan - Cagayan de Oro' },
  });

  // Stops
  for (const stop of STOPS) {
    await prisma.stop.upsert({
      where: { routeId_orderIndex: { routeId: route.id, orderIndex: stop.orderIndex } },
      update: { name: stop.name, lat: stop.lat, lng: stop.lng },
      create: { routeId: route.id, ...stop },
    });
  }

  // Fare rules
  for (let from = 0; from <= 10; from++) {
    for (let to = 0; to <= 10; to++) {
      if (from === to) continue;
      const fares = FARE_TABLE[Math.abs(to - from)];
      await prisma.fareRule.upsert({
        where: { routeId_fromStopIndex_toStopIndex: { routeId: route.id, fromStopIndex: from, toStopIndex: to } },
        update: { regularFare: fares.regular, discountedFare: fares.discounted },
        create: { routeId: route.id, fromStopIndex: from, toStopIndex: to, regularFare: fares.regular, discountedFare: fares.discounted },
      });
    }
  }

  // 5 buses — all RUNNING
  for (const config of BUS_CONFIGS) {
    const bus = await prisma.bus.upsert({
      where: { plateNumber: config.plateNumber },
      update: {
        name: config.name,
        direction: config.direction,
        currentStopIdx: config.currentStopIdx,
        status: 'RUNNING',
        simulationStartedAt: new Date(),
      },
      create: {
        plateNumber: config.plateNumber,
        name: config.name,
        busType: 'COASTER',
        routeId: route.id,
        direction: config.direction,
        currentStopIdx: config.currentStopIdx,
        startStopIdx: config.currentStopIdx,
        status: 'RUNNING',
        simulationStartedAt: new Date(),
      },
    });

    // Only create seats if none exist for this bus
    const seatCount = await prisma.seat.count({ where: { busId: bus.id } });
    if (seatCount === 0) {
      const seats = generateSeats();
      await prisma.seat.createMany({
        data: seats.map((s) => ({ ...s, busId: bus.id })),
      });
      console.log(`  Created 31 seats for ${config.name}`);
    } else {
      console.log(`  ${config.name} already has ${seatCount} seats, skipping`);
    }
  }

  // Default users
  const adminHash = await bcrypt.hash('admin123', 12);
  const userHash = await bcrypt.hash('user123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@misortransit.com' },
    update: {},
    create: {
      email: 'admin@misortransit.com', password: adminHash,
      firstName: 'Admin', lastName: 'User',
      role: 'ADMIN', userType: 'REGULAR', verificationStatus: 'VERIFIED',
    },
  });

  await prisma.user.upsert({
    where: { email: 'demo@passenger.com' },
    update: {},
    create: {
      email: 'demo@passenger.com', password: userHash,
      firstName: 'Demo', lastName: 'Passenger',
      role: 'PASSENGER', userType: 'REGULAR', verificationStatus: 'VERIFIED',
    },
  });

  const staffHash = await bcrypt.hash('staff1234', 12);
  await prisma.user.upsert({
    where: { email: 'staff1@misortransit.com' },
    update: {},
    create: {
      email: 'staff1@misortransit.com', password: staffHash,
      firstName: 'Staff', lastName: 'One',
      role: 'STAFF', userType: 'REGULAR', verificationStatus: 'VERIFIED',
    },
  });
  await prisma.user.upsert({
    where: { email: 'staff2@misortransit.com' },
    update: {},
    create: {
      email: 'staff2@misortransit.com', password: staffHash,
      firstName: 'Staff', lastName: 'Two',
      role: 'STAFF', userType: 'REGULAR', verificationStatus: 'VERIFIED',
    },
  });

  console.log('Seed complete! 5 buses running with 31 seats each.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
