import * as THREE from 'three';
import { textureManager } from '../utils/TextureLoader.js';

export class Forklift {
/* ═════════════════════════ constructor ════════════════════════════════════ */
  constructor () {
    /* parámetros de movimiento */
    this.wheelR  = 0.55;          // radio rueda
    this.speed   = 10;             // m / s avance/retroceso
    this.turnSpd = Math.PI;       // rad / s giro
    this.forkMax = 6.0;           // altura máx. horquilla (aumentado de 2.5 a 6.0)
    this.forkSpd = 1.5;           // velocidad elevación (aumentado de 1.0 a 1.5)

    /* nodo raíz y estado */
    this.root    = new THREE.Group();
    this.root.position.set(0, this.wheelR, 0);
    this.heading = 0;
    this.wRot    = 0;
    this.carried = null;

    /* --------------- colisiones ---------------
       solo chasis, sin ruedas, con holguras diferenciadas  */
    this.bodyHalfW = 1.20;    // 2.4 m ancho (mitad)
    this.bodyHalfD = 1.40;    // 2.8 m largo (mitad)
    this.marginX   = 0.15;    // 15 cm laterales
    this.marginZ   = 0.40;    // 40 cm frontal/trasero

    /* construir modelo */
    this.#buildChassis();
    this.#buildWheels();
    this.#buildCabin();
    this.#buildMastFork();
  }

/* ══════════════════ construcción visual ══════════════════ */
  #buildChassis () {
    const yellow = 0xe8ec6a;

    /* base with texture */
    const baseGeometry = new THREE.BoxGeometry(2.4, 0.7, 3.2);
    // Set proper UV coordinates for the chassis
    const uvs = baseGeometry.attributes.uv.array;
    for (let i = 0; i < uvs.length; i += 2) {
      uvs[i] *= 2; // Scale U coordinate
      uvs[i + 1] *= 2; // Scale V coordinate
    }
    baseGeometry.attributes.uv.needsUpdate = true;

    const base = new THREE.Mesh(
      baseGeometry,
      new THREE.MeshPhongMaterial({ 
        color: yellow,
        map: textureManager.getForkliftTexture(),
        normalMap: textureManager.getForkliftNormalMap(),
        shininess: 60
      })
    );
    base.position.y = 0.35;
    base.castShadow = true;
    base.receiveShadow = true;
    this.root.add(base);

