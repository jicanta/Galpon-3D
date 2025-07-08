import * as THREE from 'three';
import { Forklift }      from './components/Forklift.js';
import { Printer }       from './components/Printer.js';
import { Shelf }         from './components/Shelf.js';
import { Warehouse }     from './components/Warehouse.js';
import { CameraManager } from './logic/CameraManager.js';
import { Input }         from './logic/Input.js';
import { initGUI }       from './gui/Menu.js';
import { textureManager } from './utils/TextureLoader.js';

/* ------------ escena & renderer ------------ */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x252525);

let renderer;
if (globalThis.__renderer__) {
  renderer = globalThis.__renderer__;
} else {
  renderer = new THREE.WebGLRenderer({ 
    antialias: false, // Disable for better performance
    powerPreference: "high-performance"
  });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.localClippingEnabled = true;
  document.body.style.margin = '0';
  document.body.appendChild(renderer.domElement);
  globalThis.__renderer__ = renderer;
}

renderer.setSize(window.innerWidth, window.innerHeight);

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
// Luz ambiental principal
const ambient = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambient);
scene.lights.ambient = ambient;

// Luz direccional principal (como el sol) - con sombras optimizadas
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(6, 12, 6);
dir.castShadow = true;
dir.shadow.mapSize.width = 1024; // Reduced from 2048
dir.shadow.mapSize.height = 1024;
dir.shadow.camera.near = 0.5;
dir.shadow.camera.far = 40; // Reduced from 50
dir.shadow.camera.left = -15; // Reduced from -20
dir.shadow.camera.right = 15;
dir.shadow.camera.top = 15;
dir.shadow.camera.bottom = -15;
scene.add(dir);
scene.lights.directional = dir;

// Luz puntual principal - optimizada
const pt = new THREE.PointLight(0xfff0e0, 0.4, 30, 2); // Reduced distance
pt.position.set(0, 6, -2);
pt.castShadow = true;
pt.shadow.mapSize.width = 512; // Reduced from 1024
pt.shadow.mapSize.height = 512;
scene.add(pt);
scene.lights.point = pt;

// Luz de relleno
const fill = new THREE.DirectionalLight(0xffffff, 0.2);
fill.position.set(-6, 8, -6);
scene.add(fill);
scene.lights.fill = fill;

/* ------------ warehouse and environment ------------ */
const warehouse = new Warehouse();
scene.add(warehouse.root);

// Basic floor for areas outside the warehouse
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshPhongMaterial({ 
    color: 0x5a5a5a, 
    shininess: 30
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

  printer.update(dt);
  forklift.update(input, dt);
  shelf.root.traverse(o => { if (o.animateIn) o.animateIn(dt); });
  camManager.update(forklift);

  renderer.render(scene, camManager.active());
}
animate();
