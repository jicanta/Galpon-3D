import * as THREE from 'three';
import { Forklift }      from './components/Forklift.js';
import { Printer }       from './components/Printer.js';
import { Shelf }         from './components/Shelf.js';
import { Warehouse }     from './components/Warehouse.js';
import { CameraManager } from './logic/CameraManager.js';
import { Input }         from './logic/Input.js';
import { initGUI }       from './gui/Menu.js';
import { textureManager } from './utils/TextureLoader.js';

/* ------------ Performance optimizations ------------ */
const PERFORMANCE_CONFIG = {
  // LOD distances
  LOD_NEAR: 50,
  LOD_MEDIUM: 100,
  LOD_FAR: 200,
  
  // Object counts (balanced for quality and performance)
  GRASS_COUNT: 3000, // Increased for better visual
  TREE_COUNT: 15,    // Increased for better visual
  FLOWER_COUNT: 50,  // Reduced for performance, focus on printer
  BUSH_COUNT: 8,     // Increased for better visual
  
  // Shadow quality
  SHADOW_MAP_SIZE: 2048, // Better shadow quality
  
  // Culling
  CULLING_DISTANCE: 150,
  
  // Material optimization
  USE_LAMBERT: false // Use Phong materials for better quality
};

/* ------------ escena & renderer ------------ */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x252525);

let renderer;
if (globalThis.__renderer__) {
  renderer = globalThis.__renderer__;
} else {
  renderer = new THREE.WebGLRenderer({ 
    antialias: true, // Enable antialiasing for better quality
    powerPreference: "high-performance",
    precision: "highp" // Use high precision for better quality
  });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Better shadow quality
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2; // Slightly brighter for better visibility
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.localClippingEnabled = true;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Better pixel ratio
  document.body.style.margin = '0';
  document.body.appendChild(renderer.domElement);
  globalThis.__renderer__ = renderer;
}

renderer.setSize(window.innerWidth, window.innerHeight);

// Frustum culling
const frustum = new THREE.Frustum();
const camera = new THREE.PerspectiveCamera();
const projScreenMatrix = new THREE.Matrix4();

// Object culling helper
function isInFrustum(object) {
  if (!object.geometry) return true;
  const sphere = new THREE.Sphere();
  object.geometry.boundingSphere = object.geometry.boundingSphere || 
    object.geometry.computeBoundingSphere();
  sphere.copy(object.geometry.boundingSphere);
  sphere.applyMatrix4(object.matrixWorld);
  return frustum.containsSphere(sphere);
}

// Objeto para almacenar parámetros de iluminación
scene.lights = {
  directional: null,
  point: null,
  ambient: null,
  fill: null,
  renderer: renderer
};

/* ------------ cámaras ------------ */
const camManager = new CameraManager(renderer, scene);

/* ------------ luces ------------ */
// Enhanced atmospheric lighting for professional look
const ambient = new THREE.AmbientLight(0xE6F3FF, 0.4); // Soft blue ambient
scene.add(ambient);
scene.lights.ambient = ambient;

// Main sun light with warm golden tone
const dir = new THREE.DirectionalLight(0xFFE4B5, 1.2);
dir.position.set(50, 80, 30);
dir.castShadow = true;
dir.shadow.mapSize.width = PERFORMANCE_CONFIG.SHADOW_MAP_SIZE;
dir.shadow.mapSize.height = PERFORMANCE_CONFIG.SHADOW_MAP_SIZE;
dir.shadow.camera.near = 0.5;
dir.shadow.camera.far = 200;
dir.shadow.camera.left = -100;
dir.shadow.camera.right = 100;
dir.shadow.camera.top = 100;
dir.shadow.camera.bottom = -100;
dir.shadow.bias = -0.0001;
scene.add(dir);
scene.lights.directional = dir;

// Soft fill light from opposite direction
const fill = new THREE.DirectionalLight(0xB0E0E6, 0.3);
fill.position.set(-30, 40, -20);
scene.add(fill);
scene.lights.fill = fill;

// Atmospheric fog for depth
scene.fog = new THREE.Fog(0x87CEEB, 80, 300);



/* ------------ warehouse and environment ------------ */
const warehouse = new Warehouse();
scene.add(warehouse.root);

