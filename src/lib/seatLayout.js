/**
 * Real bus seat layout:
 *   Row 1 (Front): 2 seats left (A,B), empty right (door/stairs)
 *   Rows 2–7:      2 left (A,B) + 2 right (C,D)  — standard 2×2
 *   Row 8 (Back):   5-seat bench (A,B,C,D,E)
 *
 * Total: 2 + (6×4) + 5 = 31 seats
 */
export function generateSeats() {
  const seats = [];

  // Row 1: only left side (door on right)
  seats.push({ label: '1A', row: 1, col: 1, isAisle: false });
  seats.push({ label: '1B', row: 1, col: 2, isAisle: false });

  // Rows 2–7: 2×2
  for (let row = 2; row <= 7; row++) {
    seats.push({ label: `${row}A`, row, col: 1, isAisle: false });
    seats.push({ label: `${row}B`, row, col: 2, isAisle: false });
    seats.push({ label: `${row}C`, row, col: 4, isAisle: false });
    seats.push({ label: `${row}D`, row, col: 5, isAisle: false });
  }

  // Row 8: back bench — 5 seats across
  seats.push({ label: '8A', row: 8, col: 1, isAisle: false });
  seats.push({ label: '8B', row: 8, col: 2, isAisle: false });
  seats.push({ label: '8C', row: 8, col: 3, isAisle: false });
  seats.push({ label: '8D', row: 8, col: 4, isAisle: false });
  seats.push({ label: '8E', row: 8, col: 5, isAisle: false });

  return seats;
}

export function getSeatCount() {
  return 31;
}
