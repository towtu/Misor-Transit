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

// 45 minutes for full route (10 segments) → 270 seconds per stop
const BASE_SECONDS_PER_STOP = 270;
const MAX_STOP_INDEX = 10;

export function computeBusPosition(bus) {
  if (bus.status !== 'RUNNING' || !bus.simulationStartedAt) {
    const stop = STOPS[bus.currentStopIdx] || STOPS[0];
    return {
      currentStopIdx: bus.currentStopIdx,
      fracToNext: 0,
      lat: stop.lat,
      lng: stop.lng,
      currentStopName: stop.name,
      nextStopName: null,
      direction: bus.direction,
    };
  }

  const elapsed = (Date.now() - new Date(bus.simulationStartedAt).getTime()) / 1000;
  const secondsPerStop = BASE_SECONDS_PER_STOP / (bus.simSpeed || 1);
  const totalStopsMoved = elapsed / secondsPerStop;

  let { stopIdx, frac, direction } = simulateTraversal(
    bus.startStopIdx,
    bus.direction,
    totalStopsMoved
  );

  const currentStop = STOPS[stopIdx];
  const dirSign = direction === 'TAGOLOAN_TO_CDO' ? 1 : -1;
  const nextIdx = stopIdx + dirSign;

  let lat = currentStop.lat;
  let lng = currentStop.lng;
  let nextStopName = null;

  if (nextIdx >= 0 && nextIdx <= MAX_STOP_INDEX && frac > 0) {
    const nextStop = STOPS[nextIdx];
    lat = lerp(currentStop.lat, nextStop.lat, frac);
    lng = lerp(currentStop.lng, nextStop.lng, frac);
    nextStopName = nextStop.name;
  }

  return {
    currentStopIdx: stopIdx,
    fracToNext: frac,
    lat,
    lng,
    currentStopName: currentStop.name,
    nextStopName,
    direction,
  };
}

function simulateTraversal(startIdx, startDirection, totalStopsMoved) {
  let idx = startIdx;
  let dir = startDirection === 'TAGOLOAN_TO_CDO' ? 1 : -1;
  let remaining = totalStopsMoved;

  while (remaining >= 1) {
    const nextIdx = idx + dir;
    if (nextIdx < 0 || nextIdx > MAX_STOP_INDEX) {
      dir *= -1;
    } else {
      idx = nextIdx;
    }
    remaining -= 1;
  }

  const direction = dir === 1 ? 'TAGOLOAN_TO_CDO' : 'CDO_TO_TAGOLOAN';
  return { stopIdx: idx, frac: remaining, direction };
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export { STOPS, MAX_STOP_INDEX };