// Initialize the beautiful environment
createGrassField();
createTrees();
createFlowers();
createBushes();
createLake();

// Enhanced sky with better atmosphere
scene.background = new THREE.Color(0x87CEEB);
function createGrassField() {
  // Create grass texture with better performance
  const grassGeometry = new THREE.PlaneGeometry(300, 300);
  const grassMaterial = new THREE.MeshLambertMaterial({ 
    color: 0x4a6741,
    transparent: false
  });
  
  const grassField = new THREE.Mesh(grassGeometry, grassMaterial);
  grassField.rotation.x = -Math.PI / 2;
  grassField.position.y = -0.02;
  grassField.receiveShadow = true;
  scene.add(grassField);

  // Optimized grass blades using instanced rendering - reduced count
  const grassBladeGeometry = new THREE.ConeGeometry(0.05, 0.8, 3);
  const grassBladeMaterial = new THREE.MeshLambertMaterial({ color: 0x2d5016 });
  
  // Use instanced mesh for better performance - reduced grass count
  const instancedGrass = new THREE.InstancedMesh(grassBladeGeometry, grassBladeMaterial, PERFORMANCE_CONFIG.GRASS_COUNT);
  instancedGrass.receiveShadow = true;
  instancedGrass.castShadow = false;
  
  const matrix = new THREE.Matrix4();
  let instanceIndex = 0;
  
  for (let i = 0; i < PERFORMANCE_CONFIG.GRASS_COUNT * 2 && instanceIndex < PERFORMANCE_CONFIG.GRASS_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 25 + Math.random() * 140; // Even closer to warehouse
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    
    // Add grass near warehouse but not inside (warehouse is 60x40, so avoid center area)
    const isInsideWarehouse = Math.abs(x) < 32 && Math.abs(z) < 22;
    const isTooCloseToWarehouse = Math.abs(x) < 32 && Math.abs(z) < 22; // Reduced safe zone
    
    // Avoid lake area (lake is at z=-100 with radius 10, so avoid z=-110 to z=-90)
    const isInLakeArea = Math.abs(z - (-100)) < 15 && Math.abs(x) < 15;
    
    if (!isInsideWarehouse && !isTooCloseToWarehouse && !isInLakeArea) {
      const scale = 0.4 + Math.random() * 1.0; // More variety in grass height
      matrix.makeTranslation(x, 0.4, z);
      matrix.scale(new THREE.Vector3(1, scale, 1));
      matrix.multiply(new THREE.Matrix4().makeRotationY(Math.random() * Math.PI));
      instancedGrass.setMatrixAt(instanceIndex, matrix);
      instanceIndex++;
    }
  }
  
  instancedGrass.instanceMatrix.needsUpdate = true;
  scene.add(instancedGrass);
}

