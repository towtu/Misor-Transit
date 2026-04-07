'use client';
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

const STOPS = [
  { name: 'Tagoloan', lat: 8.538466, lng: 124.753925 },
  { name: 'Bugo', lat: 8.506133, lng: 124.753647 },
  { name: 'Puerto', lat: 8.500947, lng: 124.750376 },
  { name: 'Agusan', lat: 8.485274, lng: 124.733203 },
  { name: 'Tablon', lat: 8.480028, lng: 124.725441 },
  { name: 'Baloy', lat: 8.477565, lng: 124.720488 },
  { name: 'Cugman', lat: 8.469894, lng: 124.705183 },
  { name: 'Gusa', lat: 8.474541, lng: 124.685956 },
  { name: 'USTP', lat: 8.484666, lng: 124.656748 },
  { name: 'SM Downtown', lat: 8.485324, lng: 124.653744 },
  { name: 'Gaisano', lat: 8.485766, lng: 124.651613 },
];

// Road shape points per segment (from stop → to stop), including endpoints
const ROAD_SEGMENTS = [
  // Tagoloan → Bugo
  [
    [8.538466, 124.753925],
    [8.536683, 124.753813],
    [8.535276, 124.753896],
    [8.533731, 124.754010],
    [8.532614, 124.754151],
    [8.531491, 124.754419],
    [8.529094, 124.755356],
    [8.526842, 124.756371],
    [8.523727, 124.757495],
    [8.521649, 124.758193],
    [8.520718, 124.758519],
    [8.520021, 124.758732],
    [8.519503, 124.758823],
    [8.519060, 124.758808],
    [8.515039, 124.757890],
    [8.514446, 124.757715],
    [8.513898, 124.757381],
    [8.511475, 124.755417],
    [8.511026, 124.755169],
    [8.508394, 124.753969],
    [8.507791, 124.753774],
    [8.507336, 124.753684],
    [8.506702, 124.753675],
    [8.506133, 124.753647],
  ],
  // Bugo → Puerto
  [
    [8.506133, 124.753647],
    [8.505301, 124.753765],
    [8.504594, 124.753784],
    [8.504108, 124.753672],
    [8.503575, 124.753310],
    [8.503006, 124.752911],
    [8.502014, 124.751769],
    [8.500947, 124.750376],
  ],
  // Puerto → Agusan
  [
    [8.500947, 124.750376],
    [8.499805, 124.749294],
    [8.497687, 124.747797],
    [8.495760, 124.746227],
    [8.492034, 124.742121],
    [8.489777, 124.739817],
    [8.488376, 124.737826],
    [8.486564, 124.735385],
    [8.485274, 124.733203],
  ],
  // Agusan → Tablon
  [
    [8.485274, 124.733203],
    [8.483581, 124.730592],
    [8.481323, 124.727717],
    [8.480028, 124.725441],
  ],
  // Tablon → Baloy
  [
    [8.480028, 124.725441],
    [8.478093, 124.721893],
    [8.477565, 124.720488],
  ],
  // Baloy → Cugman
  [
    [8.477565, 124.720488],
    [8.474720, 124.714819],
    [8.474149, 124.713917],
    [8.472561, 124.711987],
    [8.471861, 124.711049],
    [8.471222, 124.709893],
    [8.470638, 124.708477],
    [8.470080, 124.706122],
    [8.469894, 124.705183],
  ],
  // Cugman → Gusa
  [
    [8.469894, 124.705183],
    [8.469670, 124.704192],
    [8.469723, 124.703181],
    [8.472292, 124.697373],
    [8.474597, 124.692488],
    [8.474863, 124.691742],
    [8.474847, 124.690413],
    [8.474722, 124.687310],
    [8.474541, 124.685956],
  ],
  // Gusa → USTP
  [
    [8.474541, 124.685956],
    [8.474240, 124.684044],
    [8.474226, 124.682773],
    [8.474490, 124.681500],
    [8.475811, 124.679355],
    [8.480969, 124.670096],
    [8.482111, 124.667137],
    [8.482915, 124.663896],
    [8.484236, 124.658230],
    [8.484666, 124.656748],
  ],
  // USTP → SM Downtown
  [
    [8.484666, 124.656748],
    [8.485324, 124.653744],
  ],
  // SM Downtown → Gaisano
  [
    [8.485324, 124.653744],
    [8.485766, 124.651613],
  ],
];

// Pre-compute cumulative distances for each segment
function measureDistances(coords) {
  const dists = [0];
  for (let i = 1; i < coords.length; i++) {
    const [lat1, lng1] = coords[i - 1];
    const [lat2, lng2] = coords[i];
    const dlat = lat2 - lat1;
    const dlng = lng2 - lng1;
    dists.push(dists[i - 1] + Math.sqrt(dlat * dlat + dlng * dlng));
  }
  return dists;
}

const SEGMENT_DATA = ROAD_SEGMENTS.map((coords) => ({
  coords,
  dists: measureDistances(coords),
}));

