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
      new THREE.Vector3(0.2778, 1.5, 0)
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
      new THREE.Vector3(0.3, 2.5, 0),
      new THREE.Vector3(0, 2.5, 0)
    )
  ],

  /* A3 – base en punta + parte alta curva */
  A3: [
    /* Tramo horizontal superior */
    new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0.000, 1.000, 0),  // ( 0 ,14)
      new THREE.Vector3(0.214, 1.000, 0),  // (-3 ,14)
      new THREE.Vector3(0.429, 1.000, 0)   // (-6 ,14)
    ),
  
    /* Bajada vertical suave */
    new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0.429, 1.000, 0),  // (-6 ,14)
      new THREE.Vector3(0.429, 0.929, 0),  // (-6 ,13)
      new THREE.Vector3(0.429, 0.857, 0)   // (-6 ,12)
    ),
  
    /* Primer redondeo ancho-estrecho */
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.429, 0.857, 0),  // (-6 ,12)
      new THREE.Vector3(0.071, 0.786, 0),  // (-1 ,11)
      new THREE.Vector3(0.214, 0.714, 0),  // (-3 ,10)
      new THREE.Vector3(0.286, 0.500, 0)   // (-4 , 7)
    ),
  
    /* Segundo redondeo estrecho-ancho */
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.286, 0.500, 0),  // (-4 , 7)
      new THREE.Vector3(0.214, 0.286, 0),  // (-3 , 4)
      new THREE.Vector3(0.071, 0.214, 0),  // (-1 , 3)
      new THREE.Vector3(0.429, 0.143, 0)   // (-6 , 2)
    ),
  
    /* Bajada vertical a la base */
    new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0.429, 0.143, 0),  // (-6 , 2)
      new THREE.Vector3(0.429, 0.071, 0),  // (-6 , 1)
      new THREE.Vector3(0.429, 0.000, 0)   // (-6 , 0)
    ),
  
    /* Tramo horizontal inferior de vuelta al eje */
    new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0.429, 0.000, 0),  // (-6 , 0)
      new THREE.Vector3(0.214, 0.000, 0),  // (-3 , 0)
      new THREE.Vector3(0.000, 0.000, 0)   // ( 0 , 0)
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
      new THREE.Vector3(0.3, 2.3, 0),
      new THREE.Vector3(0, 2.3, 0)
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
  /* B1 – triángulo equilátero con curvas Bézier cuadráticas */
  B1: (() => {
    const s = new THREE.Shape();
    const r = 0.9;  // radio del triángulo
    const points = [];
    
    // Calcular los tres vértices del triángulo
    const vertices = [];
    for (let i = 0; i < 3; i++) {
      const θ = Math.PI / 2 + i * (2 * Math.PI / 3);
      vertices.push(new THREE.Vector3(
        r * Math.cos(θ),
        r * Math.sin(θ),
        0
      ));
    }

    // Crear las curvas Bézier cuadráticas entre cada par de vértices
    for (let i = 0; i < 3; i++) {
      const start = vertices[i];
      const end = vertices[(i + 1) % 3];
      
      // Calcular el punto medio para usar como punto de control
      const midPoint = new THREE.Vector3(
        (start.x + end.x) / 2,
        (start.y + end.y) / 2,
        0
      );

      // Crear la curva Bézier cuadrática
      const curve = new THREE.QuadraticBezierCurve3(
        start,
        midPoint,
        end
      );

      // Obtener puntos de la curva
      const curvePoints = curve.getPoints(20);
      if (i === 0) {
        s.moveTo(curvePoints[0].x, curvePoints[0].y);
      }
      curvePoints.forEach(point => {
        s.lineTo(point.x, point.y);
      });
    }
    
    s.closePath();
    return s;
  })(),

  /* B2 – estrella de 8 puntas suave */
  B2: (() => {
    const s = new THREE.Shape();
    const R = 0.85;          // radio exterior
    const r = 0.45;          // radio interior (aumentado de 0.35 a 0.65 para curvas más suaves)
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

  /* B3 – cruz ancha con esquinas redondeadas y muescas cuadradas centradas, contorno Catmull-Rom */
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
    points.push(new THREE.Vector3(w/2, L/2 - d, 0));
    points.push(new THREE.Vector3(-w/2, L/2 - d, 0));
    points.push(new THREE.Vector3(-w/2, L/2, 0));

    // Esquina superior izquierda (arco)
    for (let i = 0; i <= arcPoints; i++) {
      const theta = -Math.PI - (Math.PI/2) * (i / arcPoints);
      points.push(new THREE.Vector3(
        -(L/2 - r) + r * Math.cos(theta),
        (L/2 - r) + r * Math.sin(theta),
        0
      ));
    }

    // Lado izquierdo superior hasta muesca izquierda
    points.push(new THREE.Vector3(-L/2, w/2, 0));
    points.push(new THREE.Vector3(-L/2 + d, w/2, 0));
    points.push(new THREE.Vector3(-L/2 + d, -w/2, 0));
    points.push(new THREE.Vector3(-L/2, -w/2, 0));

    // Esquina inferior izquierda (arco)
    for (let i = 0; i <= arcPoints; i++) {
      const theta = -Math.PI/2 - (Math.PI/2) * (i / arcPoints);
      points.push(new THREE.Vector3(
        -(L/2 - r) + r * Math.cos(theta),
        -(L/2 - r) + r * Math.sin(theta),
        0
      ));
    }

    // Lado inferior izquierdo hasta muesca inferior
    points.push(new THREE.Vector3(-w/2, -L/2, 0));
    points.push(new THREE.Vector3(-w/2, -L/2 + d, 0));
    points.push(new THREE.Vector3(w/2, -L/2 + d, 0));
    points.push(new THREE.Vector3(w/2, -L/2, 0));

    // Esquina inferior derecha (arco)
    for (let i = 0; i <= arcPoints; i++) {
      const theta = 0 - (Math.PI/2) * (i / arcPoints);
      points.push(new THREE.Vector3(
        (L/2 - r) + r * Math.cos(theta),
        -(L/2 - r) + r * Math.sin(theta),
        0
      ));
    }

    // Lado derecho inferior hasta muesca derecha
    points.push(new THREE.Vector3(L/2, -w/2, 0));
    points.push(new THREE.Vector3(L/2 - d, -w/2, 0));
    points.push(new THREE.Vector3(L/2 - d, w/2, 0));
    points.push(new THREE.Vector3(L/2, w/2, 0));

    // Esquina superior derecha (arco)
    for (let i = 0; i <= arcPoints; i++) {
      const theta = Math.PI/2 - (Math.PI/2) * (i / arcPoints);
      points.push(new THREE.Vector3(
        (L/2 - r) + r * Math.cos(theta),
        (L/2 - r) + r * Math.sin(theta),
        0
      ));
    }

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
export function sweepPathCatmull (h = 4) {
  return new THREE.CatmullRomCurve3(
    [ new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, h, 0) ],
    false, 'catmullrom', 0.5
  );
}
