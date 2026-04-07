export async function expireStaleHolds(prisma, busId) {
  const now = new Date();

  const expiredBookings = await prisma.booking.findMany({
    where: {
      busId,
      status: 'ON_HOLD',
      holdExpiresAt: { lte: now },
    },
  });

  for (const booking of expiredBookings) {
    await prisma.$transaction([
      prisma.seat.update({
        where: { id: booking.seatId },
        data: { status: 'AVAILABLE' },
      }),
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'CANCELLED' },
      }),
      prisma.payment.updateMany({
        where: { bookingId: booking.id, status: 'PENDING' },
        data: { status: 'EXPIRED' },
      }),
    ]);
  }

  return expiredBookings.length;
}
