import * as THREE from "three";

/* ────────────────────── Helpers ─────────────────────── */
// V  = shorthand de THREE.Vector3
// QC = quadratic Bezier, CC = cubic Bezier
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
  // Agrupa radios por Y usando key redondeada
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

/* ──────────────── A-series (declaración de curvas) ──────────────── */
const curvesA = {
  // Coordenadas «full size» (x de 0 a −6, y 0 → 14)
  A1: [
    QC(V(0, 14),  V(-3, 14),  V(-6, 14)),
    QC(V(-6,14),  V(-6, 13),  V(-6, 12)),
    CC(V(-6,12),  V(-1,11),   V(-3,10),  V(-4, 7)),
    CC(V(-4, 7),  V(-3, 4),   V(-1, 3),  V(-6, 2)),
    QC(V(-6, 2),  V(-6, 1),   V(-6, 0)),
    QC(V(-6, 0),  V(-3, 0),   V(0, 0))
  ],

  // A2 y A4 ya vienen en mini-escala (≈ 1 unidad de alto)
  A2: [
    CC(V(0, 0),   V(0.2, 0),  V(0.5, 0),  V(0.65, 0)),
    CC(V(0.65,0), V(0.8, 0),  V(0.7, 0.5),V(0.75,0.5)),
    CC(V(0.75,0.5),V(0.8,0.5),V(0.6,1.5), V(0.65,1.5)),
    CC(V(0.65,1.5),V(0.7,1.5),V(0.3,2.5), V(0, 2.5))
  ],

  A3: [
    // BASE horizontal
    QC(V(0, 0), V(-2.5, 0), V(-5, 0)),
    // PIE inclinado
    QC(V(-5, 0), V(-6, 1.5), V(-4, 2.5)),
    // ESCALÓN recto
    QC(V(-4, 2.5), V(-4, 3.0), V(-4, 3.5)),
    // CUERPO vertical largo
    QC(V(-4, 3.5), V(-4, 8.5), V(-4, 12)),
    // HOMBRO curvo hacia adentro
    CC(V(-4, 12), V(-3.5, 12.5), V(-2.5, 13.5), V(-2, 14)),
    // REMATE superior curvo
    QC(V(-2, 14), V(-1, 14.5), V(0, 14.5))
  ],

  A4: [
    CC(V(0, 0),   V(0.2,0),   V(0.4,0),  V(0.6,0)),
    CC(V(0.6, 0), V(0.8,0),   V(0.65,0.6),V(0.7,0.6)),
    CC(V(0.7,0.6),V(0.75,0.6),V(0.9,0.8), V(1.1,0.8)),
    CC(V(1.1,0.8),V(1.3,0.8), V(1.0,1.4), V(1.05,1.4)),
    CC(V(1.05,1.4),V(1.1,1.4),V(0.8,1.6), V(0.7,1.6)),
    CC(V(0.7,1.6), V(0.6,1.6),V(0.6,1.8), V(0.6,1.8)),
    CC(V(0.6,1.8), V(0.6,1.8),V(0.3,2.3), V(0, 2.3))
  ]
};

// Escala individual (A1 y A3 reducidas 1/8)
const scaleMap = { A1: 1 / 8, A2: 1, A3: 1 / 8, A4: 1 };

export const profiles = Object.fromEntries(
  Object.entries(curvesA).map(([k, arr]) => [k, lathePoints(arr, 24, scaleMap[k])])
);

/* ─────────────── B-series (Shape instances) ─────────────── */
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

// Export shapes instanciadas (no funciones)
export const shapes = {
  B1: createTriangle(),
  B2: createStar(),
  B3: createRoundedSquare(),
  B4: createCapsule(),
  B5: createCross()
};

/* ───────────────────────── Sweep path ───────────────────────────── */
export const sweepPathCatmull = (h = 4) =>
  new THREE.CatmullRomCurve3([V(0, 0, 0), V(0, h, 0)], false, "catmullrom", 0.5);