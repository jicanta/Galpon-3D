/* utils/Shapes.js */
import * as THREE from 'three';

/* ────────── Perfiles Bézier para revolución (A-series) ────────── */
export const profiles = {
  /* A1 – silueta ondulada */
  A1: [
    [0, 0], [1.00, 0],
    [0.85, 0.30], [0.60, 1.00], [0.85, 1.70],
    [1.00, 2.00], [0, 2.00]
  ],

  /* A2 – contorno en “S” estilizado */
  A2: [
    [0, 0], [0.65, 0],
    [0.75, 0.50], [0.55, 1.50],
    [0.65, 2.00], [0, 2.00]
  ],

  /* A3 – base en punta + parte alta curva */
  A3: [
    [0, 0], [0.75, 0.00],
    [0.35, 1.00], [0.35, 1.30],
    [0.90, 1.60], [1.05, 2.00],
    [0, 2.00]
  ],

  /* A4 – perfil sinuoso tipo “s” doble */
  A4: [
    [0, 0], [0.60, 0],
    [0.70, 0.60], [1.10, 0.80],
    [1.05, 1.40], [0.70, 1.60],
    [0.60, 1.80], [0, 1.80]
  ]
};

/* ────────── Formas planas para barrido (B-series) ────────── */
export const shapes = {
  /* B1 – triángulo equilátero (apunta al +X) */
  B1: (() => {
    const s = new THREE.Shape();
    const r = 0.9;                     // radio circunscrito
    for (let i = 0; i < 3; i++) {
      const θ = Math.PI / 2 + i * (2 * Math.PI / 3);
      const x = r * Math.cos(θ);
      const y = r * Math.sin(θ);
      if (i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    }
    s.closePath();
    return s;
  })(),

  /* B2 – estrella de 8 puntas suave */
  B2: (() => {
    const s = new THREE.Shape();
    const R = 0.85;          // radio exterior
    const r = 0.35;          // radio interior
    const N = 8;
    const a = (Math.PI * 2) / N;

    s.moveTo(R, 0);
    for (let i = 0; i < N; i++) {
      const θo = i * a;
      const θi = θo + a / 2;
      const cpθ = θo + a * 0.25;

      s.quadraticCurveTo(
        Math.cos(cpθ) * (r + 0.12),
        Math.sin(cpθ) * (r + 0.12),
        Math.cos(θi) * r,
        Math.sin(θi) * r
      );
    }
    s.closePath();
    return s;
  })(),

  /* B3 – cruz con esquinas redondeadas */
  B3: (() => {
    const t = 0.35;   // medio ancho brazo
    const w = 0.8;    // largo brazo
    const r = 0.18;   // radio esquina
    const s = new THREE.Shape();

    s.moveTo(-t,  w - r)
     .lineTo( t,  w - r)
     .absarc( t,  w - r, r, Math.PI, 0, false)
     .lineTo( w - r,  t)
     .absarc( w - r,  t, r, Math.PI * 1.5, 0, false)
     .lineTo( t, -t)
     .lineTo( t, -w + r)
     .absarc( t, -w + r, r, 0, Math.PI / 2, false)
     .lineTo(-t, -w + r)
     .absarc(-t, -w + r, r, Math.PI / 2, Math.PI, false)
     .lineTo(-t, -t)
     .lineTo(-w + r, -t)
     .absarc(-w + r, -t, r, 0, -Math.PI / 2, true)
     .lineTo(-w + r,  t)
     .absarc(-w + r,  t, r, -Math.PI / 2, Math.PI, true)
     .closePath();

    return s;
  })(),

  /* B4 – píldora vertical (capsule) */
  B4: (() => {
    const w = 1.2, h = 2.0, r = 0.6;
    const s = new THREE.Shape();
    s.absarc(0,  h / 2 - r, r, Math.PI, 0,  false);
    s.lineTo( w / 2, -h / 2 + r);
    s.absarc(0, -h / 2 + r, r, 0, Math.PI, false);
    s.lineTo(-w / 2,  h / 2 - r);
    s.closePath();
    return s;
  })()
};

/* ────────── Trayectoria recta para barrido ────────── */
export function sweepPathCatmull (h = 2) {
  return new THREE.CatmullRomCurve3(
    [ new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, h, 0) ],
    false, 'catmullrom', 0.5
  );
}
