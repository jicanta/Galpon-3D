/* utils/Shapes.js */
import * as THREE from 'three';

/* ────────── Perfiles Bézier para revolución (A-series) ────────── */
const bezierProfiles = {
  /* A1 – silueta ondulada */
  A1: [
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.0185, 0.0, 0),
      new THREE.Vector3(0.009, 0.03, 0),
      new THREE.Vector3(0.0, 0.06, 0),
      new THREE.Vector3(0.0, 0.085, 0)
    ),
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.0, 0.085, 0),
      new THREE.Vector3(0.15, 0.25, 0),
      new THREE.Vector3(0.25, 0.4, 0),
      new THREE.Vector3(0.3704, 0.549, 0)
    ),
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.3704, 0.549, 0),
      new THREE.Vector3(0.25, 0.7, 0),
      new THREE.Vector3(0.1, 0.85, 0),
      new THREE.Vector3(0.0, 0.9085, 0)
    ),
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.0, 0.9085, 0),
      new THREE.Vector3(0.05, 0.95, 0),
      new THREE.Vector3(0.15, 0.98, 0),
      new THREE.Vector3(0.2778, 1.0, 0)
    )
  ],

  /* A2 – contorno en "S" estilizado */
  A2: [
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.2, 0, 0),
      new THREE.Vector3(0.5, 0, 0),
      new THREE.Vector3(0.65, 0, 0)
    ),
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.65, 0, 0),
      new THREE.Vector3(0.8, 0, 0),
      new THREE.Vector3(0.7, 0.5, 0),
      new THREE.Vector3(0.75, 0.5, 0)
    ),
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.75, 0.5, 0),
      new THREE.Vector3(0.8, 0.5, 0),
      new THREE.Vector3(0.6, 1.5, 0),
      new THREE.Vector3(0.65, 1.5, 0)
    ),
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.65, 1.5, 0),
      new THREE.Vector3(0.7, 1.5, 0),
      new THREE.Vector3(0.3, 2.0, 0),
      new THREE.Vector3(0, 2.0, 0)
    )
  ],

  /* A3 – base en punta + parte alta curva */
  A3: [
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.2, 0, 0),
      new THREE.Vector3(0.5, 0, 0),
      new THREE.Vector3(0.75, 0, 0)
    ),
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.75, 0, 0),
      new THREE.Vector3(1.0, 0, 0),
      new THREE.Vector3(0.5, 1.0, 0),
      new THREE.Vector3(0.35, 1.0, 0)
    ),
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.35, 1.0, 0),
      new THREE.Vector3(0.2, 1.0, 0),
      new THREE.Vector3(0.35, 1.3, 0),
      new THREE.Vector3(0.35, 1.3, 0)
    ),
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.35, 1.3, 0),
      new THREE.Vector3(0.35, 1.3, 0),
      new THREE.Vector3(0.7, 1.6, 0),
      new THREE.Vector3(0.9, 1.6, 0)
    ),
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.9, 1.6, 0),
      new THREE.Vector3(1.1, 1.6, 0),
      new THREE.Vector3(1.0, 2.0, 0),
      new THREE.Vector3(0, 2.0, 0)
    )
  ],

  /* A4 – perfil sinuoso tipo "s" doble */
  A4: [
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.2, 0, 0),
      new THREE.Vector3(0.4, 0, 0),
      new THREE.Vector3(0.6, 0, 0)
    ),
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.6, 0, 0),
      new THREE.Vector3(0.8, 0, 0),
      new THREE.Vector3(0.65, 0.6, 0),
      new THREE.Vector3(0.7, 0.6, 0)
    ),
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.7, 0.6, 0),
      new THREE.Vector3(0.75, 0.6, 0),
      new THREE.Vector3(0.9, 0.8, 0),
      new THREE.Vector3(1.1, 0.8, 0)
    ),
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(1.1, 0.8, 0),
      new THREE.Vector3(1.3, 0.8, 0),
      new THREE.Vector3(1.0, 1.4, 0),
      new THREE.Vector3(1.05, 1.4, 0)
    ),
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(1.05, 1.4, 0),
      new THREE.Vector3(1.1, 1.4, 0),
      new THREE.Vector3(0.8, 1.6, 0),
      new THREE.Vector3(0.7, 1.6, 0)
    ),
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.7, 1.6, 0),
      new THREE.Vector3(0.6, 1.6, 0),
      new THREE.Vector3(0.6, 1.8, 0),
      new THREE.Vector3(0.6, 1.8, 0)
    ),
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.6, 1.8, 0),
      new THREE.Vector3(0.6, 1.8, 0),
      new THREE.Vector3(0.3, 1.8, 0),
      new THREE.Vector3(0, 1.8, 0)
    )
  ]
};

// Función para generar puntos a partir de curvas Bezier
function generatePointsFromBezier(profile, segments = 20) {
  const points = [];
  profile.forEach(curve => {
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = curve.getPoint(t);
      points.push([point.x, point.y]);
    }
  });
  return points;
}

