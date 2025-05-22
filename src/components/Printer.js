// src/printer/Printer.js
import * as THREE from 'three';
import { profiles, shapes } from '../utils/Shapes.js';

export class Printer {
  constructor () {
    /* ─ grupo raíz ─ */
    this.root = new THREE.Group();
    this.root.position.set(-12, 0, -6);

    /* ─ chasis visual ─ */
    this.#buildPedestal();
    this.#buildColumn();
    this.#buildHead();

    /* ─ plano de impresión ─ */
    this.printPlane = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.05, 1.2),  // Alargado en Z para que sobresalga
      new THREE.MeshStandardMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
      })
    );
    // Posicionado para que sobresalga del cabezal hacia el centro
    this.printPlane.position.set(0, this.buildPlateY, -0.3);  // Movido hacia adelante
    this.printPlane.receiveShadow = true;
    this.root.add(this.printPlane);

    /* ─ parámetros GUI ─ */
    this.params = {
      mode  : 'revolution',   // 'revolution' | 'sweep'
      form  : 'A1',           // A1-A4 o B1-B4
      height: 2,              // unidades de escena
      twist : 0,              // grados (solo barrido)
      color : '#8e9eb9'
    };

    this.scale = 0.7;         // factor radial (X-Z)
    this.obj   = null;        // pieza impresa
    this.t     = 0;           // progreso 0-1
    this.speed = 0.5;         // unid. altura / segundo
  }

  /* ╔═ chasis estático ═╗ */
  #buildPedestal () {
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2.2, 0.6, 32),
      new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.35 })
    );
    base.position.y = 0.3; base.receiveShadow = true;
    this.root.add(base);

    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 1.8, 0.05, 32),
      new THREE.MeshStandardMaterial({
        color: 0x88cfff, roughness: 0.05,
        metalness: 0.2, transparent: true, opacity: 0.65
      })
    );
    plate.position.y = 0.63; plate.receiveShadow = true;
    this.buildPlateY = plate.position.y + 0.025;
    this.root.add(plate);
  }

  #buildColumn () {
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 4.5, 24),
      new THREE.MeshStandardMaterial({ color: 0xbbc4d0, roughness: 0.2 })
    );
    col.position.set(0, 2.85, -0.9);
    this.root.add(col);
  }

  #buildHead () {
    this.head = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.4, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x00ff00 })
    );
    this.head.castShadow = true;

    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.15, 0.15),
      new THREE.MeshStandardMaterial({ color: 0x22bb22 })
    );
    bar.position.set(0, 0.27, 0);
    this.head.add(bar);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.35, 0.025, 8, 20),
      new THREE.MeshBasicMaterial({ color: 0x00ffea })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.18;
    this.head.add(ring);

    this.head.position.set(0, this.buildPlateY + 0.4, -0.9);
    this.root.add(this.head);
  }

  /* ╔═ generar pieza ═╗ */
  generate () {
    /* limpia anterior */
    if (this.obj) {
      this.obj.geometry.dispose();
      this.obj.material.dispose();
      this.root.remove(this.obj);
      this.obj = null;
    }

    const { mode, form, height, twist, color } = this.params;
    const S = this.scale;
    let geo;

    if (mode === 'revolution') {
      /* ─ revolución (Lathe) ─ */
      const raw = profiles[form];
      if (!raw) { console.warn(`Perfil ${form} no existe`); return; }

      const maxY = raw.reduce((m, [, y]) => Math.max(m, y), 0);
      const pts  = raw.map(([x, y]) =>
        new THREE.Vector2(x * S, (y / maxY) * height)
      );
      geo = new THREE.LatheGeometry(pts, 64);

    } else {
      /* ─ barrido ─ */
      const shape = shapes[form];
      if (!shape) { console.warn(`Shape ${form} no existe`); return; }

      /* 1. Extrusión "profundidad" Z = height */
      geo = new THREE.ExtrudeGeometry(shape, {
        depth        : height,
        steps        : 140,
        bevelEnabled : false
      });

      /* 2. Escala radial (X-Y) */
      geo.scale(S, S, 1);

      /* 3. Rota −90° en X ⇒ eje Z (profundidad) → eje Y (altura) */
      geo.rotateX(-Math.PI / 2);

      /* 4. Torsión progresiva en torno al eje Y */
      const pos      = geo.attributes.position;
      const twistRad = THREE.MathUtils.degToRad(twist);
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);                 // 0 → height
        const a = (y / height) * twistRad;     // ángulo parcial

        const x = pos.getX(i);
        const z = pos.getZ(i);

        pos.setXYZ(i,
          x * Math.cos(a) - z * Math.sin(a),
          y,
          x * Math.sin(a) + z * Math.cos(a)
        );
      }
      pos.needsUpdate = true;
    }

    /* base a Y = 0 */
    geo.computeBoundingBox();
    geo.translate(0, -geo.boundingBox.min.y, 0);

    /* mesh final */
    this.obj = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({ color, metalness: 0.25, roughness: 0.4 })
    );
    this.obj.scale.y = 0;                       // inicia "vacía"
    this.obj.position.set(0, this.buildPlateY, 0);
    this.obj.castShadow = this.obj.receiveShadow = true;
    this.root.add(this.obj);

    this.t = 0;                                 // reinicia anim
  }

  /* ╔═ animar frame a frame ═╗ */
  update (dt) {
    if (!this.obj) return;

    const h = this.params.height;
    this.t  = Math.min(this.t + (this.speed * dt) / h, 1);

    this.obj.scale.y      = this.t;                         // crecer
    this.head.position.y  = this.buildPlateY + h * this.t + 0.4; // cabezal
    this.printPlane.position.y = this.buildPlateY + h * this.t + 0.2;  // plano de impresión, ligeramente por encima
  }

  /* ╔═ utilidades ═╗ */
  currentObject () { return this.obj; }
  detachObject   () { const o=this.obj; if(o){ this.obj=null; this.root.remove(o);} return o; }
  center         () { return new THREE.Vector3().setFromMatrixPosition(this.root.matrixWorld); }
}
