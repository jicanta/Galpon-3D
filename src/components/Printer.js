import * as THREE from 'three';
import {
  profiles, profilesCat, shapes,
  sweepPathCatmull
} from '../utils/Shapes.js';

export class Printer {
  constructor () {
    /* ---------- estructura fija ---------- */
    this.root = new THREE.Group();
    this.root.position.set(-22, 0, -6);

    const mBase = new THREE.MeshStandardMaterial({ color: 0x3a6aa8 });
    const base  = new THREE.Mesh(new THREE.BoxGeometry(3, 0.6, 3), mBase);
    base.position.y = 0.3;
    const col   = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4, 0.3), mBase);
    col.position.y = 2;
    this.root.add(base, col);

    /* cabezal (sube pero NO contiene al objeto) */
    this.head = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.4, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x1ba21b })
    );
    this.head.position.y = 0.;
    this.root.add(this.head);

    /* ---------- estado & parámetros ---------- */
    this.params = {
      mode : 'revolution',     // revolution | sweep
      curve: 'Bezier',         // Bezier | Catmull
      form : 'A1',             // A*, C*, B*
      height: 2,
      twist : 0
    };
    this.scale = 0.7;
    this.obj   = null;
    this.t     = 0;            // progreso 0‒1
    this.speed = 0.5;          // m/s de cabezal
  }

  /* ---------- genera nuevo objeto ---------- */
  generate () {
    /* limpiar anterior */
    if (this.obj) {
      this.obj.parent.remove(this.obj);
      this.obj.geometry.dispose(); this.obj.material.dispose();
    }

    const { mode, curve, form, height, twist } = this.params;
    const S = this.scale;

    let geo;
    if (mode === 'revolution') {
      const raw = (curve === 'Bezier') ? profiles[form] : profilesCat[form];
      const pts = raw.map(([x, y]) => new THREE.Vector2(x * S, (y / 2) * height * S));
      geo = new THREE.LatheGeometry(pts, 64);
    } else { /* sweep */
      const shape = shapes[form];
      const path  = (curve === 'Bezier')
        ? new THREE.LineCurve3(
            new THREE.Vector3(0, -height * S / 2, 0),
            new THREE.Vector3(0,  height * S / 2, 0))
        : sweepPathCatmull(height * S);

      geo = new THREE.ExtrudeGeometry(shape, { steps: 120, bevelEnabled: false, extrudePath: path });
      geo.rotateY(THREE.MathUtils.degToRad(twist));
      geo.scale(S, S, S);
    }

    this.obj = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xff5533 }));
    this.obj.position.set(0, 0, 0);     // sobre la base
    this.obj.scale.set(1, 0.001, 1);    // empieza “aplastado” (crece en Y)
    this.root.add(this.obj);

    /* reset animación */
    this.t = 0;
    this.head.visible = true;
    this.head.position.y = 0.4;
  }

  /* ---------- animación por frame ---------- */
  update (dt) {
    if (!this.obj) return;

    const h = this.params.height * this.scale;
    this.t  = Math.min(this.t + (this.speed * dt) / h, 1);

    /* el cabezal asciende */
    this.head.position.y = 0.4 + this.t * h;

    /* la pieza crece suavemente en Y */
    this.obj.scale.y = this.t;

    /* cuando termina, ocultamos cabezal opcionalmente */
    if (this.t >= 1 && this.head.visible) this.head.visible = false;
    // esto puedo cambiarlo si quiero que se siga viendo el cabezal verde
  }

  /* ---------- util ---------- */
  currentObject () { return this.obj; }
  detachObject  () {
    const o = this.obj;
    if (o) this.obj = null;
    return o;
  }
  center () {
    return new THREE.Vector3().setFromMatrixPosition(this.root.matrixWorld);
  }
}
