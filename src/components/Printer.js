import * as THREE from 'three';
import { profiles, shapes } from '../utils/Shapes.js';
import { textureManager } from '../utils/TextureLoader.js';

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
    this.#buildPrinterLights();

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
      speed: 0.5,
      texture: 'Marble White',
      useTexture: false
    };

  }

  #createLightFixture() {
    // Crear un fixture LED visible para las luces de la impresora
    const fixtureGroup = new THREE.Group();
    
    // Base metálica del LED
    const baseGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.05, 8);
    const baseMaterial = new THREE.MeshPhongMaterial({
      color: 0x333333,
      shininess: 100
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -0.025;
    fixtureGroup.add(base);
    
    // Domo emisivo del LED
    const domeGeometry = new THREE.SphereGeometry(0.06, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffcc,
      transparent: true,
      opacity: 0.9,
      emissive: 0xffffaa,
      emissiveIntensity: 0.3
    });
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.position.y = 0;
    fixtureGroup.add(dome);
    
    // Anillo metálico
    const ringGeometry = new THREE.TorusGeometry(0.07, 0.01, 8, 16);
    const ringMaterial = new THREE.MeshPhongMaterial({
      color: 0x666666,
      shininess: 200
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.y = 0;
    ring.rotation.x = Math.PI / 2;
    fixtureGroup.add(ring);
    
    // Cables de alimentación
    const cableGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.3, 6);
    const cableMaterial = new THREE.MeshPhongMaterial({
      color: 0x222222
    });
    
    // Cable 1
    const cable1 = new THREE.Mesh(cableGeometry, cableMaterial);
    cable1.position.set(0.05, -0.2, 0);
    cable1.rotation.z = Math.PI / 6;
    fixtureGroup.add(cable1);
    
    // Cable 2
    const cable2 = new THREE.Mesh(cableGeometry, cableMaterial);
    cable2.position.set(-0.05, -0.2, 0);
    cable2.rotation.z = -Math.PI / 6;
    fixtureGroup.add(cable2);
    
    return fixtureGroup;
  }

  /* ╔═ chasis estático ═╗ */
  #buildPedestal () {
    // Base with reflection map (cubemap or spherical) - color original
    const baseMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xf0f0f0,
      shininess: 100,
      envMap: textureManager.getGreyRoomCubemap(),
      reflectivity: 0.6
    });
    
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2.2, 0.6, 32),
      baseMaterial
    );
    base.position.y = 0.3;
    base.receiveShadow = true;
    this.root.add(base);

    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 1.8, 0.05, 32),
      new THREE.MeshPhongMaterial({
        color: 0x88cfff,
        shininess: 200,
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
      new THREE.MeshPhongMaterial({ color: 0xbbc4d0, shininess: 80 })
    );
    col.position.set(0, 2.85, -0.9);
    col.receiveShadow = true;
    col.castShadow = true;
    this.root.add(col);
  }

  #buildHead () {
    this.head = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.4, 0.6),
      new THREE.MeshPhongMaterial({ color: 0x00ff00, shininess: 60 })
    );
    this.head.castShadow = true;
    this.head.receiveShadow = true;

    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.15, 0.15),
      new THREE.MeshPhongMaterial({ color: 0x22bb22, shininess: 60 })
    );
    bar.position.set(0, 0.27, 0);
    bar.castShadow = true;
    bar.receiveShadow = true;
    this.head.add(bar);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.35, 0.025, 8, 20),
      new THREE.MeshPhongMaterial({ 
        color: 0x00ffea, 
        shininess: 100,
        emissive: 0x002244
      })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.18;
    this.head.add(ring);

    this.head.position.set(0, this.buildPlateY + 0.4, -0.9);
    this.root.add(this.head);
  }

  #buildPrinterLights() {
    // 4 luces omnidireccionales en las cuatro esquinas de la tapa verde
    this.printerLights = [];
    this.lightsGroup = new THREE.Group();
    
    const headWidth = 0.6;
    const headDepth = 0.6;
    const headHeight = 0.4;
    
    // Relative positions on the head (local coordinates)
    const lightPositions = [
      [headWidth/2, headHeight/2 + 0.05, headDepth/2],     // front-right
      [-headWidth/2, headHeight/2 + 0.05, headDepth/2],    // front-left
      [headWidth/2, headHeight/2 + 0.05, -headDepth/2],     // back-right
      [-headWidth/2, headHeight/2 + 0.05, -headDepth/2]     // back-left
    ];

    lightPositions.forEach((pos, index) => {
      // Crear el grupo para la luz y su representación visual
      const lightGroup = new THREE.Group();
      
      // Crear la luz que apunta hacia abajo
      const light = new THREE.SpotLight(0xffffff, 0.8, 12, Math.PI/4, 0.2, 1);
      light.position.set(0, 0, 0);
      
      // Create target that points downward relative to the light
      const target = new THREE.Object3D();
      target.position.set(0, -5, 0);
      lightGroup.add(target);
      light.target = target;
      
      light.castShadow = true;
      light.shadow.mapSize.width = 256; // Reduced for performance
      light.shadow.mapSize.height = 256;
      lightGroup.add(light);
      
      // Crear representación visual de la luz (fixture LED)
      const lightFixture = this.#createLightFixture();
      lightGroup.add(lightFixture);
      
      // Posicionar el grupo completo
      lightGroup.position.set(pos[0], pos[1], pos[2]);
      this.lightsGroup.add(lightGroup);
      this.printerLights.push(light);
    });
    
    // Attach lights to the head so they move with it
    this.head.add(this.lightsGroup);
  }

  /* ╔═ generar nueva pieza ═╗ */
  generate () {
    this.#cleanupCurrentObject();
    this.#generateGeometry();
    this.#createMaterial();
    this.#createMesh();
    this.#setupInitialState();
  }

  #cleanupCurrentObject() {
    if (this.obj) {
      this.obj.geometry.dispose();
      (Array.isArray(this.obj.material) ? this.obj.material : [this.obj.material]).forEach(m => m.dispose());
      this.root.remove(this.obj);
      this.obj = null;
    }
  }

  #generateGeometry() {
    const { mode, form, height, twist } = this.params;
    const S = this.scale;
    let geo;

    if (mode === 'revolution') {
      const raw = profiles[form];
      if (!raw) { console.warn(`Perfil ${form} no existe`); return; }
      const maxY = raw.reduce((m, [, y]) => Math.max(m, y), 0);
      geo = new THREE.LatheGeometry(raw.map(([x, y]) => new THREE.Vector2(Math.abs(x) * S, (y / maxY) * height)), 32); // Reduced from 64
    } else {
      const shape = shapes[form];
      if (!shape) { console.warn(`Shape ${form} no existe`); return; }

      geo = new THREE.ExtrudeGeometry(shape, { 
        depth: height, 
        steps: 64, // Reduced from 140
        bevelEnabled: false
      });
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
    
    this.currentGeometry = geo;
  }


  #createMaterial() {
    const { color, material, texture, useTexture } = this.params;

    const textureData = useTexture ? textureManager.getPrintedObjectTextures().find(t => t.name === texture) : null;
    
    // Apply UV mapping if using texture
    if (textureData && this.currentGeometry) {
      this.#applyUVMapping(this.currentGeometry, textureData);
    }
    
    // Create material properties with enhanced texture and material support
    const matProps = {
      color: useTexture && textureData ? 0xffffff : color,
      map: useTexture && textureData ? textureData.diffuse : null,
      normalMap: useTexture && textureData && textureData.normal ? textureData.normal : null,
      transparent: material === 'glass',
      opacity: material === 'glass' ? 0.5 : 1,
      clippingPlanes: [this.clipPlane],
      clipShadows: true,
      side: THREE.DoubleSide, // Para mejor visualización
      ...this.#getSurfaceFinishProperties(material)
    };
    
    // Si usamos textura, aplicar propiedades adicionales del material
    if (useTexture && textureData) {
      matProps.metalness = textureData.metalness || 0;
      matProps.roughness = textureData.roughness || 0.5;
    }
    
    this.currentMaterial = new THREE.MeshPhongMaterial(matProps);
  }

  #applyUVMapping(geo, textureData) {
    const { mode } = this.params;
    if (!geo.attributes.uv) {
      geo.computeBoundingBox();
      const bbox = geo.boundingBox;
      const uvs = [];
      const positions = geo.attributes.position.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];
        
        if (mode === 'revolution') {
          const u = (Math.atan2(z, x) + Math.PI) / (2 * Math.PI);
          const v = (y - bbox.min.y) / (bbox.max.y - bbox.min.y);
          uvs.push(u, v);
        } else {
          const u = (x - bbox.min.x) / (bbox.max.x - bbox.min.x);
          const v = (z - bbox.min.z) / (bbox.max.z - bbox.min.z);
          uvs.push(u, v);
        }
      }
      
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    }
  }

  #getSurfaceFinishProperties(material) {
    const finishProps = {
      'matte': { 
        shininess: 20, 
        specular: 0x222222,
        reflectivity: 0.1
      },
      'shiny': { 
        shininess: 120, 
        specular: 0x888888,
        reflectivity: 0.4
      },
      'metallic': { 
        shininess: 200, 
        specular: 0xcccccc,
        reflectivity: 0.8,
        envMap: textureManager.getGreyRoomCubemap()
      },
      'plastic': { 
        shininess: 100, 
        specular: 0x666666,
        reflectivity: 0.3
      },
      'glass': { 
        shininess: 300, 
        specular: 0xffffff,
        reflectivity: 0.9,
        envMap: textureManager.getGreyRoomCubemap()
      }
    };
    
    return finishProps[material] || { shininess: 50, specular: 0x333333, reflectivity: 0.2 };
  }

  #createMesh() {
    if (!this.currentGeometry || !this.currentMaterial) return;

    this.obj = new THREE.Mesh(this.currentGeometry, this.currentMaterial);
    this.currentGeometry.computeBoundingBox();
    this.obj.position.set(0, this.buildPlateY - this.currentGeometry.boundingBox.min.y, 0);
    this.obj.castShadow = true;
    this.obj.receiveShadow = true;
    this.root.add(this.obj);
  }

  #setupInitialState() {
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
    this.clipPlane.constant = planeY;
    this.printPlane.position.y = planeY + this.printPlaneLift;
    this.head.position.y = planeY + 0.4 - this.clipPlaneOffset;
    
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
