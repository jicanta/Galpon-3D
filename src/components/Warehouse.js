import * as THREE from 'three';
import { textureManager } from '../utils/TextureLoader.js';

export class Warehouse {
  constructor() {
    this.root = new THREE.Group();
    this.width = 60;
    this.wallHeight = 8;
    this.roofHeight = 18; // Increased from 12 to 18 for proper warehouse height
    this.depth = 40;
    
    this.#createWarehouseStructure();
    this.#createStructuralBeams();
    this.#createCeilingLights();
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

    // Corrugated metal walls
    this.#createCorrugatedWall('front', 0, this.wallHeight/2, this.depth/2, 0, 0, 0);
    this.#createCorrugatedWall('back', 0, this.wallHeight/2, -this.depth/2, 0, Math.PI, 0);
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
      metalness: 0.3
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
      shininess: 80
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

      // Create actual spotlight
      const spotlight = new THREE.SpotLight(0xfff4e6, 2.5, 50, Math.PI / 3, 0.4, 2);
      spotlight.position.set(pos[0], roofHeightAtPosition - cableLength - 1.5, pos[1]); // At fixture height
      spotlight.target.position.set(pos[0], 0, pos[1]);
      spotlight.castShadow = true;
      spotlight.shadow.mapSize.width = 1024;
      spotlight.shadow.mapSize.height = 1024;
      spotlight.shadow.camera.near = 0.5;
      spotlight.shadow.camera.far = 40;
      
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

  center() {
    return new THREE.Vector3(0, this.wallHeight/2, 0);
  }
}