// Create optimized trees with LOD
function createTrees() {
  // Strategic tree positioning for artistic composition - reduced count
  const treePositions = [
    // Background forest line
    [-85, 0, -45], [-65, 0, -65], [-95, 0, 15], [-75, 0, 50],
    [85, 0, -40], [70, 0, -60], [90, 0, 20], [80, 0, 55],
    // Foreground featured trees
    [-50, 0, -85], [0, 0, -95], [50, 0, -90], [25, 0, -80]
  ];

  // Different tree types for variety
  const treeTypes = [
    { name: 'oak', trunkColor: 0x8B4513, crownColors: [0x228B22, 0x32CD32, 0x1F4F1F] },
    { name: 'pine', trunkColor: 0x654321, crownColors: [0x0F4F0F, 0x1C5C1C, 0x2F6F2F] },
    { name: 'birch', trunkColor: 0xF5F5DC, crownColors: [0x90EE90, 0x98FB98, 0x7CFC00] }
  ];

  treePositions.forEach((pos, index) => {
    const treeGroup = new THREE.Group();
    const treeType = treeTypes[index % treeTypes.length];
    const distance = Math.sqrt(pos[0] * pos[0] + pos[2] * pos[2]);
    
    // Create optimized trunk with reduced geometry
    const trunkHeight = 12 + Math.random() * 8;
    const trunkRadius = 0.6 + Math.random() * 0.8;
    const trunkGeometry = new THREE.CylinderGeometry(
      trunkRadius * 0.8, trunkRadius, trunkHeight, 12 // Better quality
    );
    const trunkMaterial = PERFORMANCE_CONFIG.USE_LAMBERT ? 
      new THREE.MeshLambertMaterial({ color: treeType.trunkColor }) :
      new THREE.MeshPhongMaterial({ 
        color: treeType.trunkColor,
        shininess: 10,
        bumpScale: 0.1
      });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = trunkHeight / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);
    
    // Create simplified crown based on distance
    if (distance < PERFORMANCE_CONFIG.LOD_NEAR) {
      // High detail for close trees
      if (treeType.name === 'pine') {
        // Coniferous tree with layered triangular sections
        for (let layer = 0; layer < 4; layer++) {
          const coneRadius = (4 - layer) * 1.5 + Math.random() * 0.5;
          const coneHeight = 4 + Math.random() * 2;
          const coneGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 12); // Better quality
          const coneMaterial = PERFORMANCE_CONFIG.USE_LAMBERT ?
            new THREE.MeshLambertMaterial({
              color: treeType.crownColors[Math.floor(Math.random() * treeType.crownColors.length)]
            }) :
            new THREE.MeshPhongMaterial({
              color: treeType.crownColors[Math.floor(Math.random() * treeType.crownColors.length)],
              shininess: 5
            });
          const cone = new THREE.Mesh(coneGeometry, coneMaterial);
          cone.position.y = trunkHeight + layer * 3 + coneHeight / 2;
          cone.position.x = (Math.random() - 0.5) * 0.5;
          cone.position.z = (Math.random() - 0.5) * 0.5;
          cone.castShadow = true;
          cone.receiveShadow = true;
          treeGroup.add(cone);
        }
      } else {
        // Deciduous tree with multiple crown spheres
        const numCrowns = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numCrowns; i++) {
          const crownRadius = 3 + Math.random() * 3;
          const crownGeometry = new THREE.SphereGeometry(crownRadius, 12, 8); // Better quality
          const crownMaterial = PERFORMANCE_CONFIG.USE_LAMBERT ?
            new THREE.MeshLambertMaterial({
              color: treeType.crownColors[Math.floor(Math.random() * treeType.crownColors.length)]
            }) :
            new THREE.MeshPhongMaterial({
              color: treeType.crownColors[Math.floor(Math.random() * treeType.crownColors.length)],
              shininess: 20
            });
          const crown = new THREE.Mesh(crownGeometry, crownMaterial);
          
          // Position crowns naturally
          const angle = (i / numCrowns) * Math.PI * 2 + Math.random() * 0.5;
          crown.position.x = Math.cos(angle) * (1 + Math.random() * 2);
          crown.position.z = Math.sin(angle) * (1 + Math.random() * 2);
          crown.position.y = trunkHeight + 2 + Math.random() * 4;
          crown.scale.setScalar(0.7 + Math.random() * 0.6);
          crown.castShadow = true;
          crown.receiveShadow = true;
          treeGroup.add(crown);
        }
      }
    } else if (distance < PERFORMANCE_CONFIG.LOD_MEDIUM) {
      // Medium detail for medium distance
      const crownRadius = 4 + Math.random() * 2;
      const crownGeometry = new THREE.SphereGeometry(crownRadius, 6, 4);
      const crownMaterial = PERFORMANCE_CONFIG.USE_LAMBERT ?
        new THREE.MeshLambertMaterial({
          color: treeType.crownColors[Math.floor(Math.random() * treeType.crownColors.length)]
        }) :
        new THREE.MeshPhongMaterial({
          color: treeType.crownColors[Math.floor(Math.random() * treeType.crownColors.length)],
          shininess: 20
        });
      const crown = new THREE.Mesh(crownGeometry, crownMaterial);
      crown.position.y = trunkHeight + 4;
      crown.castShadow = true;
      crown.receiveShadow = true;
      treeGroup.add(crown);
    } else {
      // Low detail for distant trees - just trunk and simple crown
      const crownRadius = 3;
      const crownGeometry = new THREE.SphereGeometry(crownRadius, 4, 3);
      const crownMaterial = new THREE.MeshLambertMaterial({
        color: treeType.crownColors[0]
      });
      const crown = new THREE.Mesh(crownGeometry, crownMaterial);
      crown.position.y = trunkHeight + 3;
      crown.castShadow = false; // No shadows for distant objects
      crown.receiveShadow = false;
      treeGroup.add(crown);
    }
    
    treeGroup.position.set(pos[0], pos[1], pos[2]);
    const scale = 0.7 + Math.random() * 0.6;
    treeGroup.scale.setScalar(scale);
    
    // LOD - hide very distant trees
    if (distance > PERFORMANCE_CONFIG.CULLING_DISTANCE) {
      treeGroup.visible = false;
    }
    
    scene.add(treeGroup);
  });
}

