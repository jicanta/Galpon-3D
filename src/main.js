/* ------------ imports ------------ */
import * as THREE from 'three';
import { Forklift }      from './components/Forklift.js';
import { Printer }       from './components/Printer.js';
import { Shelf }         from './components/Shelf.js';
import { CameraManager } from './logic/CameraManager.js';
import { Input }         from './logic/Input.js';
import { initGUI }       from './gui/Menu.js';
import { hud }           from './hud.js';          // ←  importa HUD aquí

/* ------------ escena & renderer ------------ */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x252525);

let renderer;
if (globalThis.__renderer__) {
  renderer = globalThis.__renderer__;
} else {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled  = true;
  renderer.toneMapping        = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace   = THREE.SRGBColorSpace;
  document.body.style.margin  = '0';
  document.body.appendChild(renderer.domElement);
  globalThis.__renderer__ = renderer;              // cache global
}

renderer.setSize(window.innerWidth, window.innerHeight);

/* ------------ cámaras ------------ */
const camManager = new CameraManager(renderer, scene);

/* ------------ luces ------------ */
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const dir = new THREE.DirectionalLight(0xffffff, 1.5);
dir.position.set(6, 12, 6);
dir.castShadow = true; scene.add(dir);
const pt = new THREE.PointLight(0xfff0e0, 0.8, 50, 2);
pt.position.set(0, 6, -2); scene.add(pt);

/* ------------ suelo + grid ------------ */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0x5a5a5a, roughness: 0.8 })
);
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

const grid = new THREE.GridHelper(200, 40, 0xffffff, 0x666666);
grid.position.y = 0.001; grid.material.transparent = true; grid.material.opacity = 0.25;
scene.add(grid);

/* ------------ objetos ------------ */
const forklift = new Forklift(); scene.add(forklift.root);
const printer  = new Printer();  scene.add(printer.root);
const shelf    = new Shelf();    scene.add(shelf.root);
forklift.setEnvironment(printer, shelf);
camManager.setTargets(printer, shelf);

/* ------------ GUI ------------ */
initGUI(printer);                // GUI actualiza HUD

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
