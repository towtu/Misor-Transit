import prisma from '@/lib/prisma';
import { getUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const user = await getUser(request);
    const { bookingId } = await request.json();

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        seat: true,
        bus: true,
        pickupStop: true,
        dropoffStop: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // If logged in, verify ownership. If guest, allow (they have the bookingId from their session).
    if (booking.userId && user && booking.userId !== user.id) {
      return NextResponse.json({ error: 'Not your booking' }, { status: 403 });
    }

    if (booking.status !== 'ON_HOLD') {
      return NextResponse.json(
        { error: 'Booking is not on hold' },
        { status: 400 }
      );
    }

    if (new Date(booking.holdExpiresAt) <= new Date()) {
      return NextResponse.json(
        { error: 'Hold has expired' },
        { status: 400 }
      );
    }

    const amountCentavos = Math.round(booking.fare * 100);

    const checkoutResponse = await fetch(
      'https://api.paymongo.com/v1/checkout_sessions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            process.env.PAYMONGO_SECRET_KEY + ':'
          ).toString('base64')}`,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              line_items: [
                {
                  name: `Seat ${booking.seat.label} — ${booking.pickupStop.name} → ${booking.dropoffStop.name}`,
                  amount: amountCentavos,
                  currency: 'PHP',
                  quantity: 1,
                },
              ],
              payment_method_types: [
                'gcash',
                'paymaya',
                'card',
                'grab_pay',
                'dob',
              ],
              success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/${booking.id}/success`,
              cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/${booking.id}/cancel`,
              metadata: {
                booking_id: booking.id,
                user_id: user?.id || 'guest',
              },
            },
          },
        }),
      }
    );

    const checkoutData = await checkoutResponse.json();

    if (!checkoutResponse.ok) {
      console.error('PayMongo error:', checkoutData);
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 502 }
      );
    }

    const session = checkoutData.data;

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        status: 'PENDING',
        paymongoId: session.id,
        amount: booking.fare,
      },
    });

    return NextResponse.json({
      checkoutUrl: session.attributes.checkout_url,
      expiresAt: booking.holdExpiresAt,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
