import * as THREE from "three";

const V  = (x, y, z = 0)    => new THREE.Vector3(x, y, z);
const QC = (p0, p1, p2)     => new THREE.QuadraticBezierCurve3(p0, p1, p2);
const CC = (p0, p1, p2, p3) => new THREE.CubicBezierCurve3   (p0, p1, p2, p3);

/**
 * Convierte un array de curvas (2D en XY) a puntos para LatheGeometry.
 *  • Muestrea "segments" puntos por curva.
 *  • Usa |x| como radio, evitando winding inverso.
 *  • Si varias muestras comparten la misma cota Y, conserva el radio máximo.
 *  • Ordena bottom → top y fuerza radio 0 en la base y en la tapa.
 */
function lathePoints(curves, segments = 24, scale = 1) {
  const raw = [];
  curves.forEach(c => {
    for (let i = 0; i <= segments; i++) {
      const p = c.getPoint(i / segments);
      raw.push({ y: p.y * scale, r: Math.abs(p.x) * scale });
    }
  });
  
  const byY = new Map();
  raw.forEach(({ y, r }) => {
    const k = y.toFixed(6);
    byY.set(k, Math.max(byY.get(k) ?? 0, r));
  });
  const ys  = [...byY.keys()].map(parseFloat).sort((a, b) => a - b);
  const pts = ys.map(y => new THREE.Vector2(byY.get(y.toFixed(6)), y));
  pts[0].x = 0;                              // base
  pts[pts.length - 1].x = 0;                 // tapa
  return pts;
}

const curvesA = {
  A1: [
    QC(V(0, 14),  V(-3, 14),  V(-6, 14)),
    QC(V(-6,14),  V(-6, 13),  V(-6, 12)),
    CC(V(-6,12),  V(-1,11),   V(-3,10),  V(-4, 7)),
    CC(V(-4, 7),  V(-3, 4),   V(-1, 3),  V(-6, 2)),
    QC(V(-6, 2),  V(-6, 1),   V(-6, 0)),
    QC(V(-6, 0),  V(-3, 0),   V(0, 0))
  ],

  A2: [
    CC(V(-4, 28), V(-5, 27), V(-6.5, 25), V(-8, 24)),
    CC(V(-8, 24), V(-8, 20), V(-6, 17), V(-4, 14)),
    QC(V(-4, 14), V(-5, 11), V(-6, 8)),
    QC(V(-6, 8), V(-8, 4), V(-8, 1)),
    QC(V(-8, 1), V(-4, 0.5), V(0, 0))
  ],

  A3: [
    QC(V(-4, 23), V(-5, 21), V(-8, 21)),
    QC(V(-8, 21), V(-11, 21), V(-11, 18)),
    QC(V(-11, 18), V(-11, 15), V(-11, 12)),
    QC(V(-11, 12), V(-11, 8), V(-3, 7)),
    QC(V(-3, 7), V(-3, 5.5), V(-3, 4)),
    QC(V(-3, 4), V(-7.5, 2), V(-12, 0)),
    QC(V(-12, 0), V(-6, 0), V(0, 0))
  ],

  A4: [
    CC(V(-1, 30), V(-5, 29), V(-7, 27), V(-8, 24)),
    CC(V(-8, 24), V(-8, 21), V(-9, 18), V(-19, 15)),
    CC(V(-19, 15), V(-9, 13), V(-5, 11), V(-5, 7)),
    CC(V(-5,  7), V(-10, 6), V(-11, 3), V(-10, 1)),
    QC(V(-10, 1), V(-5, 0.5), V(0, 0))
  ]
};

const scaleMap = { A1: 1 / 8, A2: 1 / 12, A3: 1 / 12, A4: 1 / 14 };

export const profiles = Object.fromEntries(
  Object.entries(curvesA).map(([k, arr]) => [k, lathePoints(arr, 24, scaleMap[k])])
);

const createTriangle = () => {
  const s = new THREE.Shape();
  const r = 0.9;
  const verts = [...Array(3)].map((_, i) => {
    const θ = Math.PI / 2 + (i * 2 * Math.PI) / 3;
    return V(r * Math.cos(θ), r * Math.sin(θ));
  });
  verts.forEach((v, i) => {
    const next = verts[(i + 1) % 3];
    const mid  = V((v.x + next.x) / 2, (v.y + next.y) / 2);
    const curve = new THREE.QuadraticBezierCurve3(v, mid, next);
    curve.getPoints(20).forEach((p, j) =>
      i === 0 && j === 0 ? s.moveTo(p.x, p.y) : s.lineTo(p.x, p.y)
    );
  });
  s.closePath();
  return s;
};

