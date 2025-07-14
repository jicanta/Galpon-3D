import * as THREE from 'three';
import { textureManager } from '../utils/TextureLoader.js';

export class Warehouse {
  constructor() {
    this.root = new THREE.Group();
    this.width = 60;
    this.wallHeight = 8;
    this.roofHeight = 18; // Increased from 12 to 18 for proper warehouse height
    this.depth = 40;
    
    // Door animation properties
    this.frontDoors = { left: null, right: null, isOpen: false };
    this.backDoors = { left: null, right: null, isOpen: false };
    this.doorOpenAngle = Math.PI / 2; // 90 degrees
    
    this.#createWarehouseStructure();
    this.#createStructuralBeams();
    this.#createCeilingLights();
    this.#createWarehouseDetails();
  }

  #createWarehouseStructure() {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(this.width, this.depth);
    const floorMaterial = new THREE.MeshPhongMaterial({
      map: textureManager.getFloorTexture(),
      normalMap: textureManager.getFloorNormalMap(),
      shininess: 30
    });
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.01; // Slightly above ground to avoid z-fighting
    floor.receiveShadow = true;
    this.root.add(floor);

    // Corrugated metal walls with doors on horizontal walls
    this.#createWallWithDoor('front', 0, this.wallHeight/2, this.depth/2, 0, 0, 0);
    this.#createWallWithDoor('back', 0, this.wallHeight/2, -this.depth/2, 0, Math.PI, 0);
    this.#createCorrugatedWall('left', -this.width/2, this.wallHeight/2, 0, 0, Math.PI/2, 0);
    this.#createCorrugatedWall('right', this.width/2, this.wallHeight/2, 0, 0, -Math.PI/2, 0);

    // Triangular end walls (gable ends)
    this.#createGableWall('front_gable', 0, this.wallHeight + (this.roofHeight - this.wallHeight)/2, this.depth/2);
    this.#createGableWall('back_gable', 0, this.wallHeight + (this.roofHeight - this.wallHeight)/2, -this.depth/2);