// Create simplified flowers for performance
function createFlowers() {
  // Strategic flower beds around the warehouse
  createFlowerBed(-75, 0, 65, 6, [0xFFFF00, 0xFFA500, 0xFF8C00]);
  createFlowerBed(-45, 0, 75, 5, [0x00BFFF, 0x1E90FF, 0x0080FF]);
  createFlowerBed(-80, 0, 45, 4, [0xFF69B4, 0xFFB6C1, 0xFFC0CB]);
  
  // Additional colorful flower beds
  createFlowerBed(75, 0, 65, 5, [0xFF1493, 0xFF69B4, 0xFFB6C1]); // Pink roses
  createFlowerBed(45, 0, 75, 6, [0x32CD32, 0x00FF7F, 0x90EE90]); // Green flowers
  createFlowerBed(80, 0, 45, 4, [0x9370DB, 0x8A2BE2, 0x9932CC]); // Purple flowers
  createFlowerBed(-60, 0, -60, 5, [0xFF4500, 0xFF6347, 0xFF7F50]); // Orange flowers
  createFlowerBed(60, 0, -60, 4, [0x00CED1, 0x40E0D0, 0x48D1CC]); // Turquoise flowers
  
  // Wildflower patches throughout the scene - increased count for more color
  for (let i = 0; i < 15; i++) { // Increased from 8 to 15
    const angle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 80;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    
    // Avoid warehouse area
    if (Math.abs(x) > 35 || Math.abs(z) > 25) {
      const colors = [
        0xFF69B4, 0x9370DB, 0xFFFF00, 0xFF4500, 0x00BFFF, 0x32CD32,
        0xFF1493, 0x8A2BE2, 0x00CED1, 0xFF6347, 0x90EE90, 0xFF7F50,
        0x9932CC, 0x40E0D0, 0xFFB6C1, 0x48D1CC
      ];
      const patchSize = 2 + Math.random() * 3; // Slightly larger patches
      createFlowerCluster(x, 0, z, patchSize, [colors[Math.floor(Math.random() * colors.length)]]);
    }
  }
}

function createFlowerBed(x, y, z, width, depth, colors) {
  const flowerGroup = new THREE.Group();
  
  // Create flower bed base
  const bedGeometry = new THREE.CylinderGeometry(width/2, width/2, 0.2, 16);
  const bedMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
  const bed = new THREE.Mesh(bedGeometry, bedMaterial);
  bed.position.set(x, y + 0.1, z);
  bed.receiveShadow = true;
  scene.add(bed);
  
  // Add flowers in organized rows
  for (let i = 0; i < width * depth * 2; i++) {
    const flowerX = x + (Math.random() - 0.5) * width;
    const flowerZ = z + (Math.random() - 0.5) * depth;
    const color = colors[Math.floor(Math.random() * colors.length)];
    createSingleFlower(flowerX, y + 0.2, flowerZ, color, flowerGroup);
  }
  
  scene.add(flowerGroup);
}

function createFlowerCluster(x, y, z, radius, colors) {
  const flowerGroup = new THREE.Group();
  const numFlowers = Math.max(3, radius * 4); // Reduced from radius * 8 to radius * 4, minimum 3
  
  for (let i = 0; i < numFlowers; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radius;
    const flowerX = x + Math.cos(angle) * distance;
    const flowerZ = z + Math.sin(angle) * distance;
    const color = colors[Math.floor(Math.random() * colors.length)];
    createSingleFlower(flowerX, y, flowerZ, color, flowerGroup);
  }
  
  scene.add(flowerGroup);
}