    /* guardabarros (5 cm sobre la rueda) */
    const fenderGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.45, 16, 1, true, 0, Math.PI)
      .rotateZ(Math.PI / 2);
    const fenderMat = new THREE.MeshPhongMaterial({ 
      color: yellow, 
      side: THREE.DoubleSide,
      shininess: 60
    });
    const fY = this.wheelR - 0.3;  // Reducido de 0.05 a 0.02 (2cm sobre la rueda)
    [-1, 1].forEach(s => {
      [ 1.2, -1.2 ].forEach(z => {
        const f = new THREE.Mesh(fenderGeo, fenderMat);
        f.position.set(s * 1.5, fY, z);
        f.castShadow = true;
        f.receiveShadow = true;
        this.root.add(f);
      });
    });

    /* asiento y respaldo */
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.16, 0.7),
      new THREE.MeshPhongMaterial({ color: 0xffcf70, shininess: 40 })
    );
    seat.position.set(0.2, 0.82, -0.7);
    seat.castShadow = true;
    seat.receiveShadow = true;

    const back = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.8, 0.12),
      new THREE.MeshPhongMaterial({ color: yellow, shininess: 60 })
    );
    back.position.set(0.2, 1.26, -1.05);
    back.castShadow = true;
    back.receiveShadow = true;

    /* bloque rojo (contrapeso/freno) */
    const block = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.45, 0.45),
      new THREE.MeshPhongMaterial({ color: 0xb63030, shininess: 80 })
    );
    block.position.set(0.25, 0.55, -0.05);
    block.castShadow = true;
    block.receiveShadow = true;

    this.root.add(seat, back, block);
  }

  #buildWheels () {
    const x = this.bodyHalfW + this.wheelR;
    const poses = [ [ x,  1.2], [ x, -1.2], [-x,  1.2], [-x, -1.2] ];

    this.wheels = poses.map(([px, pz]) => {
      const wheelGroup = new THREE.Group();
      
      // Create wheel with proper UV mapping for side texture
      const wheelGeometry = new THREE.CylinderGeometry(this.wheelR, this.wheelR, 0.3, 32);
      
      // Override UV mapping to show tire texture on sides properly
      const uvs = [];
      const positionAttribute = wheelGeometry.attributes.position;
      const normalAttribute = wheelGeometry.attributes.normal;
      
      for (let i = 0; i < positionAttribute.count; i++) {
        const x = positionAttribute.getX(i);
        const y = positionAttribute.getY(i);
        const z = positionAttribute.getZ(i);
        
        const nx = normalAttribute.getX(i);
        const ny = normalAttribute.getY(i);
        const nz = normalAttribute.getZ(i);
        
        // Check if this vertex is on the cylindrical side (normal pointing horizontally)
        if (Math.abs(ny) < 0.1) { // Side face
          // Use cylindrical mapping for side faces
          const angle = Math.atan2(z, x);
          const u = (angle + Math.PI) / (2 * Math.PI);
          const v = (y + 0.15) / 0.3;
          uvs.push(u, v);
        } else { // Top/bottom caps
          // Use radial mapping for caps - this shows the tire rim pattern
          const u = (x / this.wheelR + 1) * 0.5;
          const v = (z / this.wheelR + 1) * 0.5;
          uvs.push(u, v);
        }
      }
      
      wheelGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      
      const wheelMaterial = new THREE.MeshPhongMaterial({
        map: textureManager.getWheelTexture(),
        shininess: 30
      });
      
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2; // Rotate to horizontal position
      wheel.castShadow = true;
      wheel.receiveShadow = true;
      
      wheelGroup.add(wheel);
      wheelGroup.position.set(px, 0, pz);
      this.root.add(wheelGroup);
      return wheelGroup;
    });
  }

  #buildCabin () {
    const poleMat = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 200 });
    const poleGeo = new THREE.BoxGeometry(0.1, 1.4, 0.1);

    [-1.0, 0.9].forEach(x => {
      const pf = new THREE.Mesh(poleGeo, poleMat); 
      pf.position.set(x, 1.05,  0.6);
      pf.castShadow = true;
      pf.receiveShadow = true;
      
      const pb = pf.clone(); 
      pb.position.z = -1.2;
      pb.castShadow = true;
      pb.receiveShadow = true;
      
      this.root.add(pf, pb);
    });

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.1, 2),
      new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 200 })
    );
    roof.position.set(-0.05, 1.8, -0.3);
    roof.castShadow = true;
    roof.receiveShadow = true;
    this.root.add(roof);

    const wheel = new THREE.Mesh(
      new THREE.TorusGeometry(0.25, 0.035, 12, 20),
      new THREE.MeshPhongMaterial({ color: 0x222, shininess: 150 })
    );
    wheel.rotation.x = -Math.PI / 2;
    wheel.position.set(0.6, 1.0, -0.4);
    wheel.castShadow = true;
    wheel.receiveShadow = true;

    const column = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8),
      new THREE.MeshPhongMaterial({ color: 0x444, shininess: 100 })
    );
    column.rotation.z = -0.45;
    column.position.set(0.55, 0.8, -0.38);
    column.castShadow = true;
    column.receiveShadow = true;

    this.root.add(wheel, column);
  }

  #buildMastFork () {
    this.mast = new THREE.Group();
    this.mast.position.set(0, 0.7, 1.6);
    this.root.add(this.mast);

    const railGeo = new THREE.BoxGeometry(0.12, 6.4, 0.12);
    const railMat = new THREE.MeshPhongMaterial({ color: 0xcfd4f3, shininess: 100 });
    [-0.3, 0.3].forEach(x => {
      const r = new THREE.Mesh(railGeo, railMat);
      r.position.set(x, 3.2, 0);
      r.castShadow = true;
      r.receiveShadow = true;
      this.mast.add(r);
    });

    const braceGeo = new THREE.BoxGeometry(0.7, 0.12, 0.12);
    const braceMat = new THREE.MeshPhongMaterial({ color: 0xd64893, shininess: 80 });
    [0.25, 3.2, 6.2].forEach(y => {
      const b = new THREE.Mesh(braceGeo, braceMat);
      b.position.set(0, y, 0.1);
      b.castShadow = true;
      b.receiveShadow = true;
      this.mast.add(b);
    });

    this.forkGroup  = new THREE.Group();
    this.forkHeight = 0;

    const fork = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.12, 1.4),
      new THREE.MeshPhongMaterial({ color: 0xf4a742, shininess: 40 })
    );
    fork.position.set(0, 0, 0.7);
    fork.castShadow = true;
    fork.receiveShadow = true;
    this.forkGroup.add(fork);
    this.mast.add(this.forkGroup);
  }