// Exportar los perfiles generados
export const profiles = {
  A1: generatePointsFromBezier(bezierProfiles.A1),
  A2: generatePointsFromBezier(bezierProfiles.A2),
  A3: generatePointsFromBezier(bezierProfiles.A3),
  A4: generatePointsFromBezier(bezierProfiles.A4)
};

/* ────────── Formas planas para barrido (B-series) ────────── */
export const shapes = {
  /* B1 – triángulo equilátero puro */
  B1: (() => {
    const s = new THREE.Shape();
    const r = 0.9;
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
    const points = [];
    
    for (let i = 0; i < N; i++) {
      const θo = i * (2 * Math.PI / N);
      const θi = θo + Math.PI / N;
      
      // Punto exterior
      points.push(new THREE.Vector3(
        R * Math.cos(θo),
        R * Math.sin(θo),
        0
      ));
      
      // Punto interior
      points.push(new THREE.Vector3(
        r * Math.cos(θi),
        r * Math.sin(θi),
        0
      ));
    }
    
    // Crear curva Catmull-Rom cerrada
    const curve = new THREE.CatmullRomCurve3(points, true);
    const curvePoints = curve.getPoints(100);
    s.moveTo(curvePoints[0].x, curvePoints[0].y);
    curvePoints.forEach(point => {
      s.lineTo(point.x, point.y);
    });
    s.closePath();
    return s;
  })(),

  /* B3 – cruz ancha con esquinas redondeadas y muescas cuadradas centradas, contorno Catmull-Rom + agujeros */
  B3: (() => {
    const s = new THREE.Shape();
    // Parámetros
    const L = 1.4;   // lado exterior total
    const r = 0.32;  // radio de esquina
    const w = 0.32;  // ancho de muesca
    const d = 0.32;  // profundidad de muesca
    const arcPoints = 6; // puntos por arco
    const points = [];
    // Comenzar en la parte superior, lado derecho de la muesca superior
    points.push(new THREE.Vector3(w/2, L/2, 0));
    // Esquina superior derecha (arco)
    for (let i = 0; i <= arcPoints; i++) {
      const theta = Math.PI/2 - (Math.PI/2) * (i / arcPoints);
      points.push(new THREE.Vector3(
        (L/2 - r) + r * Math.cos(theta),
        (L/2 - r) + r * Math.sin(theta),
        0
      ));
    }
    // Lado derecho superior hasta muesca derecha
    points.push(new THREE.Vector3(L/2, w/2, 0));
    points.push(new THREE.Vector3(L/2, -w/2, 0));
    // Esquina inferior derecha (arco)
    for (let i = 0; i <= arcPoints; i++) {
      const theta = 0 - (Math.PI/2) * (i / arcPoints);
      points.push(new THREE.Vector3(
        (L/2 - r) + r * Math.cos(theta),
        -(L/2 - r) + r * Math.sin(theta),
        0
      ));
    }
    // Lado inferior derecho hasta muesca inferior
    points.push(new THREE.Vector3(w/2, -L/2, 0));
    points.push(new THREE.Vector3(-w/2, -L/2, 0));
    // Esquina inferior izquierda (arco)
    for (let i = 0; i <= arcPoints; i++) {
      const theta = -Math.PI/2 - (Math.PI/2) * (i / arcPoints);
      points.push(new THREE.Vector3(
        -(L/2 - r) + r * Math.cos(theta),
        -(L/2 - r) + r * Math.sin(theta),
        0
      ));
    }
    // Lado izquierdo inferior hasta muesca izquierda
    points.push(new THREE.Vector3(-L/2, -w/2, 0));
    points.push(new THREE.Vector3(-L/2, w/2, 0));
    // Esquina superior izquierda (arco)
    for (let i = 0; i <= arcPoints; i++) {
      const theta = -Math.PI - (Math.PI/2) * (i / arcPoints);
      points.push(new THREE.Vector3(
        -(L/2 - r) + r * Math.cos(theta),
        (L/2 - r) + r * Math.sin(theta),
        0
      ));
    }
    // Lado superior izquierdo hasta muesca superior
    points.push(new THREE.Vector3(-w/2, L/2, 0));
    points.push(new THREE.Vector3(w/2, L/2, 0)); // Cierra
    // Catmull-Rom cerrada
    const curve = new THREE.CatmullRomCurve3(points, true);
    const curvePoints = curve.getPoints(180);
    s.moveTo(curvePoints[0].x, curvePoints[0].y);
    curvePoints.forEach(point => {
      s.lineTo(point.x, point.y);
    });
    s.closePath();
    // Agregar agujeros cuadrados centrados en cada lado
    const cutW = 0.32; // ancho del recorte cuadrado
    const cutD = 0.32; // profundidad del recorte cuadrado
    // Superior (corta el borde superior)
    const cutTop = new THREE.Path();
    cutTop.moveTo(-cutW/2, L/2);
    cutTop.lineTo(cutW/2, L/2);
    cutTop.lineTo(cutW/2, L/2 - cutD);
    cutTop.lineTo(-cutW/2, L/2 - cutD);
    cutTop.lineTo(-cutW/2, L/2);
    s.holes.push(cutTop);
    // Inferior (corta el borde inferior)
    const cutBot = new THREE.Path();
    cutBot.moveTo(-cutW/2, -L/2 + cutD);
    cutBot.lineTo(cutW/2, -L/2 + cutD);
    cutBot.lineTo(cutW/2, -L/2);
    cutBot.lineTo(-cutW/2, -L/2);
    cutBot.lineTo(-cutW/2, -L/2 + cutD);
    s.holes.push(cutBot);
    // Derecha (corta el borde derecho)
    const cutRight = new THREE.Path();
    cutRight.moveTo(L/2, -cutW/2);
    cutRight.lineTo(L/2, cutW/2);
    cutRight.lineTo(L/2 - cutD, cutW/2);
    cutRight.lineTo(L/2 - cutD, -cutW/2);
    cutRight.lineTo(L/2, -cutW/2);
    s.holes.push(cutRight);
    // Izquierda (corta el borde izquierdo)
    const cutLeft = new THREE.Path();
    cutLeft.moveTo(-L/2 + cutD, -cutW/2);
    cutLeft.lineTo(-L/2 + cutD, cutW/2);
    cutLeft.lineTo(-L/2, cutW/2);
    cutLeft.lineTo(-L/2, -cutW/2);
    cutLeft.lineTo(-L/2 + cutD, -cutW/2);
    s.holes.push(cutLeft);
    return s;
  })(),

  /* B4 – píldora vertical (capsule) */
  B4: (() => {
    const w = 0.9, h = 2.0, r = w/2;
    const s = new THREE.Shape();
    const points = [];
    const n = 12; // puntos por semicírculo
    // Semicírculo superior (de derecha a izquierda, centro en (0, h/2 - r))
    for (let i = 0; i <= n; i++) {
      const theta = 0.0 + Math.PI * (i / n);
      points.push(new THREE.Vector3(
        r * Math.cos(theta),
        (h/2 - r) + r * Math.sin(theta),
        0
      ));
    }
    // Lado izquierdo (de arriba a abajo)
    points.push(new THREE.Vector3(-r, -h/2 + r, 0));
    // Semicírculo inferior (de izquierda a derecha, centro en (0, -h/2 + r))
    for (let i = 0; i <= n; i++) {
      const theta = Math.PI + Math.PI * (i / n);
      points.push(new THREE.Vector3(
        r * Math.cos(theta),
        (-h/2 + r) + r * Math.sin(theta),
        0
      ));
    }
    // Lado derecho (de abajo a arriba)
    points.push(new THREE.Vector3(r, h/2 - r, 0));
    // Catmull-Rom cerrada
    const curve = new THREE.CatmullRomCurve3(points, true);
    const curvePoints = curve.getPoints(120);
    s.moveTo(curvePoints[0].x, curvePoints[0].y);
    curvePoints.forEach(point => {
      s.lineTo(point.x, point.y);
    });
    s.closePath();
    return s;
  })(),

  /* B5 – cruz cuadrada (anterior B3) */
  B5: (() => {
    const s = new THREE.Shape();
    // Parámetros de la cruz
    const t = 0.32; // medio ancho del brazo
    const w = 0.7;  // largo del brazo desde el centro
    // Definir los puntos de la cruz (empezando arriba, sentido antihorario)
    const points = [
      new THREE.Vector3(-t, w, 0),   // Arriba izquierda
      new THREE.Vector3(t, w, 0),    // Arriba derecha
      new THREE.Vector3(t, t, 0),    // Centro derecha arriba
      new THREE.Vector3(w, t, 0),    // Derecha arriba
      new THREE.Vector3(w, -t, 0),   // Derecha abajo
      new THREE.Vector3(t, -t, 0),   // Centro derecha abajo
      new THREE.Vector3(t, -w, 0),   // Abajo derecha
      new THREE.Vector3(-t, -w, 0),  // Abajo izquierda
      new THREE.Vector3(-t, -t, 0),  // Centro izquierda abajo
      new THREE.Vector3(-w, -t, 0),  // Izquierda abajo
      new THREE.Vector3(-w, t, 0),   // Izquierda arriba
      new THREE.Vector3(-t, t, 0),   // Centro izquierda arriba
      new THREE.Vector3(-t, w, 0)    // Cierra la cruz
    ];
    // Catmull-Rom cerrada
    const curve = new THREE.CatmullRomCurve3(points, true);
    const curvePoints = curve.getPoints(180);
    s.moveTo(curvePoints[0].x, curvePoints[0].y);
    curvePoints.forEach(point => {
      s.lineTo(point.x, point.y);
    });
    s.closePath();
    return s;
  })(),
};

/* ────────── Trayectoria recta para barrido ────────── */
export function sweepPathCatmull (h = 2) {
  return new THREE.CatmullRomCurve3(
    [ new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, h, 0) ],
    false, 'catmullrom', 0.5
  );
}