function createSingleFlower(x, y, z, color, parent) {
  const flowerGroup = new THREE.Group();
  
  // Flower stem
  const stemGeometry = new THREE.CylinderGeometry(0.02, 0.03, 0.8, 4);
  const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
  const stem = new THREE.Mesh(stemGeometry, stemMaterial);
  stem.position.y = 0.4;
  flowerGroup.add(stem);
  
  // Flower petals (5 petals arranged in circle) - simplified
  const petalGeometry = new THREE.SphereGeometry(0.15, 6, 4); // Simplified for performance
  const petalMaterial = PERFORMANCE_CONFIG.USE_LAMBERT ? 
    new THREE.MeshLambertMaterial({ color: color }) :
    new THREE.MeshPhongMaterial({ 
      color: color,
      shininess: 30
    });
  
  for (let i = 0; i < 5; i++) {
    const petal = new THREE.Mesh(petalGeometry, petalMaterial);
    const angle = (i / 5) * Math.PI * 2;
    petal.position.x = Math.cos(angle) * 0.12;
    petal.position.z = Math.sin(angle) * 0.12;
    petal.position.y = 0.75;
    petal.scale.set(0.8, 0.3, 1);
    petal.castShadow = false; // Disable shadows for performance
    flowerGroup.add(petal);
  }
  
  // Flower center - simplified
  const centerGeometry = new THREE.SphereGeometry(0.06, 6, 4); // Simplified for performance
  const centerMaterial = PERFORMANCE_CONFIG.USE_LAMBERT ?
    new THREE.MeshLambertMaterial({ color: 0xFFFF00 }) :
    new THREE.MeshPhongMaterial({ 
      color: 0xFFFF00,
      shininess: 50
    });
  const center = new THREE.Mesh(centerGeometry, centerMaterial);
  center.position.y = 0.75;
  center.castShadow = false; // Disable shadows for performance
  flowerGroup.add(center);
  
  // Small leaves
  for (let i = 0; i < 2; i++) {
    const leafGeometry = new THREE.SphereGeometry(0.08, 6, 4);
    const leafMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
    leaf.position.x = (Math.random() - 0.5) * 0.3;
    leaf.position.y = 0.2 + i * 0.2;
    leaf.position.z = (Math.random() - 0.5) * 0.3;
    leaf.scale.set(0.5, 0.2, 1.2);
    leaf.rotation.z = Math.random() * Math.PI;
    flowerGroup.add(leaf);
  }
  
  flowerGroup.position.set(x, y, z);
  flowerGroup.scale.setScalar(0.8 + Math.random() * 0.4);
  flowerGroup.rotation.y = Math.random() * Math.PI * 2;
  
  parent.add(flowerGroup);
}

// Create bushes and shrubs for natural landscaping - reduced count for performance
function createBushes() {
  const bushPositions = [
    // Around warehouse corners
    [-35, 0, -25], [35, 0, -25], [-35, 0, 25], [35, 0, 25],
    // Near trees for natural grouping
    [-60, 0, -45], [60, 0, -45]
  ];
  
  bushPositions.forEach(pos => {
    const bushGroup = new THREE.Group();
    const numSpheres = 2 + Math.floor(Math.random() * 2); // Reduced from 3-6 to 2-3
    
    for (let i = 0; i < numSpheres; i++) {
      const bushRadius = 1.5 + Math.random() * 2;
      const bushGeometry = new THREE.SphereGeometry(bushRadius, 12, 8); // Better quality
      const bushMaterial = new THREE.MeshLambertMaterial({
        color: new THREE.Color().setHSL(0.25 + Math.random() * 0.1, 0.6, 0.3 + Math.random() * 0.2)
      });
      const bush = new THREE.Mesh(bushGeometry, bushMaterial);
      
      bush.position.x = (Math.random() - 0.5) * 4;
      bush.position.z = (Math.random() - 0.5) * 4;
      bush.position.y = bushRadius * 0.7;
      bush.scale.y = 0.6 + Math.random() * 0.4;
      bush.castShadow = true;
      bush.receiveShadow = true;
      bushGroup.add(bush);
    }
    
    bushGroup.position.set(pos[0], pos[1], pos[2]);
    scene.add(bushGroup);
  });
}

