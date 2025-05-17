import * as THREE from 'three';
import { FontLoader }   from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { Tween, Easing, update as tweenUpdate } from '@tweenjs/tween.js';

let renderer, scene, camera, animId, running = true;

/* ────────── menú ────────── */
initMenu();
animate();

function initMenu() {
  scene  = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 100);
  camera.position.set(0, 0, 15);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0x404040));
  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(10, 10, 10);
  scene.add(light);

  new FontLoader().load(
    'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
    font => {
      const geo = new TextGeometry('Galpón 3D', {
        font, size: 2.5, height: 0.5, curveSegments: 12,
        bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.08
      });
      geo.center();
      const mat  = new THREE.MeshPhongMaterial({ color: 0xffc107, shininess: 120 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -0.3;
      scene.add(mesh);

      /* animaciones */
      mesh.scale.set(0,0,0);
      new Tween(mesh.scale)
        .to({ x: 1, y: 1, z: 1 }, 1200)
        .easing(Easing.Elastic.Out)
        .start();
      new Tween(mat.color)
        .to({ r: 0.2, g: 0.6, b: 1.0 }, 1800)
        .yoyo(true).repeat(Infinity).start();
    }
  );

  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', loadApp);
}

function animate(time=0) {
  if (!running) return;
  animId = requestAnimationFrame(animate);
  tweenUpdate(time);
  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}

async function loadApp(e){
  if (e.key !== 'Enter') return;
  window.removeEventListener('keydown', loadApp);
  running = false;                     // corta el loop
  cancelAnimationFrame(animId);
  renderer.dispose();
  document.body.removeChild(renderer.domElement);

  const { initApp } = await import('./app.js');
  initApp();
}