    // Pitched roof
    this.#createPitchedRoof();
  }

  #createCorrugatedWall(name, x, y, z, rx, ry, rz) {
    const wallWidth = name === 'front' || name === 'back' ? this.width : this.depth;
    const wallGeometry = new THREE.PlaneGeometry(wallWidth, this.wallHeight);
    
    // Create corrugated metal material
    const wallMaterial = new THREE.MeshPhongMaterial({
      map: textureManager.getWallTexture(),
      normalMap: textureManager.getWallNormalMap(),
      shininess: 80,
      metalness: 0.3,
      side: THREE.DoubleSide
    });
    
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(x, y, z);
    wall.rotation.set(rx, ry, rz);
    wall.receiveShadow = true;
    wall.castShadow = true;
    
    // Add small offset to prevent z-fighting with structural beams
    if (name === 'front' || name === 'back') {
      wall.position.z += (name === 'front' ? -0.05 : 0.05);
    } else {
      wall.position.x += (name === 'left' ? 0.05 : -0.05);
    }
    
    this.root.add(wall);
  }

  #createWallWithDoor(name, x, y, z, rx, ry, rz) {
    const wallWidth = this.width;
    const doorWidth = 12; // 12 meter wide door
    const doorHeight = 6; // 6 meter high door
    const wallGroup = new THREE.Group();
    
    // Create corrugated metal material
    const wallMaterial = new THREE.MeshPhongMaterial({
      map: textureManager.getWallTexture(),
      normalMap: textureManager.getWallNormalMap(),
      shininess: 80,
      metalness: 0.3,
      side: THREE.DoubleSide
    });
    
    // Left wall section
    const leftWallWidth = (wallWidth - doorWidth) / 2;
    const leftWallGeometry = new THREE.PlaneGeometry(leftWallWidth, this.wallHeight);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.set(-wallWidth/2 + leftWallWidth/2, 0, 0);
    leftWall.receiveShadow = true;
    leftWall.castShadow = true;
    wallGroup.add(leftWall);
    
    // Right wall section
    const rightWallWidth = (wallWidth - doorWidth) / 2;
    const rightWallGeometry = new THREE.PlaneGeometry(rightWallWidth, this.wallHeight);
    const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
    rightWall.position.set(wallWidth/2 - rightWallWidth/2, 0, 0);
    rightWall.receiveShadow = true;
    rightWall.castShadow = true;
    wallGroup.add(rightWall);
    
    // Top wall section above door
    const topWallHeight = this.wallHeight - doorHeight;
    const topWallGeometry = new THREE.PlaneGeometry(doorWidth, topWallHeight);
    const topWall = new THREE.Mesh(topWallGeometry, wallMaterial);
    topWall.position.set(0, doorHeight/2 + topWallHeight/2, 0);
    topWall.receiveShadow = true;
    topWall.castShadow = true;
    wallGroup.add(topWall);
    
    // Door frame
    const frameWidth = 0.3;
    const frameDepth = 0.25;
    const frameMaterial = new THREE.MeshPhongMaterial({
      color: 0x444444,
      shininess: 60
    });
    
    // Door frame sides
    const frameGeometry = new THREE.BoxGeometry(frameWidth, doorHeight, frameDepth);
    const leftFrame = new THREE.Mesh(frameGeometry, frameMaterial);
    leftFrame.position.set(-doorWidth/2 - frameWidth/2, 0, frameDepth/2 + 0.1);
    leftFrame.castShadow = true;
    leftFrame.receiveShadow = true;
    wallGroup.add(leftFrame);
    
    const rightFrame = new THREE.Mesh(frameGeometry, frameMaterial);
    rightFrame.position.set(doorWidth/2 + frameWidth/2, 0, frameDepth/2 + 0.1);
    rightFrame.castShadow = true;
    rightFrame.receiveShadow = true;
    wallGroup.add(rightFrame);
    
    // Door frame top
    const topFrameGeometry = new THREE.BoxGeometry(doorWidth + frameWidth * 2, frameWidth, frameDepth);
    const topFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
    topFrame.position.set(0, doorHeight/2 + frameWidth/2, frameDepth/2 + 0.1);
    topFrame.castShadow = true;
    topFrame.receiveShadow = true;
    wallGroup.add(topFrame);
    
    // Door panels (industrial metal doors)
    const doorPanelWidth = doorWidth / 2;
    const doorMaterial = new THREE.MeshPhongMaterial({
      color: 0x2a4a6b,
      shininess: 80,
      metalness: 0.4,
      side: THREE.DoubleSide
    });
    
    const doorPanelGeometry = new THREE.BoxGeometry(doorPanelWidth - 0.2, doorHeight - 0.2, 0.15);
    
    // Left door panel with pivot point at the left edge
    const leftDoor = new THREE.Mesh(doorPanelGeometry, doorMaterial);
    leftDoor.position.set(doorPanelWidth/2 - 0.1, -this.wallHeight/2 + doorHeight/2 - 0.1, 0.3);
    leftDoor.castShadow = true;
    leftDoor.receiveShadow = true;
    
    // Create pivot group for left door
    const leftDoorGroup = new THREE.Group();
    leftDoorGroup.position.set(-doorWidth/2 + 0.1, 0, 0);
    leftDoorGroup.add(leftDoor);
    wallGroup.add(leftDoorGroup);
    
    // Right door panel with pivot point at the right edge
    const rightDoor = new THREE.Mesh(doorPanelGeometry, doorMaterial);
    rightDoor.position.set(-doorPanelWidth/2 + 0.1, -this.wallHeight/2 + doorHeight/2 - 0.1, 0.3);
    rightDoor.castShadow = true;
    rightDoor.receiveShadow = true;
    
    // Create pivot group for right door
    const rightDoorGroup = new THREE.Group();
    rightDoorGroup.position.set(doorWidth/2 - 0.1, 0, 0);
    rightDoorGroup.add(rightDoor);
    wallGroup.add(rightDoorGroup);
    
    // Store door references for animation
    if (name === 'front') {
      this.frontDoors.left = leftDoorGroup;
      this.frontDoors.right = rightDoorGroup;
    } else if (name === 'back') {
      this.backDoors.left = leftDoorGroup;
      this.backDoors.right = rightDoorGroup;
    }
    
    // Door handles
    const handleMaterial = new THREE.MeshPhongMaterial({
      color: 0x333333,
      shininess: 100
    });
    
    const handleGeometry = new THREE.BoxGeometry(0.05, 0.8, 0.15);
    
    // Left door handle (attached to left door)
    const leftHandle = new THREE.Mesh(handleGeometry, handleMaterial);
    leftHandle.position.set(doorPanelWidth/2 - 0.6, -this.wallHeight/2 + doorHeight/2 - 0.1, 0.35);
    leftHandle.castShadow = true;
    leftDoorGroup.add(leftHandle);
    
    // Right door handle (attached to right door)
    const rightHandle = new THREE.Mesh(handleGeometry, handleMaterial);
    rightHandle.position.set(-doorPanelWidth/2 + 0.6, -this.wallHeight/2 + doorHeight/2 - 0.1, 0.35);
    rightHandle.castShadow = true;
    rightDoorGroup.add(rightHandle);
    
    // Position the wall group
    wallGroup.position.set(x, y, z);
    wallGroup.rotation.set(rx, ry, rz);
    
    // Add small offset to prevent z-fighting with structural beams
    if (name === 'front') {
      wallGroup.position.z -= 0.05;
    } else if (name === 'back') {
      wallGroup.position.z += 0.05;
    }
    
    this.root.add(wallGroup);
  }

  #createGableWall(name, x, y, z) {
    // Create triangular gable end
    const gableHeight = this.roofHeight - this.wallHeight;
    const gableShape = new THREE.Shape();
    gableShape.moveTo(-this.width/2, -gableHeight/2);
    gableShape.lineTo(this.width/2, -gableHeight/2);
    gableShape.lineTo(0, gableHeight/2);
    gableShape.lineTo(-this.width/2, -gableHeight/2);
    
    const gableGeometry = new THREE.ShapeGeometry(gableShape);
    const gableMaterial = new THREE.MeshPhongMaterial({
      map: textureManager.getWallTexture(),
      normalMap: textureManager.getWallNormalMap(),
      shininess: 80,
      side: THREE.DoubleSide
    });
    
    const gable = new THREE.Mesh(gableGeometry, gableMaterial);
    gable.position.set(x, y, z);
    if (name === 'back_gable') {
      gable.rotation.y = Math.PI;
      gable.position.z += 0.1; // Offset to prevent z-fighting
    } else {
      gable.position.z -= 0.1; // Offset to prevent z-fighting
    }
    gable.receiveShadow = true;
    gable.castShadow = true;
    this.root.add(gable);
  }

  #createPitchedRoof() {
    const roofMaterial = new THREE.MeshPhongMaterial({
      map: textureManager.getCorrugatedRoofTexture(),
      shininess: 60,
      side: THREE.DoubleSide
    });

    // Create roof using BufferGeometry for precise control
    const vertices = [];
    const uvs = [];
    const indices = [];

    // Roof dimensions
    const halfWidth = this.width / 2;
    const peakHeight = this.roofHeight;
    const wallHeight = this.wallHeight;
    const halfDepth = this.depth / 2;

    // Define roof vertices (4 corners + 2 peak points)
    // Left wall edge points
    vertices.push(-halfWidth, wallHeight, -halfDepth);  // 0: back-left-bottom
    vertices.push(-halfWidth, wallHeight, halfDepth);   // 1: front-left-bottom
    
    // Right wall edge points  
    vertices.push(halfWidth, wallHeight, -halfDepth);   // 2: back-right-bottom
    vertices.push(halfWidth, wallHeight, halfDepth);    // 3: front-right-bottom
    
    // Peak points
    vertices.push(0, peakHeight, -halfDepth);           // 4: back-peak
    vertices.push(0, peakHeight, halfDepth);            // 5: front-peak

    // Left roof panel (triangle strip)
    indices.push(0, 1, 4);  // Back triangle
    indices.push(1, 5, 4);  // Front triangle
    
    // Right roof panel (triangle strip)
    indices.push(2, 4, 3);  // Back triangle  
    indices.push(3, 4, 5);  // Front triangle

    // UV coordinates for texture mapping
    uvs.push(0, 0);  // 0
    uvs.push(0, 1);  // 1
    uvs.push(1, 0);  // 2
    uvs.push(1, 1);  // 3
    uvs.push(0.5, 0); // 4
    uvs.push(0.5, 1); // 5

    // Create geometry
    const roofGeometry = new THREE.BufferGeometry();
    roofGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    roofGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    roofGeometry.setIndex(indices);
    roofGeometry.computeVertexNormals();

    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.receiveShadow = true;
    roof.position.y = 0.05; // Small offset to prevent z-fighting with beams
    this.root.add(roof);

    // No ridge beam - clean roof line as shown in renders
  }

  #createStructuralBeams() {
    // No structural beams - clean industrial look
  }

  #createRoofTruss(z) {
    // No roof trusses - clean industrial look
  }

  #createCeilingLights() {
    // Create 6 industrial spotlight fixtures hanging from the roof structure
    this.spotlights = [];
    const lightPositions = [
      [-18, 0],  // Front left
      [0, 0],    // Front center
      [18, 0],   // Front right
      [-18, -12], // Back left
      [0, -12],   // Back center
      [18, -12]   // Back right
    ];

    lightPositions.forEach((pos, index) => {
      // Calculate the roof height at this position for pitched roof
      const distanceFromCenter = Math.abs(pos[0]); // Distance from center line
      const roofHeightAtPosition = this.wallHeight + (this.roofHeight - this.wallHeight) * (1 - distanceFromCenter / (this.width / 2));
      
      // Create industrial light fixture model
      const fixtureGroup = new THREE.Group();
      
      // Hanging chain/cable - hang from actual roof height
      const cableLength = 4; // Shorter cable for proper hanging height
      const cableGeometry = new THREE.CylinderGeometry(0.02, 0.02, cableLength, 8);
      const cableMaterial = new THREE.MeshPhongMaterial({
        color: 0x333333,
        shininess: 50
      });
      const cable = new THREE.Mesh(cableGeometry, cableMaterial);
      cable.position.y = roofHeightAtPosition - cableLength/2 - 0.2; // Hang from roof surface
      fixtureGroup.add(cable);

      // Industrial light housing
      const housingGeometry = new THREE.CylinderGeometry(1.2, 1.5, 0.8, 16);
      const housingMaterial = new THREE.MeshPhongMaterial({
        color: 0x2a2a2a,
        shininess: 100,
        metalness: 0.8
      });
      const housing = new THREE.Mesh(housingGeometry, housingMaterial);
      housing.position.y = roofHeightAtPosition - cableLength - 1.0; // Hang from cable
      housing.castShadow = true;
      fixtureGroup.add(housing);

      // Reflector inside
      const reflectorGeometry = new THREE.CylinderGeometry(1.0, 1.3, 0.1, 16);
      const reflectorMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        shininess: 200,
        emissive: 0x222222
      });
      const reflector = new THREE.Mesh(reflectorGeometry, reflectorMaterial);
      reflector.position.y = roofHeightAtPosition - cableLength - 1.3; // Inside housing
      fixtureGroup.add(reflector);

      // Glass cover
      const glassGeometry = new THREE.CylinderGeometry(1.1, 1.1, 0.05, 16);
      const glassMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        shininess: 200
      });
      const glass = new THREE.Mesh(glassGeometry, glassMaterial);
      glass.position.y = roofHeightAtPosition - cableLength - 1.4; // Bottom of housing
      fixtureGroup.add(glass);

      // Position fixture
      fixtureGroup.position.set(pos[0], 0, pos[1]);
      this.root.add(fixtureGroup);

      // Create actual spotlight - optimized
      const spotlight = new THREE.SpotLight(0xfff4e6, 2.0, 35, Math.PI / 3, 0.4, 2);
      spotlight.position.set(pos[0], roofHeightAtPosition - cableLength - 1.5, pos[1]); // At fixture height
      spotlight.target.position.set(pos[0], 0, pos[1]);
      spotlight.castShadow = true;
      spotlight.shadow.mapSize.width = 512; // Reduced from 1024
      spotlight.shadow.mapSize.height = 512;
      spotlight.shadow.camera.near = 0.5;
      spotlight.shadow.camera.far = 30; // Reduced from 40
      
      this.root.add(spotlight);
      this.root.add(spotlight.target);
      this.spotlights.push(spotlight);
    });
  }

  // Method to get spotlight parameters for GUI control
  getSpotlightParams() {
    return {
      intensity: this.spotlights[0]?.intensity || 1.5,
      distance: this.spotlights[0]?.distance || 30,
      angle: this.spotlights[0]?.angle || Math.PI / 4,
      penumbra: this.spotlights[0]?.penumbra || 0.3,
      decay: this.spotlights[0]?.decay || 2
    };
  }

  // Method to update all spotlights
  updateSpotlights(params) {
    this.spotlights.forEach(light => {
      light.intensity = params.intensity;
      light.distance = params.distance;
      light.angle = params.angle;
      light.penumbra = params.penumbra;
      light.decay = params.decay;
    });
  }

  #createWarehouseDetails() {
    // Agregar ventiladores de techo
    const fanPositions = [
      [-15, this.roofHeight - 2, 0],
      [15, this.roofHeight - 2, 0],
      [0, this.roofHeight - 2, 10],
      [0, this.roofHeight - 2, -10]
    ];
    
    fanPositions.forEach(pos => {
      const fanGroup = new THREE.Group();
      
      // Motor del ventilador
      const motorGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.4, 16);
      const motorMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x444444, 
        shininess: 100 
      });
      const motor = new THREE.Mesh(motorGeometry, motorMaterial);
      motor.castShadow = true;
      fanGroup.add(motor);
      
      // Aspas del ventilador
      for (let i = 0; i < 4; i++) {
        const bladeGeometry = new THREE.BoxGeometry(0.1, 0.02, 2.5);
        const bladeMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x666666, 
          shininess: 80 
        });
        const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade.position.y = -0.15;
        blade.rotation.y = (i * Math.PI) / 2;
        blade.castShadow = true;
        fanGroup.add(blade);
      }
      
      fanGroup.position.set(pos[0], pos[1], pos[2]);
      this.root.add(fanGroup);
    });
    
    // Agregar cajas de herramientas en las paredes
    const toolboxPositions = [
      [-this.width/2 + 1, 2, -5],
      [-this.width/2 + 1, 2, 5],
      [this.width/2 - 1, 2, -5],
      [this.width/2 - 1, 2, 5]
    ];
    
    toolboxPositions.forEach(pos => {
      const toolboxGeometry = new THREE.BoxGeometry(1.5, 0.8, 0.3);
      const toolboxMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xff4444, 
        shininess: 100 
      });
      const toolbox = new THREE.Mesh(toolboxGeometry, toolboxMaterial);
      toolbox.position.set(pos[0], pos[1], pos[2]);
      toolbox.castShadow = true;
      toolbox.receiveShadow = true;
      this.root.add(toolbox);
      
      // Manijas de la caja
      const handleGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      const handleMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
      const handle1 = new THREE.Mesh(handleGeometry, handleMaterial);
      handle1.position.set(pos[0] - 0.3, pos[1], pos[2] + 0.2);
      const handle2 = new THREE.Mesh(handleGeometry, handleMaterial);
      handle2.position.set(pos[0] + 0.3, pos[1], pos[2] + 0.2);
      this.root.add(handle1, handle2);
    });
    
    // Agregar extintores
    const extinguisherPositions = [
      [-10, 1.5, this.depth/2 - 0.5],
      [10, 1.5, this.depth/2 - 0.5],
      [-10, 1.5, -this.depth/2 + 0.5],
      [10, 1.5, -this.depth/2 + 0.5]
    ];
    
    extinguisherPositions.forEach(pos => {
      const extGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.8, 16);
      const extMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xff0000, 
        shininess: 150 
      });
      const extinguisher = new THREE.Mesh(extGeometry, extMaterial);
      extinguisher.position.set(pos[0], pos[1], pos[2]);
      extinguisher.castShadow = true;
      extinguisher.receiveShadow = true;
      this.root.add(extinguisher);
      
      // Manguera del extintor
      const hoseGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8);
      const hoseMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
      const hose = new THREE.Mesh(hoseGeometry, hoseMaterial);
      hose.position.set(pos[0] + 0.1, pos[1] - 0.2, pos[2]);
      hose.rotation.z = Math.PI / 6;
      this.root.add(hose);
    });
  }

  center() {
    return new THREE.Vector3(0, this.wallHeight/2, 0);
  }

  openDoors() {
    // Animate doors opening
    this.#animateDoors(this.frontDoors, true);
    this.#animateDoors(this.backDoors, true);
  }

  closeDoors() {
    // Animate doors closing
    this.#animateDoors(this.frontDoors, false);
    this.#animateDoors(this.backDoors, false);
  }

  toggleDoors() {
    if (this.frontDoors.isOpen) {
      this.closeDoors();
    } else {
      this.openDoors();
    }
  }

  #animateDoors(doorSet, open) {
    if (!doorSet.left || !doorSet.right) return;
    
    const targetAngle = open ? this.doorOpenAngle : 0;
    const duration = 1000; // 1 second
    const startTime = performance.now();
    
    const startRotationLeft = doorSet.left.rotation.y;
    const startRotationRight = doorSet.right.rotation.y;
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      // Left door opens counterclockwise (negative rotation)
      doorSet.left.rotation.y = startRotationLeft + ((-targetAngle - startRotationLeft) * easeProgress);
      
      // Right door opens clockwise (positive rotation)
      doorSet.right.rotation.y = startRotationRight + ((targetAngle - startRotationRight) * easeProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        doorSet.isOpen = open;
        if (doorSet === this.frontDoors) {
          this.backDoors.isOpen = open;
        }
      }
    };
    
    requestAnimationFrame(animate);
  }
}