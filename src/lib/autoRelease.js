import { computeBusPosition } from './busPosition';

/**
 * Auto-release seats when the bus has passed the passenger's dropoff stop.
 * Also marks the booking as COMPLETED.
 */
export async function autoReleaseSeats(prisma, bus) {
  const position = computeBusPosition(bus);

  // Find all CONFIRMED bookings on this bus
  const confirmedBookings = await prisma.booking.findMany({
    where: { busId: bus.id, status: 'CONFIRMED' },
    include: { dropoffStop: true },
  });

  for (const booking of confirmedBookings) {
    const dropoffIdx = booking.dropoffStop.orderIndex;
    const busPassed = hasPassedStop(position, dropoffIdx);

    if (busPassed) {
      await prisma.$transaction([
        prisma.seat.update({
          where: { id: booking.seatId },
          data: { status: 'AVAILABLE' },
        }),
        prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'COMPLETED' },
        }),
      ]);
    }
  }
}

/**
 * Check if the bus has passed a given stop index based on its current
 * position and direction of travel.
 */
function hasPassedStop(position, stopIdx) {
  const { currentStopIdx, fracToNext, direction } = position;

  if (direction === 'TAGOLOAN_TO_CDO') {
    // Bus moves 0→10. Stop is "passed" if bus is beyond it.
    return currentStopIdx > stopIdx || (currentStopIdx === stopIdx && fracToNext > 0.1);
  } else {
    // Bus moves 10→0. Stop is "passed" if bus is below it.
    return currentStopIdx < stopIdx || (currentStopIdx === stopIdx && fracToNext > 0.1);
  }
}
