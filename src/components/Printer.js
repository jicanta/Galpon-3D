import * as THREE from 'three';
import { profiles, shapes, sweepPathCatmull } from '../utils/Shapes.js';

/**
 * 3-D Printer
 * -----------
 * • mode  : 'revolution' | 'sweep'
 * • form  : 'A1'-'A4' | 'B1'-'B4'
 * • height: user-chosen height (scene units)
 * • twist : torsión (sweep únicamente)
 */
export class Printer {
  constructor () {
    /* ─── main group ─── */
    this.root = new THREE.Group();
    this.root.position.set(-12, 0, -6);

    /* ─── visual chassis ─── */
    this.#buildPedestal();
    this.#buildColumn();
    this.#buildHead();

    /* ─── parameters (GUI) ─── */
    this.params = {
      mode  : 'revolution',
      form  : 'A1',
      height: 2,
      twist : 0,
      curve : 'Bezier'
    };

    this.scale = 0.7;      // radio-escala general
    this.obj   = null;     // pieza en impresión
    this.t     = 0;        // progreso 0-1
    this.speed = 0.5;      // velocidad relativa
  }

/* ╔═════════════ visual building ═════════════╗ */
  #buildPedestal () {
    const mat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.35 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.2, 0.6, 32), mat);
    base.position.y = 0.3;
    base.receiveShadow = true;
    this.root.add(base);

    /* build-plate (glass) */
    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 1.8, 0.05, 32),
      new THREE.MeshStandardMaterial({ color: 0x88cfff, roughness: 0.05,
                                       metalness: 0.2, transparent: true,
                                       opacity: 0.65 })
    );
    plate.position.y = 0.63;
    plate.receiveShadow = true;
    this.buildPlateY = plate.position.y + 0.025; // top surface
    this.root.add(plate);
  }

  #buildColumn () {
    const mat = new THREE.MeshStandardMaterial({ color: 0xbbc4d0, roughness: 0.2 });
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 4.5, 24), mat);
    col.position.set(0, 2.85, -0.9);
    this.root.add(col);
  }

  #buildHead () {
    /* print-head housing */
    const headGeo = new THREE.BoxGeometry(0.6, 0.4, 0.6);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x20242a });
    this.head = new THREE.Mesh(headGeo, headMat);
    this.head.castShadow = true;

    /* LED ring indicator */
    const ringGeo = new THREE.TorusGeometry(0.35, 0.025, 8, 20);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffea });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.18;
    this.head.add(ring);

    /* position head at start height */
    this.head.position.set(0, this.buildPlateY + 0.4, -0.9);
    this.root.add(this.head);
  }

/* ╔═════════════ printing pipeline ═════════════╗ */
  generate () {
    /* remove previous */
    if (this.obj) {
      this.obj.geometry.dispose();
      this.obj.material.dispose();
      this.root.remove(this.obj);
      this.obj = null;
    }

    const { mode, form, height, twist } = this.params;
    const S = this.scale;
    let geo;

    if (mode === 'revolution') {
      /* -------- Bézier profiles A-series -------- */
      const raw = profiles[form];
      if (!raw) { console.warn(`Perfil ${form} no existe`); return; }

      const pts = raw.map(v => new THREE.Vector2(v[0] * S, v[1] * height));
      geo = new THREE.LatheGeometry(pts, 64);

    } else { // sweep
      /* -------- Catmull shapes B-series -------- */
      const sh = shapes[form];
      if (!sh) { console.warn(`Shape ${form} no existe`); return; }

      const path = sweepPathCatmull(height);           // 0 ➜ height
      geo = new THREE.ExtrudeGeometry(sh, {
        steps: 120, bevelEnabled: false, extrudePath: path
      });
      geo.scale(S, 1, S);   // solo radio, NO alto
      geo.rotateY(THREE.MathUtils.degToRad(twist));
    }

    /* mover base a Y=0 para que crezca hacia arriba */
    geo.computeBoundingBox();
    const minY = geo.boundingBox.min.y;
    geo.translate(0, -minY, 0);

    /* mesh */
    this.obj = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({ color: 0x8e9eb9, metalness: 0.25, roughness: 0.4 })
    );
    this.obj.scale.y = 0;                   // inicia invisible (altura 0)
    this.obj.position.set(0, this.buildPlateY, 0);
    this.obj.castShadow = this.obj.receiveShadow = true;
    this.root.add(this.obj);

    /* reset anim */
    this.t = 0;
  }

  update (dt) {
    if (!this.obj) return;

    const h = this.params.height;           // altura real
    this.t  = Math.min(this.t + (this.speed * dt) / h, 1);

    /* crecer pieza */
    this.obj.scale.y = this.t;

    /* subir print-head en sincronía */
    this.head.position.y = this.buildPlateY + h * this.t + 0.4;
  }

/* ╔═════════════ utilidades ═════════════╗ */
  currentObject () { return this.obj; }

  detachObject () {
    const o = this.obj;
    if (o) {
      this.obj = null;
      this.root.remove(o);
    }
    return o;
  }

  center () {
    return new THREE.Vector3().setFromMatrixPosition(this.root.matrixWorld);
  }
}
