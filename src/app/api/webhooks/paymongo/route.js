import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

function verifySignature(rawBody, signatureHeader, secret) {
  if (!secret) return true; // skip verification if no secret configured
  if (!signatureHeader) return false;

  // PayMongo signature format: "t=<timestamp>,te=<test_sig>,li=<live_sig>"
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((p) => p.split('='))
  );
  const timestamp = parts.t;
  const signature = parts.te || parts.li; // test env uses 'te', live uses 'li'
  if (!timestamp || !signature) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signatureHeader = request.headers.get('paymongo-signature');
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

    if (!verifySignature(rawBody, signatureHeader, webhookSecret)) {
      console.warn('Webhook: invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.data?.attributes?.type === 'checkout_session.payment.paid') {
      const checkoutSessionId = event.data.attributes.data.id;

      const payment = await prisma.payment.findFirst({
        where: { paymongoId: checkoutSessionId },
        include: { booking: true },
      });

      if (payment && payment.status !== 'PAID') {
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: 'PAID',
              paidAt: new Date(),
            },
          });

          await tx.booking.update({
            where: { id: payment.bookingId },
            data: { status: 'CONFIRMED' },
          });

          await tx.seat.update({
            where: { id: payment.booking.seatId },
            data: { status: 'BOOKED' },
          });
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ received: true });
  }
}
