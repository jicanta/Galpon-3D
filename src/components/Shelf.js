import * as THREE from 'three';

export class Shelf {
  constructor () {
    /* ───────── configuración ───────── */
    this.cols       = 8;     // espacios horizontales
    this.levels     = 2;     // SOLO 2 estantes (medio y alto)
    this.slotW      = 2.5;   // ancho
    this.depth      = 2.0;   // fondo
    this.offsetY    = 2.5;   // altura del 1.er estante (aumentado de 1.5 a 2.0)
    this.levelSpan  = 3.5;   // distancia entre estantes (aumentado de 2.9 a 3.5)
    this.hGap       = 0.12;  // holgura lateral
    this.vGap       = 0.0;  // holgura vertical (aumentado de 0.25 a 0.35)

    /* ───────── raíz ───────── */
    this.root = new THREE.Group();
    this.root.position.set(14, 0, -3);

    const metal  = new THREE.MeshPhongMaterial({ color: 0x8a9756, shininess: 80 });
    const plankM = new THREE.MeshPhongMaterial({ color: 0xa0e8ff, shininess: 120 });

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
        bx.position.set(0, y, z);
        beams.add(bx);
      });
      for (let c = 0; c <= this.cols; c++) {
        const x = c * this.slotW - (this.cols * this.slotW) / 2;
        const bz = new THREE.Mesh(beamGeoZ, metal);
        bz.position.set(x, y, 0);
        beams.add(bz);
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
        plank.castShadow = true;
        this.root.add(plank);

        // Añadir luz puntual para cada slot
        const slotLight = new THREE.PointLight(0xffffff, 0.4, 3, 2);
        slotLight.position.set(
          c * this.slotW - (this.cols * this.slotW) / 2 + this.slotW / 2,
          yPlank + 0.5, // 0.5 unidades por encima del estante
          0
        );
        this.root.add(slotLight);
        
        // Agregar plaquitas identificadoras en cada slot
        const labelGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.02);
        const labelMaterial = new THREE.MeshPhongMaterial({ 
          color: 0xffffcc, 
          shininess: 100 
        });
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        label.position.set(
          c * this.slotW - (this.cols * this.slotW) / 2 + this.slotW / 2,
          yPlank + 0.15,
          this.depth / 2 - 0.05
        );
        label.castShadow = true;
        label.receiveShadow = true;
        this.root.add(label);
        
        // Texto en la plaquita (usando un pequeño plano con color)
        const textGeometry = new THREE.BoxGeometry(0.25, 0.05, 0.01);
        const textMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x222222 
        });
        const text = new THREE.Mesh(textGeometry, textMaterial);
        text.position.set(
          c * this.slotW - (this.cols * this.slotW) / 2 + this.slotW / 2,
          yPlank + 0.15,
          this.depth / 2 - 0.04
        );
        this.root.add(text);
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

  findClosestSlot(tipPosition) {
    let closestSlot = null;
    let minDistance = Infinity;
    
    for (const slot of this.freeSlots) {
      const x = slot.col * this.slotW - (this.cols * this.slotW) / 2 + this.slotW / 2;
      const y = this.offsetY + slot.level * this.levelSpan + this.vGap;
      const slotPos = new THREE.Vector3(x, y, 0);
      slotPos.applyMatrix4(this.root.matrixWorld);
      
      const distance = tipPosition.distanceTo(slotPos);
      if (distance < minDistance) {
        minDistance = distance;
        closestSlot = slot;
      }
    }
    
    return { slot: closestSlot, distance: minDistance };
  }

  findClosestObject(tipPosition) {
    let closestObject = null;
    let minDistance = Infinity;
    
    // Check all children of the shelf
    for (const child of this.root.children) {
      // Skip non-mesh objects, highlight, and structural elements
      if (!(child instanceof THREE.Mesh) || 
          child === this.highlight || 
          child.material.color.getHex() === 0xa0e8ff || // Skip planks (light blue)
          child.material.color.getHex() === 0x8a9756 || // Skip metal beams (greenish)
          child.material.color.getHex() === 0xffffcc || // Skip labels
          child.material.color.getHex() === 0x222222) { // Skip text
        continue;
      }
      
      const objPos = new THREE.Vector3();
      child.getWorldPosition(objPos);
      
      const distance = tipPosition.distanceTo(objPos);
      if (distance < minDistance) {
        minDistance = distance;
        closestObject = child;
      }
    }
    
    return { object: closestObject, distance: minDistance };
  }

  removeObject(obj) {
    // Find the slot that contains this object
    const objPos = new THREE.Vector3();
    obj.getWorldPosition(objPos);
    
    // Convert to local coordinates without modifying the original matrix
    const invertedMatrix = this.root.matrixWorld.clone().invert();
    objPos.applyMatrix4(invertedMatrix);
    
    for (const slot of this.freeSlots) {
      if (slot.occupied) {
        const x = slot.col * this.slotW - (this.cols * this.slotW) / 2 + this.slotW / 2;
        const y = this.offsetY + slot.level * this.levelSpan + this.vGap;
        const slotPos = new THREE.Vector3(x, y, 0);
        
        if (objPos.distanceTo(slotPos) < 1.0) { // Increased tolerance
          slot.occupied = false;
          this.root.remove(obj);
          return true;
        }
      }
    }
    return false;
  }

  addObject(obj, tipPosition) {
    const { slot, distance } = this.findClosestSlot(tipPosition);
    
    if (!slot || distance > 5 || slot.occupied) return false;

    const x = slot.col * this.slotW - (this.cols * this.slotW) / 2 + this.slotW / 2;
    const yBase = this.offsetY + slot.level * this.levelSpan + this.vGap;
    
    // Reset object transform before placing
    obj.position.set(x, yBase, 0);
    obj.rotation.set(0, 0, 0);
    obj.scale.set(1, 1, 1);
    
    // Clear any clipping planes that might be active
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach(mat => {
          mat.clippingPlanes = null;
          mat.needsUpdate = true;
        });
      } else {
        obj.material.clippingPlanes = null;
        obj.material.needsUpdate = true;
      }
    }
    
    this.root.add(obj);
    slot.occupied = true;
    this.highlight.visible = false;
    return true;
  }

  showHighlight(tipPosition, isPicking = false) {
    if (isPicking) {
      // When picking up, highlight the slot with the closest object
      const { object, distance } = this.findClosestObject(tipPosition);
      if (!object || distance > 5) {
        this.highlight.visible = false;
        return;
      }

      // Find which slot contains this object
      const objPos = new THREE.Vector3();
      object.getWorldPosition(objPos);
      const invertedMatrix = this.root.matrixWorld.clone().invert();
      objPos.applyMatrix4(invertedMatrix);
      
      for (const slot of this.freeSlots) {
        if (slot.occupied) {
          const x = slot.col * this.slotW - (this.cols * this.slotW) / 2 + this.slotW / 2;
          const y = this.offsetY + slot.level * this.levelSpan + this.vGap;
          const slotPos = new THREE.Vector3(x, y, 0);
          
          if (objPos.distanceTo(slotPos) < 1.0) { // Increased tolerance
            const yMid = this.offsetY + slot.level * this.levelSpan + this.levelSpan / 2;
            this.highlight.position.set(x, yMid, 0);
            this.highlight.visible = true;
            return;
          }
        }
      }
      this.highlight.visible = false;
    } else {
      // When placing, highlight the closest empty slot
      const { slot, distance } = this.findClosestSlot(tipPosition);
      if (!slot || distance > 5 || slot.occupied) {
        this.highlight.visible = false;
        return;
      }

      const x = slot.col * this.slotW - (this.cols * this.slotW) / 2 + this.slotW / 2;
      const yMid = this.offsetY + slot.level * this.levelSpan + this.levelSpan / 2;
      this.highlight.position.set(x, yMid, 0);
      this.highlight.visible = true;
    }
  }

  hideHighlight () { this.highlight.visible = false; }

  center () {
    // Centro geométrico constante de la estantería
    const x = this.root.position.x;
    const y = this.offsetY + (this.levels - 1) * this.levelSpan / 2;
    const z = this.root.position.z;
    return new THREE.Vector3(x, y, z);
  }
}
