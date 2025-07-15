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

    /* --------------- diseño actual --------------- */
    this.currentDesign = 0; // 0: Classic, 1: Modern, 2: Futuristic
    this.designComponents = null;

    /* construir modelo */
    this.#buildForklift();
    
    /* audio setup */
    this.#setupAudio();
  }

/* ══════════════════ construcción visual ══════════════════ */
  #buildForklift() {
    // Clear existing components
    if (this.designComponents) {
      this.designComponents.forEach(component => {
        this.root.remove(component);
      });
    }
    
    // Build based on current design
    switch (this.currentDesign) {
      case 0:
        this.#buildClassicDesign();
        break;
      case 1:
        this.#buildModernDesign();
        break;
      case 2:
        this.#buildFuturisticDesign();
        break;
    }
  }

  #buildClassicDesign() {
    this.designComponents = [];
    this.#buildChassis();
    this.#buildWheels();
    this.#buildCabin();
    this.#buildMastFork();
  }

  #buildChassis () {
    const yellow = 0xe8ec6a;

    /* base amarillo sin texturas para mantener color original */
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.7, 3.2),
      new THREE.MeshPhongMaterial({ 
        color: yellow,
        shininess: 60
      })
    );
    base.position.y = 0.35;
    base.castShadow = true;
    base.receiveShadow = true;
    this.root.add(base);
    this.designComponents.push(base);

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
        this.designComponents.push(f);
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

    // Agregar luces frontales del forklift
    const headlightGeometry = new THREE.SphereGeometry(0.08, 16, 8);
    const headlightMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffffcc, 
      shininess: 200 
    });
    
    const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    leftHeadlight.position.set(-0.8, 1.2, 1.5);
    leftHeadlight.castShadow = true;
    
    const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    rightHeadlight.position.set(0.8, 1.2, 1.5);
    rightHeadlight.castShadow = true;
    
    // Agregar antena
    const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8);
    const antennaMaterial = new THREE.MeshPhongMaterial({ color: 0x333333, shininess: 100 });
    const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna.position.set(-0.8, 1.8, -0.5);
    antenna.castShadow = true;
    
    // Esfera en la punta de la antena
    const antennaTipGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const antennaTipMaterial = new THREE.MeshPhongMaterial({ color: 0xff4444 });
    const antennaTip = new THREE.Mesh(antennaTipGeometry, antennaTipMaterial);
    antennaTip.position.set(-0.8, 2.4, -0.5);
    antennaTip.castShadow = true;
    
    // Espejos retrovisores
    const mirrorGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16);
    const mirrorMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x888888, 
      shininess: 300,
      reflectivity: 0.8
    });
    
    const leftMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    leftMirror.position.set(-1.0, 1.5, 0.3);
    leftMirror.rotation.z = Math.PI / 2;
    leftMirror.castShadow = true;
    
    const rightMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    rightMirror.position.set(1.0, 1.5, 0.3);
    rightMirror.rotation.z = Math.PI / 2;
    rightMirror.castShadow = true;
    
    // Panel de instrumentos
    const dashGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.08);
    const dashMaterial = new THREE.MeshPhongMaterial({ color: 0x222222, shininess: 50 });
    const dashboard = new THREE.Mesh(dashGeometry, dashMaterial);
    dashboard.position.set(0.5, 1.1, -0.2);
    dashboard.castShadow = true;
    
    // Pantalla LCD en el dashboard
    const screenGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.01);
    const screenMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00ff88, 
      shininess: 200
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(0.5, 1.1, -0.15);
    
    this.root.add(seat, back, block, leftHeadlight, rightHeadlight, antenna, antennaTip, 
                  leftMirror, rightMirror, dashboard, screen);
    this.designComponents.push(seat, back, block, leftHeadlight, rightHeadlight, antenna, 
                              antennaTip, leftMirror, rightMirror, dashboard, screen);
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
      this.designComponents.push(wheelGroup);
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
      this.designComponents.push(pf, pb);
    });

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.1, 2),
      new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 200 })
    );
    roof.position.set(-0.05, 1.8, -0.3);
    roof.castShadow = true;
    roof.receiveShadow = true;
    this.root.add(roof);
    this.designComponents.push(roof);

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
    this.designComponents.push(wheel, column);
  }

  #buildMastFork () {
    this.mast = new THREE.Group();
    this.mast.position.set(0, 0.7, 1.6);
    this.root.add(this.mast);
    this.designComponents.push(this.mast);

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

  #buildModernDesign() {
    this.designComponents = [];
    
    // Modern sleek chassis
    const modernBlue = 0x2e5ce8;
    const modernGray = 0x5a6b7d;
    
    // Main body - more angular and modern
    const bodyGeometry = new THREE.BoxGeometry(2.3, 0.8, 3.0);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
      color: modernBlue, 
      shininess: 120,
      metalness: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.4;
    body.castShadow = true;
    body.receiveShadow = true;
    this.root.add(body);
    this.designComponents.push(body);
    
    // Modern wheels with better design
    this.#buildModernWheels();
    
    // Futuristic cabin
    this.#buildModernCabin();
    
    // Modern mast and fork
    this.#buildModernMastFork();
  }

  #buildModernWheels() {
    const x = this.bodyHalfW + this.wheelR;
    const poses = [ [ x,  1.2], [ x, -1.2], [-x,  1.2], [-x, -1.2] ];
    
    this.wheels = poses.map(([px, pz]) => {
      const wheelGroup = new THREE.Group();
      
      // Modern wheel with metallic finish
      const wheelGeometry = new THREE.CylinderGeometry(this.wheelR, this.wheelR, 0.35, 32);
      const wheelMaterial = new THREE.MeshPhongMaterial({
        color: 0x333333,
        shininess: 200,
        metalness: 0.8
      });
      
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.castShadow = true;
      wheel.receiveShadow = true;
      
      // Modern rim details
      const rimGeometry = new THREE.TorusGeometry(0.4, 0.05, 8, 16);
      const rimMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x666666, 
        shininess: 300 
      });
      const rim = new THREE.Mesh(rimGeometry, rimMaterial);
      rim.rotation.z = Math.PI / 2;
      wheel.add(rim);
      
      wheelGroup.add(wheel);
      wheelGroup.position.set(px, 0, pz);
      this.root.add(wheelGroup);
      this.designComponents.push(wheelGroup);
      return wheelGroup;
    });
  }

  #buildModernCabin() {
    const modernGray = 0x5a6b7d;
    
    // Modern angular supports
    const supportGeometry = new THREE.BoxGeometry(0.08, 1.5, 0.08);
    const supportMaterial = new THREE.MeshPhongMaterial({ 
      color: modernGray, 
      shininess: 150 
    });
    
    [-0.9, 0.9].forEach(x => {
      const support1 = new THREE.Mesh(supportGeometry, supportMaterial);
      support1.position.set(x, 1.1, 0.6);
      support1.castShadow = true;
      support1.receiveShadow = true;
      
      const support2 = new THREE.Mesh(supportGeometry, supportMaterial);
      support2.position.set(x, 1.1, -1.1);
      support2.castShadow = true;
      support2.receiveShadow = true;
      
      this.root.add(support1, support2);
      this.designComponents.push(support1, support2);
    });
    
    // Modern glass-like canopy
    const canopyGeometry = new THREE.BoxGeometry(2.0, 0.08, 1.8);
    const canopyMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x88ddff, 
      shininess: 300,
      transparent: true,
      opacity: 0.7
    });
    const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
    canopy.position.set(0, 1.9, -0.25);
    canopy.castShadow = true;
    canopy.receiveShadow = true;
    this.root.add(canopy);
    this.designComponents.push(canopy);
    
    // Modern seat
    const seatGeometry = new THREE.BoxGeometry(0.8, 0.2, 0.8);
    const seatMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x222222, 
      shininess: 80 
    });
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.set(0, 0.9, -0.5);
    seat.castShadow = true;
    seat.receiveShadow = true;
    this.root.add(seat);
    this.designComponents.push(seat);
  }

  #buildModernMastFork() {
    this.mast = new THREE.Group();
    this.mast.position.set(0, 0.7, 1.6);
    this.root.add(this.mast);
    this.designComponents.push(this.mast);
    
    // Modern mast with LED strips
    const mastGeometry = new THREE.BoxGeometry(0.15, 6.4, 0.15);
    const mastMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x4a5568, 
      shininess: 150 
    });
    
    [-0.3, 0.3].forEach(x => {
      const mast = new THREE.Mesh(mastGeometry, mastMaterial);
      mast.position.set(x, 3.2, 0);
      mast.castShadow = true;
      mast.receiveShadow = true;
      this.mast.add(mast);
      
      // LED strip effect
      const ledGeometry = new THREE.BoxGeometry(0.02, 6.0, 0.02);
      const ledMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ff88
      });
      const led = new THREE.Mesh(ledGeometry, ledMaterial);
      led.position.set(x > 0 ? -0.08 : 0.08, 3.2, 0.08);
      this.mast.add(led);
    });
    
    // Modern fork
    this.forkGroup = new THREE.Group();
    this.forkHeight = 0;
    
    const forkGeometry = new THREE.BoxGeometry(1.5, 0.15, 1.5);
    const forkMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x2e5ce8, 
      shininess: 100 
    });
    const fork = new THREE.Mesh(forkGeometry, forkMaterial);
    fork.position.set(0, 0, 0.75);
    fork.castShadow = true;
    fork.receiveShadow = true;
    this.forkGroup.add(fork);
    this.mast.add(this.forkGroup);
  }

  #buildFuturisticDesign() {
    this.designComponents = [];
    
    // Futuristic chassis with glowing elements
    const futuristicPurple = 0x8b5cf6;
    const futuristicCyan = 0x06b6d4;
    
    // Main body - very angular and futuristic
    const bodyGeometry = new THREE.CylinderGeometry(1.3, 1.5, 0.9, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
      color: futuristicPurple, 
      shininess: 200
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.45;
    body.castShadow = true;
    body.receiveShadow = true;
    this.root.add(body);
    this.designComponents.push(body);
    
    // Futuristic wheels
    this.#buildFuturisticWheels();
    
    // Futuristic cabin
    this.#buildFuturisticCabin();
    
    // Futuristic mast and fork
    this.#buildFuturisticMastFork();
  }

  #buildFuturisticWheels() {
    const x = this.bodyHalfW + this.wheelR;
    const poses = [ [ x,  1.2], [ x, -1.2], [-x,  1.2], [-x, -1.2] ];
    
    this.wheels = poses.map(([px, pz]) => {
      const wheelGroup = new THREE.Group();
      
      // Futuristic glowing wheel
      const wheelGeometry = new THREE.CylinderGeometry(this.wheelR, this.wheelR, 0.3, 6);
      const wheelMaterial = new THREE.MeshPhongMaterial({
        color: 0x222222,
        shininess: 300
      });
      
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.castShadow = true;
      wheel.receiveShadow = true;
      
      // Glowing rim
      const rimGeometry = new THREE.TorusGeometry(0.45, 0.03, 6, 12);
      const rimMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x06b6d4
      });
      const rim = new THREE.Mesh(rimGeometry, rimMaterial);
      rim.rotation.z = Math.PI / 2;
      wheel.add(rim);
      
      wheelGroup.add(wheel);
      wheelGroup.position.set(px, 0, pz);
      this.root.add(wheelGroup);
      this.designComponents.push(wheelGroup);
      return wheelGroup;
    });
  }

  #buildFuturisticCabin() {
    // Futuristic dome cabin
    const domeGeometry = new THREE.SphereGeometry(1.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x8b5cf6, 
      shininess: 300,
      transparent: true,
      opacity: 0.8
    });
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.position.set(0, 1.2, -0.3);
    dome.castShadow = true;
    dome.receiveShadow = true;
    this.root.add(dome);
    this.designComponents.push(dome);
    
    // Futuristic seat
    const seatGeometry = new THREE.SphereGeometry(0.4, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const seatMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x1e293b, 
      shininess: 100 
    });
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.set(0, 0.85, -0.5);
    seat.castShadow = true;
    seat.receiveShadow = true;
    this.root.add(seat);
    this.designComponents.push(seat);
  }

  #buildFuturisticMastFork() {
    this.mast = new THREE.Group();
    this.mast.position.set(0, 0.7, 1.6);
    this.root.add(this.mast);
    this.designComponents.push(this.mast);
    
    // Futuristic plasma mast
    const mastGeometry = new THREE.CylinderGeometry(0.08, 0.12, 6.4, 8);
    const mastMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x8b5cf6, 
      shininess: 300
    });
    
    [-0.3, 0.3].forEach(x => {
      const mast = new THREE.Mesh(mastGeometry, mastMaterial);
      mast.position.set(x, 3.2, 0);
      mast.castShadow = true;
      mast.receiveShadow = true;
      this.mast.add(mast);
    });
    
    // Futuristic fork with energy field
    this.forkGroup = new THREE.Group();
    this.forkHeight = 0;
    
    const forkGeometry = new THREE.BoxGeometry(1.6, 0.12, 1.6);
    const forkMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x06b6d4, 
      shininess: 200
    });
    const fork = new THREE.Mesh(forkGeometry, forkMaterial);
    fork.position.set(0, 0, 0.8);
    fork.castShadow = true;
    fork.receiveShadow = true;
    this.forkGroup.add(fork);
    this.mast.add(this.forkGroup);
  }

  #setupAudio() {
    this.audioLoader = new THREE.AudioLoader();
    this.listener = new THREE.AudioListener();
    this.hornSound = new THREE.Audio(this.listener);
    
    // Add listener to the forklift
    this.root.add(this.listener);
    
    // Load horn sound
    this.audioLoader.load('/src/audio/car-horn-beep-beep-two-beeps-honk-honk-6188.mp3', (buffer) => {
      this.hornSound.setBuffer(buffer);
      this.hornSound.setVolume(0.5);
    });
  }

  honk() {
    if (this.hornSound.isPlaying) {
      this.hornSound.stop();
    }
    this.hornSound.play();
    
    // Trigger door opening if warehouse is available
    if (this.warehouse) {
      this.warehouse.toggleDoors();
    }
  }

  switchDesign(design) {
    if (design >= 0 && design <= 2 && design !== this.currentDesign) {
      this.currentDesign = design;
      this.#buildForklift();
    }
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
        for (let i = 0; i < (this._obsAABB?.length ?? 0); i++) {
          const box = this._obsAABB[i];
          
          // Check if this is a door collision box and doors are open
          if (this.warehouse && i >= 2) { // Door collision boxes start from index 2
            // Check if we're trying to pass through a door opening
            const doorWidth = 12;
            const isInDoorArea = Math.abs(pos.x) < doorWidth/2;
            
            // If doors are open and we're in the door area, skip collision for door-related boxes
            if (this.warehouse.frontDoors.isOpen && isInDoorArea) {
              // Skip collision for front and back door boxes (indices 2-7)
              if (i >= 2 && i <= 7) continue;
            }
          }
          
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

    /* honk con F */
    if (input.key('KeyF') && !this._fPrev) {
      this.honk();
    }
    this._fPrev = input.key('KeyF');
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
  setEnvironment (printer, shelf, warehouse) {
    this.printer = printer;
    this.shelf   = shelf;
    this.warehouse = warehouse;
    
    // Create collision boxes for existing objects
    [printer.root, shelf.root].forEach(o => o.updateWorldMatrix(true, true));
    this._obsAABB = [printer.root, shelf.root].map(o =>
      new THREE.Box3().setFromObject(o)
    );
    
    // Add warehouse wall collision boxes
    if (warehouse) {
      const wallThickness = 0.5;
      const wallHeight = warehouse.wallHeight;
      const width = warehouse.width;
      const depth = warehouse.depth;
      const doorWidth = 12;
      const doorHeight = 6;
      
      // Left wall (solid)
      this._obsAABB.push(new THREE.Box3(
        new THREE.Vector3(-width/2 - wallThickness/2, 0, -depth/2),
        new THREE.Vector3(-width/2 + wallThickness/2, wallHeight, depth/2)
      ));
      
      // Right wall (solid)
      this._obsAABB.push(new THREE.Box3(
        new THREE.Vector3(width/2 - wallThickness/2, 0, -depth/2),
        new THREE.Vector3(width/2 + wallThickness/2, wallHeight, depth/2)
      ));
      
      // Front wall parts (with door opening)
      // Left part of front wall
      this._obsAABB.push(new THREE.Box3(
        new THREE.Vector3(-width/2, 0, depth/2 - wallThickness/2),
        new THREE.Vector3(-doorWidth/2, wallHeight, depth/2 + wallThickness/2)
      ));
      
      // Right part of front wall
      this._obsAABB.push(new THREE.Box3(
        new THREE.Vector3(doorWidth/2, 0, depth/2 - wallThickness/2),
        new THREE.Vector3(width/2, wallHeight, depth/2 + wallThickness/2)
      ));
      
      // Top part of front wall (above door)
      this._obsAABB.push(new THREE.Box3(
        new THREE.Vector3(-doorWidth/2, doorHeight, depth/2 - wallThickness/2),
        new THREE.Vector3(doorWidth/2, wallHeight, depth/2 + wallThickness/2)
      ));
      
      // Back wall parts (with door opening)
      // Left part of back wall
      this._obsAABB.push(new THREE.Box3(
        new THREE.Vector3(-width/2, 0, -depth/2 - wallThickness/2),
        new THREE.Vector3(-doorWidth/2, wallHeight, -depth/2 + wallThickness/2)
      ));
      
      // Right part of back wall
      this._obsAABB.push(new THREE.Box3(
        new THREE.Vector3(doorWidth/2, 0, -depth/2 - wallThickness/2),
        new THREE.Vector3(width/2, wallHeight, -depth/2 + wallThickness/2)
      ));
      
      // Top part of back wall (above door)
      this._obsAABB.push(new THREE.Box3(
        new THREE.Vector3(-doorWidth/2, doorHeight, -depth/2 - wallThickness/2),
        new THREE.Vector3(doorWidth/2, wallHeight, -depth/2 + wallThickness/2)
      ));
    }
  }
}
