import * as THREE from 'three';

export class Shelf {
  constructor () {
    /* ───────── configuración ───────── */
    this.cols       = 8;     // espacios horizontales
    this.levels     = 2;     // SOLO 2 estantes (medio y alto)
    this.slotW      = 2.5;   // ancho
    this.depth      = 2.0;   // fondo
    this.offsetY    = 1.5;   // altura del 1.er estante
    this.levelSpan  = 2.9;   // distancia entre estantes  → hueco vertical mayor
    this.hGap       = 0.12;  // holgura lateral
    this.vGap       = 0.25;  // holgura vertical

    /* ───────── raíz ───────── */
    this.root = new THREE.Group();
    this.root.position.set(14, 0, -3);

    const metal  = new THREE.MeshStandardMaterial({ color: 0x8a9756, roughness: 0.6 });
    const plankM = new THREE.MeshStandardMaterial({ color: 0xa0e8ff, roughness: 0.35 });

    /* alturas derivadas */
    const uprH   = this.offsetY + this.levelSpan * this.levels + 0.3; // + tapa
    const beamT  = 0.15;
    const plankT = 0.13;

    /* ───────── postes verticales ───────── */
    const uprGeo = new THREE.BoxGeometry(0.2, uprH, 0.2);
    const upr = new THREE.InstancedMesh(uprGeo, metal, (this.cols + 1) * 2);
    let idx = 0;
    for (let c = 0; c <= this.cols; c++) {
      const x = c * this.slotW - (this.cols * this.slotW) / 2;
      [ this.depth / 2, -this.depth / 2 ].forEach(z => {
        upr.setMatrixAt(idx++, new THREE.Matrix4().makeTranslation(x, uprH / 2, z));
      });
    }
    this.root.add(upr);

    /* ───────── vigas horizontales ───────── */
    const beamGeoX = new THREE.BoxGeometry(this.slotW * this.cols, beamT, 0.12);
    const beamGeoZ = new THREE.BoxGeometry(0.12, beamT, this.depth);
    const beams = new THREE.Group();
    for (let l = 0; l <= this.levels; l++) {
      const y = this.offsetY + l * this.levelSpan;
      [ this.depth / 2 - 0.06, -this.depth / 2 + 0.06 ].forEach(z => {
        const bx = new THREE.Mesh(beamGeoX, metal);
        bx.position.set(0, y, z); beams.add(bx);
      });
      for (let c = 0; c <= this.cols; c++) {
        const x = c * this.slotW - (this.cols * this.slotW) / 2;
        const bz = new THREE.Mesh(beamGeoZ, metal);
        bz.position.set(x, y, 0); beams.add(bz);
      }
    }
    this.root.add(beams);

    /* ───────── tarimas (solo 2 niveles) ───────── */
    const plankGeo = new THREE.BoxGeometry(this.slotW - 0.1, plankT, this.depth - 0.18);
    for (let l = 0; l < this.levels; l++) {
      const yPlank = this.offsetY - plankT / 2 + l * this.levelSpan;
      for (let c = 0; c < this.cols; c++) {
        const plank = new THREE.Mesh(plankGeo, plankM);
        plank.position.set(
          c * this.slotW - (this.cols * this.slotW) / 2 + this.slotW / 2,
          yPlank,
          0
        );
        plank.receiveShadow = true;
        this.root.add(plank);
      }
    }

    /* ───────── slots disponibles ───────── */
    this.freeSlots = [];
    for (let l = 0; l < this.levels; l++) {
      for (let c = 0; c < this.cols; c++) {
        this.freeSlots.push({ level: l, col: c, occupied: false });
      }
    }

    /* ───────── highlight ───────── */
    const lvlH = this.levelSpan;
    const hGeo = new THREE.BoxGeometry(
      this.slotW - this.hGap * 2,
      lvlH      - this.vGap * 2,
      this.depth - 0.18
    );
    const hMat = new THREE.MeshBasicMaterial({
      color: 0x00ff00, opacity: 0.22, transparent: true, depthWrite: false });
    this.highlight = new THREE.Mesh(hGeo, hMat);
    this.highlight.visible = false;
    this.root.add(this.highlight);
  }

  /* ═════ API pública ═════ */

  addObject (obj) {
    const slot = this.freeSlots.find(s => !s.occupied);
    if (!slot) return false;

    const x = slot.col * this.slotW - (this.cols * this.slotW) / 2 + this.slotW / 2;
    const yBase = this.offsetY + slot.level * this.levelSpan + this.vGap;
    obj.position.set(x, yBase, 0);
    obj.rotation.set(0, 0, 0);
    obj.scale.set(1, 1, 1);
    this.root.add(obj);

    slot.occupied = true;
    this.highlight.visible = false;
    return true;
  }

  showHighlight () {
    const slot = this.freeSlots.find(s => !s.occupied);
    if (!slot) { this.highlight.visible = false; return; }

    const x = slot.col * this.slotW - (this.cols * this.slotW) / 2 + this.slotW / 2;
    const yMid = this.offsetY + slot.level * this.levelSpan + this.levelSpan / 2;
    this.highlight.position.set(x, yMid, 0);
    this.highlight.visible = true;
  }
  hideHighlight () { this.highlight.visible = false; }

  center () {
    return new THREE.Vector3().setFromMatrixPosition(this.root.matrixWorld);
  }
}