/* ═════════════════════ lógica de movimiento ═════════════════════ */
  #tip () {
    return this.forkGroup.localToWorld(new THREE.Vector3(0, 0, 1.4));
  }

  update (input, dt) {
    /* giro */
    const tr = (input.key('KeyD') ? 1 : 0) - (input.key('KeyA') ? 1 : 0);
    if (tr) {
      this.heading -= this.turnSpd * tr * dt;
      this.root.rotation.y = this.heading;
    }

    /* avance / retroceso con colisiones mejoradas */
    const mv = (input.key('KeyW') ? 1 : 0) - (input.key('KeyS') ? 1 : 0);
    if (mv) {
      const v = this.speed * mv * dt;
      const s = Math.sin(this.heading), c = Math.cos(this.heading);
      
      // Calcular el vector de movimiento
      const moveVector = new THREE.Vector3(s * v, 0, c * v);
      
      // Intentar movimiento con deslizamiento mejorado
      const newPos = this.root.position.clone();
      const hx = Math.abs(c) * this.bodyHalfW + Math.abs(s) * this.bodyHalfD - this.marginX;
      const hz = Math.abs(s) * this.bodyHalfW + Math.abs(c) * this.bodyHalfD - this.marginZ;

      // Buffer para evitar quedarse pegado
      const buffer = 0.1; // 10cm de buffer

      // Función para verificar colisión con buffer
      const checkCollision = (pos) => {
        for (const box of this._obsAABB ?? []) {
          if (pos.x + hx + buffer < box.min.x || pos.x - hx - buffer > box.max.x) continue;
          if (pos.z + hz + buffer < box.min.z || pos.z - hz - buffer > box.max.z) continue;
          return true;
        }
        return false;
      };

      // Intentar movimiento completo primero
      const fullMovePos = newPos.clone().add(moveVector);
      if (!checkCollision(fullMovePos)) {
        newPos.copy(fullMovePos);
      } else {
        // Si hay colisión, intentar deslizamiento
        const moveX = new THREE.Vector3(moveVector.x, 0, 0);
        const moveZ = new THREE.Vector3(0, 0, moveVector.z);
        
        // Probar movimiento en X
        const testPosX = newPos.clone().add(moveX);
        if (!checkCollision(testPosX)) {
          newPos.add(moveX);
        }
        
        // Probar movimiento en Z
        const testPosZ = newPos.clone().add(moveZ);
        if (!checkCollision(testPosZ)) {
          newPos.add(moveZ);
        }
      }

      // Actualizar posición si hubo movimiento
      if (!newPos.equals(this.root.position)) {
        this.root.position.copy(newPos);
        this.wRot -= v / this.wheelR;
        this.wheels.forEach(w => (w.rotation.x = this.wRot));
      }
    }

    /* elevación horquilla */
    const lift = (input.key('KeyQ') ? 1 : 0) - (input.key('KeyE') ? 1 : 0);
    if (lift) {
      this.forkHeight = THREE.MathUtils.clamp(
        (this.forkHeight ?? 0) + lift * this.forkSpd * dt,
        0,
        this.forkMax
      );
      this.forkGroup.position.y = this.forkHeight;
    }

    /* highlight estantería */
    if (this.shelf) {
      const tipPos = this.#tip();
      if (this.carried) {
        this.shelf.showHighlight(tipPos, false);
      } else {
        this.shelf.showHighlight(tipPos, true);
      }
    }

    /* interacción G */
    if (input.key('KeyG') && !this._gPrev) {
      !this.carried ? this.#pick() : this.#place();
    }
    this._gPrev = input.key('KeyG');
  }

/* ═════════════════════ pick / place ═════════════════════ */
  #pick () {
    if (this.printer) {
      const obj = this.printer.currentObject();
      const tipPos = this.#tip();
      if (obj && tipPos.distanceTo(
            obj.getWorldPosition(new THREE.Vector3())
          ) <= 5) {
        const taken = this.printer.detachObject();
        if (taken) {
          this.forkGroup.add(taken);
          taken.position.set(0, 0.15, 0.7);
          this.carried = taken;
          return;
        }
      }
    }

    // Try to pick up from shelf
    if (this.shelf) {
      const tipPos = this.#tip();
      const { object, distance } = this.shelf.findClosestObject(tipPos);
      if (object && distance <= 5) {
        if (this.shelf.removeObject(object)) {
          this.forkGroup.add(object);
          object.position.set(0, 0.15, 0.7);
          this.carried = object;
        }
      }
    }
  }

  #place () {
    if (!this.shelf) return;
    const tipPos = this.#tip();
    if (this.shelf.addObject(this.carried, tipPos)) {
      this.carried = null;
    }
  }

/* ═════════════════════ entorno estático ═════════════════════ */
  setEnvironment (printer, shelf) {
    this.printer = printer;
    this.shelf   = shelf;
    [printer.root, shelf.root].forEach(o => o.updateWorldMatrix(true, true));
    this._obsAABB = [printer.root, shelf.root].map(o =>
      new THREE.Box3().setFromObject(o)
    );
  }
}
