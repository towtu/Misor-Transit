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

export function calculateFare(pickupIndex, dropoffIndex, userType, isVerified) {
  const distance = Math.abs(dropoffIndex - pickupIndex);
  if (distance === 0 || distance > 10) return null;

  const fares = FARE_TABLE[distance];
  const isDiscounted =
    isVerified && ['STUDENT', 'SENIOR_CITIZEN', 'PWD'].includes(userType);

  return {
    fare: isDiscounted ? fares.discounted : fares.regular,
    fareType: isDiscounted ? userType : 'REGULAR',
    distance,
    isDiscounted,
    regularFare: fares.regular,
    discountedFare: fares.discounted,
    savings: isDiscounted ? fares.regular - fares.discounted : 0,
  };
}