// Build the full route polyline (skip duplicate join points)
const FULL_ROUTE = ROAD_SEGMENTS.reduce((acc, seg, i) => {
  const points = i === 0 ? seg : seg.slice(1);
  return acc.concat(points);
}, []);

const CENTER = [8.505, 124.705];

// Interpolate a position along a polyline at a given fraction (0-1)
function interpolateAlongSegment(seg, fraction) {
  const { coords, dists } = seg;
  if (!coords.length) return null;
  const totalLen = dists[dists.length - 1];
  const targetDist = fraction * totalLen;
  for (let i = 1; i < dists.length; i++) {
    if (dists[i] >= targetDist) {
      const segLen = dists[i] - dists[i - 1];
      const t = segLen > 0 ? (targetDist - dists[i - 1]) / segLen : 0;
      return [
        coords[i - 1][0] + (coords[i][0] - coords[i - 1][0]) * t,
        coords[i - 1][1] + (coords[i][1] - coords[i - 1][1]) * t,
      ];
    }
  }
  return coords[coords.length - 1];
}

// Compute bus position on the road using segment data
function getBusRoadPosition(bus) {
  const stopIdx = bus.currentStopIdx;
  const frac = bus.fracToNext || 0;
  const dir = bus.computedDirection || bus.direction;
  const dirSign = dir === 'TAGOLOAN_TO_CDO' ? 1 : -1;
  const nextIdx = stopIdx + dirSign;

  if (frac === 0 || nextIdx < 0 || nextIdx >= STOPS.length) {
    return [bus.lat, bus.lng];
  }

  const segIdx = Math.min(stopIdx, nextIdx);
  const seg = SEGMENT_DATA[segIdx];
  if (!seg) return [bus.lat, bus.lng];

  // If going reverse, traverse the segment backwards
  const actualFrac = dir === 'TAGOLOAN_TO_CDO' ? frac : 1 - frac;
  return interpolateAlongSegment(seg, actualFrac);
}

function createBusIcon(bus) {
  return L.divIcon({
    html: `
      <div style="position:relative;width:40px;height:40px;cursor:pointer" title="${bus.name}">
        <div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.25);animation:radar-ping 2s cubic-bezier(0,0,0.2,1) infinite"></div>
        <div style="position:absolute;inset:4px;border-radius:50%;background:white;border:3px solid #3b82f6;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(59,130,246,0.35)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 7h8m-8 4h8m-4 4v3m-6 0h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2zm-2 0h2m12 0h2M7 21h.01M17 21h.01"/>
          </svg>
        </div>
      </div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

// Inject radar-ping keyframe CSS
if (typeof document !== 'undefined') {
  const styleId = 'bus-map-radar-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes radar-ping {
        0% { transform: scale(1); opacity: 0.5; }
        100% { transform: scale(2.8); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

function BusMarkers({ buses, onBusClick }) {
  const map = useMap();
  const markersRef = useRef({});

  useEffect(() => {
    buses.forEach((bus) => {
      if (!bus.lat || !bus.lng) return;
      const pos = getBusRoadPosition(bus);
      const existing = markersRef.current[bus.id];
      if (existing) {
        existing.setLatLng(pos);
        existing.setIcon(createBusIcon(bus));
      } else {
        const marker = L.marker(pos, { icon: createBusIcon(bus) })
          .addTo(map)
          .bindTooltip(
            `<div style="background:rgba(23,37,84,0.9);backdrop-filter:blur(8px);color:white;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;border:1px solid rgba(59,130,246,0.3);box-shadow:0 4px 12px rgba(0,0,0,0.2)">${bus.name}</div>`,
            { direction: 'top', offset: [0, -20], className: 'bus-tooltip-custom' }
          );
        marker.on('click', () => onBusClick(bus));
        markersRef.current[bus.id] = marker;
      }
    });

    const busIds = new Set(buses.map((b) => b.id));
    Object.keys(markersRef.current).forEach((id) => {
      if (!busIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });
  }, [buses, map, onBusClick]);

  return null;
}

export default function BusMap({ buses, onBusClick }) {
  return (
    <MapContainer
      center={CENTER}
      zoom={12}
      className="w-full h-full"
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />
      <Polyline positions={FULL_ROUTE} color="#3b82f6" weight={4} opacity={0.7} dashArray="10 8" />
      {STOPS.map((stop, i) => {
        const isTerminal = i === 0 || i === STOPS.length - 1;
        return (
          <CircleMarker
            key={i}
            center={[stop.lat, stop.lng]}
            radius={isTerminal ? 8 : 5}
            fillColor={isTerminal ? '#3b82f6' : '#94a3b8'}
            fillOpacity={0.9}
            color="#fff"
            weight={2}
          >
            <Tooltip permanent={isTerminal} direction="bottom" offset={[0, 8]}>
              {stop.name}
            </Tooltip>
          </CircleMarker>
        );
      })}
      <BusMarkers buses={buses} onBusClick={onBusClick} />
    </MapContainer>
  );
}
