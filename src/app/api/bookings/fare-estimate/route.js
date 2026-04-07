import { calculateFare } from '@/lib/fareCalculator';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const pickupStopIndex = searchParams.get('pickupStopIndex');
    const dropoffStopIndex = searchParams.get('dropoffStopIndex');
    const userType = searchParams.get('userType') || 'REGULAR';

    if (pickupStopIndex == null || dropoffStopIndex == null) {
      return NextResponse.json(
        { error: 'pickupStopIndex and dropoffStopIndex are required' },
        { status: 400 }
      );
    }

    const pickup = parseInt(pickupStopIndex);
    const dropoff = parseInt(dropoffStopIndex);

    const isDiscountEligible = userType !== 'REGULAR';
    const fare = calculateFare(pickup, dropoff, userType, isDiscountEligible);

    return NextResponse.json(fare);
  } catch (error) {
    console.error('Fare estimate error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