const createStar = () => {
  const s = new THREE.Shape();
  const R = 0.85, r = 0.45, N = 8;
  const pts = [];
  for (let i = 0; i < N; i++) {
    const θo = (i * 2 * Math.PI) / N;
    const θi = θo + Math.PI / N;
    pts.push(V(R * Math.cos(θo), R * Math.sin(θo)));
    pts.push(V(r * Math.cos(θi), r * Math.sin(θi)));
  }
  const cr = new THREE.CatmullRomCurve3(pts, true);
  cr.getPoints(100).forEach((p, i) => (i ? s.lineTo(p.x, p.y) : s.moveTo(p.x, p.y)));
  s.closePath();
  return s;
};

const createRoundedSquare = () => {
  const s = new THREE.Shape();
  const L = 1.4,
        r = 0.45,
        w = 0.32,
        d = 0.32,
        bigW = 0.28,
        bigD = 0.28;
  const pts = [
    V(-w / 2, L / 2), V(-bigW / 2, L / 2), V(-bigW / 2, L / 2 - bigD),
    V(bigW / 2, L / 2 - bigD), V(bigW / 2, L / 2), V(w / 2, L / 2),
    V(L / 2 - r / 2, L / 2), V(L / 2, L / 2 - r / 2),

    V(L / 2, w / 2), V(L / 2, bigW / 2), V(L / 2 - bigD, bigW / 2),
    V(L / 2 - bigD, -bigW / 2), V(L / 2, -bigW / 2), V(L / 2, -w / 2),
    V(L / 2, -L / 2 + r / 2), V(L / 2 - r / 2, -L / 2),

    V(w / 2, -L / 2), V(bigW / 2, -L / 2), V(bigW / 2, -L / 2 + bigD),
    V(-bigW / 2, -L / 2 + bigD), V(-bigW / 2, -L / 2),
    V(-w / 2, -L / 2), V(-L / 2 + r / 2, -L / 2), V(-L / 2, -L / 2 + r / 2),

    V(-L / 2, -w / 2), V(-L / 2, -bigW / 2), V(-L / 2 + bigD, -bigW / 2),
    V(-L / 2 + bigD, bigW / 2), V(-L / 2, bigW / 2), V(-L / 2, w / 2),
    V(-L / 2, L / 2 - r / 2), V(-L / 2 + r / 2, L / 2)
  ];
  const cr = new THREE.CatmullRomCurve3(pts, true);
  cr.getPoints(240).forEach((p, i) => (i ? s.lineTo(p.x, p.y) : s.moveTo(p.x, p.y)));
  s.closePath();
  return s;
};

const createCapsule = () => {
  const s = new THREE.Shape();
  const w = 0.9, h = 2.0, r = w / 2, n = 16;
  const pts = [];
  // Semicírculo superior
  for (let i = 0; i <= n; i++) {
    const θ = Math.PI * (i / n);
    pts.push(V(r * Math.cos(θ), h / 2 - r + r * Math.sin(θ)));
  }
  // Semicírculo inferior
  for (let i = 0; i <= n; i++) {
    const θ = Math.PI + Math.PI * (i / n);
    pts.push(V(r * Math.cos(θ), -h / 2 + r + r * Math.sin(θ)));
  }
  const cr = new THREE.CatmullRomCurve3(pts, true);
  cr.getPoints(120).forEach((p, i) => (i ? s.lineTo(p.x, p.y) : s.moveTo(p.x, p.y)));
  s.closePath();
  return s;
};

const createCross = () => {
  const s = new THREE.Shape();
  const t = 0.32, w = 0.7;
  const pts = [
    V(-t, w), V(t, w), V(t, t), V(w, t), V(w, -t), V(t, -t),
    V(t, -w), V(-t, -w), V(-t, -t), V(-w, -t), V(-w, t), V(-t, t)
  ];
  const cr = new THREE.CatmullRomCurve3(pts, true);
  cr.getPoints(180).forEach((p, i) => (i ? s.lineTo(p.x, p.y) : s.moveTo(p.x, p.y)));
  s.closePath();
  return s;
};

export const shapes = {
  B1: createTriangle(),
  B2: createStar(),
  B3: createRoundedSquare(),
  B4: createCapsule(),
  B5: createCross()
};

export const sweepPathCatmull = (h = 4) =>
  new THREE.CatmullRomCurve3([V(0, 0, 0), V(0, h, 0)], false, "catmullrom", 0.5);