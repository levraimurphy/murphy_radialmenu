// Geometry of an N-slot radial wheel (SVG rendering, like ox_lib / qb-radialmenu).
// Angles in degrees, 0 deg = right, clockwise (screen frame, y pointing down).

export function polar(cx, cy, r, deg) {
  const a = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

// Path of a wedge (donut) between innerR and outerR, from a0 to a1.
export function wedgePath(cx, cy, innerR, outerR, a0, a1) {
  const o0 = polar(cx, cy, outerR, a0);
  const o1 = polar(cx, cy, outerR, a1);
  const i1 = polar(cx, cy, innerR, a1);
  const i0 = polar(cx, cy, innerR, a0);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return `M ${o0.x} ${o0.y} A ${outerR} ${outerR} 0 ${large} 1 ${o1.x} ${o1.y} ` +
         `L ${i1.x} ${i1.y} A ${innerR} ${innerR} 0 ${large} 0 ${i0.x} ${i0.y} Z`;
}

// Simple arc (to stroke, fill:none) at radius r from a0 to a1.
export function arcPath(cx, cy, r, a0, a1) {
  const p0 = polar(cx, cy, r, a0);
  const p1 = polar(cx, cy, r, a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`;
}

// Computes the geometry of each slot. Starts at the top (-90 deg), angular gap between slots.
export function computeWheel(count, { size = 400, outerR = 190, innerR = 95, gap = 2 } = {}) {
  const c = size / 2;
  const n = Math.max(count, 1);
  const pie = 360 / n;
  // Single element: no gap (full circle), otherwise the path closes badly.
  const g = n === 1 ? 0 : gap;
  return Array.from({ length: n }, (_, i) => {
    // Slot i CENTERED (slot 0 at the top): aligned to the game texture grid (slot center at the top).
    const mid = -90 + i * pie;
    const a0 = mid - pie / 2 + g / 2;
    const a1 = mid + pie / 2 - g / 2;
    return {
      i,
      a0, a1, mid,
      iconCenter: polar(c, c, (innerR + outerR) / 2, mid),
      path: wedgePath(c, c, innerR, outerR, a0, a1),
    };
  });
}