// Create a beautiful small lake
function createLake() {
  const lakeGroup = new THREE.Group();
  
  // Lake water surface - slightly below ground level
  const lakeGeometry = new THREE.CylinderGeometry(10, 10, 0.2, 32);
  const lakeMaterial = new THREE.MeshPhongMaterial({
    color: 0x006994, // Deep blue water color
    transparent: true,
    opacity: 0.9,
    shininess: 150,
    specular: 0x666666
  });
  const lake = new THREE.Mesh(lakeGeometry, lakeMaterial);
  lake.position.y = -0.05; // Closer to ground level
  lake.receiveShadow = true;
  lake.castShadow = true;
  lakeGroup.add(lake);
  
  // Lake shore/beach ring
  const shoreGeometry = new THREE.RingGeometry(10, 11, 32);
  const shoreMaterial = new THREE.MeshLambertMaterial({
    color: 0xD2B48C // Tan sand color
  });
  const shore = new THREE.Mesh(shoreGeometry, shoreMaterial);
  shore.rotation.x = -Math.PI / 2;
  shore.position.y = -0.05;
  shore.receiveShadow = true;
  lakeGroup.add(shore);
  
  // Small decorative rocks around the lake
  for (let i = 0; i < 15; i++) {
    const angle = (i / 15) * Math.PI * 2;
    const distance = 10.5 + Math.random() * 2;
    const rockGeometry = new THREE.SphereGeometry(0.3 + Math.random() * 0.4, 8, 6);
    const rockMaterial = new THREE.MeshLambertMaterial({
      color: new THREE.Color().setHSL(0.1, 0.3, 0.4 + Math.random() * 0.3)
    });
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    
    rock.position.x = Math.cos(angle) * distance;
    rock.position.z = Math.sin(angle) * distance;
    rock.position.y = 0.1;
    rock.scale.setScalar(0.8 + Math.random() * 0.4);
    rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    rock.castShadow = true;
    rock.receiveShadow = true;
    lakeGroup.add(rock);
  }
  
  // Position the lake further away to avoid interference with objects
  lakeGroup.position.set(0, 0, -100);
  scene.add(lakeGroup);
}

// Basic floor for areas outside the warehouse with stone texture
const floorTexture = new THREE.TextureLoader().load("maps/StoneTilesFloor01_1K_BaseColor.png");
floorTexture.repeat.x = 40;
floorTexture.repeat.y = 40;
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshPhongMaterial({ 
    color: 0xFFFFFF,
    specular: 0x444444,
    shininess: 60,
    map: floorTexture,
    side: THREE.DoubleSide
  })
);
floor.rotation.x = -Math.PI / 2; 
floor.receiveShadow = true; 
floor.position.y = -0.05; // Further below warehouse floor to avoid z-fighting
scene.add(floor);

const grid = new THREE.GridHelper(200, 40, 0xffffff, 0x666666);
grid.position.y = 0.001; 
grid.material.transparent = true; 
grid.material.opacity = 0.15;
scene.add(grid);

/* ------------ objetos ------------ */
const forklift = new Forklift(); scene.add(forklift.root);
const printer  = new Printer();  scene.add(printer.root);
const shelf    = new Shelf();    scene.add(shelf.root);
forklift.setEnvironment(printer, shelf, warehouse);
camManager.setTargets(printer, shelf);
camManager.setForklift(forklift);

/* ------------ GUI ------------ */
initGUI(printer, scene, warehouse);                

/* ------------ input ------------ */
const input = new Input();
window.addEventListener('keydown', e => input.onKey(e.code, true));
window.addEventListener('keyup',   e => input.onKey(e.code, false));
window.addEventListener('resize',  () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camManager.onResize();
});

/* ------------ loop ------------ */
function animate () {
  requestAnimationFrame(animate);
  const dt = camManager.deltaTime();

  // Update camera frustum for culling
  const activeCamera = camManager.active();
  projScreenMatrix.multiplyMatrices(activeCamera.projectionMatrix, activeCamera.matrixWorldInverse);
  frustum.setFromProjectionMatrix(projScreenMatrix);

  // Update objects with culling
  printer.update(dt);
  forklift.update(input, dt);
  
  // Optimized shelf traversal with culling
  shelf.root.traverse(o => { 
    if (o.animateIn && isInFrustum(o)) o.animateIn(dt); 
  });
  
  camManager.update(forklift);

  renderer.render(scene, activeCamera);
}
animate();
