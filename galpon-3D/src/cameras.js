import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function initCameras(scene){
  const cams = { list:[], active:null, update:()=>{} };

  /* 1 ─ Orbital general */
  const cam1 = new THREE.PerspectiveCamera(65, innerWidth/innerHeight, 0.1, 500);
  cam1.position.set(30,25,30);
  const ctl1 = new OrbitControls(cam1, document.body);
  ctl1.target.set(0,5,0); ctl1.update();
  cams.list[1] = cam1;

  /* 2 ─ Impresora */
  const cam2 = cam1.clone();
  const ctl2 = new OrbitControls(cam2, document.body);
  cam2.position.set(-15,10,-5); ctl2.target.set(-5,3,-5); ctl2.update();
  cams.list[2] = cam2;

  /* 3 ─ Estantería */
  const cam3 = cam1.clone();
  const ctl3 = new OrbitControls(cam3, document.body);
  cam3.position.set(15,10,-5); ctl3.target.set(15,3,-5); ctl3.update();
  cams.list[3] = cam3;

  /* 4 ─ Conductor / cabina */
  cams.list[4] = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.05, 100);

  /* 5 y 6 se asignan como follow cams en Forklift */
  cams.list[5] = new THREE.PerspectiveCamera(65, innerWidth/innerHeight, 0.1, 200);
  cams.list[6] = new THREE.PerspectiveCamera(65, innerWidth/innerHeight, 0.1, 200);

  cams.active = cam1;

  window.addEventListener('keydown', e=>{
    const n = +e.key;
    if(n>=1 && n<=6 && cams.list[n]) cams.active = cams.list[n];
  });

  return cams;
}
