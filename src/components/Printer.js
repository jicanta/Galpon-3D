import * as THREE from 'three';
import { profiles, shapes } from '../utils/Shapes.js';

/**
 * Impresora 3‑D con animación layer‑by‑layer (sin escalado de la pieza).
 * El objeto se "revela" mediante un plano de recorte dinámico; la tapa
 * verde (capa de impresión) se ha elevado 5 cm para mayor holgura.
 * ------------------------------------------------------------------
 * 🔸  renderer.localClippingEnabled = true
 * ------------------------------------------------------------------
 */
export class Printer {
  constructor () {
    /* ─ configuración general ─ */
    this.scale   = 0.7;   // factor radial (X‑Z)
    this.obj     = null;  // mesh de la pieza en curso
    this.t       = 0;     // progreso 0‑1
    this.speed   = 0.5;   // unidades de altura por segundo

    /* ─ escena raíz ─ */
    this.root = new THREE.Group();
    this.root.position.set(-12, 0, -6);

    /* ─ chasis ─ */
    this.#buildPedestal();
    this.#buildColumn();
    this.#buildHead();

    /* ─ offsets y clipping ─ */
    this.clipPlaneOffset  = 0.0005; // evita z‑fighting con la pieza
    this.printPlaneLift   = 0.15;   // +15 cm de separación visual
    this.clipPlane        = new THREE.Plane(
      new THREE.Vector3(0, -1, 0),
      this.buildPlateY + this.clipPlaneOffset
    );

    /* ─ capa de impresión visual ─ */
    const printMat = new THREE.MeshStandardMaterial({
      color       : 0x00ff00,
      transparent : true,
      opacity     : 0.7,
      side        : THREE.DoubleSide,
      depthWrite  : false,
      polygonOffset      : true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits : -1
    });
    this.printPlane = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 1.2), printMat);
    this.printPlane.position.set(0, this.buildPlateY + this.printPlaneLift, -0.3);
    this.printPlane.receiveShadow = true;
    this.printPlane.renderOrder   = 2;
    this.root.add(this.printPlane);

    /* ─ parámetros GUI ─ */
    this.params = {
      mode  : 'revolution',
      form  : 'A1',
      height: 2,
      twist : 0,
      color : '#8e9eb9',
      material: 'matte',
      speed: 0.5
    };

    // Luz direccional pequeña para resaltar el objeto impreso
    this.miniLight = new THREE.DirectionalLight(0xffffff, 0.7);
    this.miniLight.position.set(1.5, 3, 2);
    this.miniLight.target.position.set(0, 1, 0);
    this.root.add(this.miniLight);
    this.root.add(this.miniLight.target);
  }

  /* ╔═ chasis estático ═╗ */
  #buildPedestal () {
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2.2, 0.6, 32),
      new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.35 })
    );
    base.position.y = 0.3;
    base.receiveShadow = true;
    this.root.add(base);

    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 1.8, 0.05, 32),
      new THREE.MeshStandardMaterial({
        color: 0x88cfff,
        roughness: 0.05,
        metalness: 0.2,
        transparent: true,
        opacity: 0.65
      })
    );
    plate.position.y = 0.63;
    plate.receiveShadow = true;
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

  /* ╔═ generar nueva pieza ═╗ */
  generate () {
    if (this.obj) {
      this.obj.geometry.dispose();
      (Array.isArray(this.obj.material) ? this.obj.material : [this.obj.material]).forEach(m => m.dispose());
      this.root.remove(this.obj);
      this.obj = null;
    }

    const { mode, form, height, twist, color, material } = this.params;
    const S = this.scale;
    let geo;

    if (mode === 'revolution') {
      const raw = profiles[form];
      if (!raw) { console.warn(`Perfil ${form} no existe`); return; }
      const maxY = raw.reduce((m, [, y]) => Math.max(m, y), 0);
      geo = new THREE.LatheGeometry(raw.map(([x, y]) => new THREE.Vector2(Math.abs(x) * S, (y / maxY) * height)), 64);
    } else {
      const shape = shapes[form];
      if (!shape) { console.warn(`Shape ${form} no existe`); return; }

      geo = new THREE.ExtrudeGeometry(shape, { depth: height, steps: 140, bevelEnabled: false });
      geo.scale(S, S, 1);
      geo.rotateX(-Math.PI / 2);

      const pos = geo.attributes.position;
      const twistRad = THREE.MathUtils.degToRad(twist);
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        const a = (y / height) * twistRad;
        const x = pos.getX(i);
        const z = pos.getZ(i);
        pos.setXYZ(i, x * Math.cos(a) - z * Math.sin(a), y, x * Math.sin(a) + z * Math.cos(a));
      }
      pos.needsUpdate = true;
    }

    // Presets de materiales
    const materialPresets = {
      matte:    { metalness: 0.1, roughness: 0.8, opacity: 1 },
      shiny:    { metalness: 0.7, roughness: 0.2, opacity: 1 },
      metallic: { metalness: 1.0, roughness: 0.3, opacity: 1 },
      plastic:  { metalness: 0.0, roughness: 0.4, opacity: 1 },
      glass:    { metalness: 0.2, roughness: 0.05, opacity: 0.5, transparent: true },
    };
    const preset = materialPresets[material] || materialPresets.matte;

    const mat = new THREE.MeshStandardMaterial({
      color,
      metalness : preset.metalness,
      roughness : preset.roughness,
      opacity   : preset.opacity,
      transparent: preset.transparent || false,
      clippingPlanes: [this.clipPlane],
      clipShadows : true
    });

    this.obj = new THREE.Mesh(geo, mat);
    geo.computeBoundingBox();
    this.obj.position.set(0, this.buildPlateY - geo.boundingBox.min.y, 0);
    this.obj.castShadow = this.obj.receiveShadow = true;
    this.root.add(this.obj);

    this.t = 0;
    this.clipPlane.constant = this.buildPlateY + this.clipPlaneOffset;
  }

  /* ╔═ animación por frame ═╗ */
  update (dt) {
    if (!this.obj) return;

    this.speed = this.params.speed;

    const h = this.params.height;
    this.t  = Math.min(this.t + (this.speed * dt) / h, 1);

    const planeY = this.buildPlateY + h * this.t + this.clipPlaneOffset;
    this.clipPlane.constant   = planeY;
    this.printPlane.position.y = planeY + this.printPlaneLift;
    this.head.position.y       = planeY + 0.4 - this.clipPlaneOffset;
  }

  /* ╔═ utilidades ═╗ */
  currentObject () { return this.obj; }

  detachObject () {
    const o = this.obj;
    if (o) {
      (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { m.clippingPlanes = null; m.needsUpdate = true; });
      this.obj = null;
      this.root.remove(o);
    }
    return o;
  }

  center () { return new THREE.Vector3().setFromMatrixPosition(this.root.matrixWorld); }
}
