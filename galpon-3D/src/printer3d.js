import * as THREE from 'three';
import { GUI } from 'dat.gui';

export function initPrinter(scene) {
  const root = new THREE.Group();
  scene.add(root);

  // Base platform
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x303F9F,
    metalness: 0.8,
    roughness: 0.2,
  });
  
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(4, 0.5, 4),
    baseMaterial
  );
  root.add(base);

  // Support columns
  const columnMaterial = new THREE.MeshStandardMaterial({
    color: 0x424242,
    metalness: 0.6,
    roughness: 0.3,
  });
  
  for (let i = 0; i < 4; i++) {
    const column = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 8),
      columnMaterial
    );
    column.position.set(
      1.8 * Math.cos(i * Math.PI/2),
      4,
      1.8 * Math.sin(i * Math.PI/2)
    );
    root.add(column);
  }

  // Printer head
  const headMaterial = new THREE.MeshStandardMaterial({
    color: 0x4CAF50,
    emissive: 0x4CAF50,
    emissiveIntensity: 0.5,
    metalness: 0.8,
    roughness: 0.2,
  });

  const head = new THREE.Group();
  const headBase = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.4, 1.2),
    headMaterial
  );
  const nozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.05, 0.3),
    headMaterial
  );
  nozzle.position.y = -0.3;
  head.add(headBase, nozzle);
  head.position.y = 2;
  root.add(head);

  let current = null;
  let progress = 0;
  let isPrinting = false;

  const params = {
    forma: 'cubo',
    altura: 2,
    generar() { start(); }
  };

  // GUI simplificado
  const gui = new GUI({ width: 250 });
  gui.domElement.id = 'gui';
  const f1 = gui.addFolder('Printer Settings');
  f1.add(params, 'forma', {
    'Cubo': 'cubo',
    'Esfera': 'esfera',
    'Triangulo': 'triangulo'
  }).name('Forma');
  f1.add(params, 'altura', 1, 4, 0.5).name('Altura');
  f1.add(params, 'generar').name('Generar');
  f1.open();

  function start() {
    if (current) root.remove(current);

    let geometry;
    switch (params.forma) {
      case 'cubo':
        geometry = new THREE.BoxGeometry(1, params.altura, 1);
        break;
      case 'esfera':
        geometry = new THREE.SphereGeometry(0.5, 32, 32);
        geometry.scale(1, params.altura / 1, 1);
        break;
      case 'triangulo':
        geometry = new THREE.CylinderGeometry(0, 0.5, params.altura, 3);
        break;
    }

    // Create material
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x4CAF50,
      metalness: 0.2,
      roughness: 0.5,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });

    current = new THREE.Mesh(geometry, material);
    current.castShadow = true;
    current.receiveShadow = true;
    
    // Position object on printer base
    current.position.set(0, params.altura/2 + 0.25, 0);
    root.add(current);

    // Reset progress and start printing
    progress = 0;
    isPrinting = true;
    head.position.y = 2;
  }

  function update() {
    if (isPrinting && progress < 1) {
      progress = Math.min(progress + 0.005, 1);
      head.position.y = 2 + (params.altura * progress);
      
      if (current) {
        current.material.opacity = 0.2 + (progress * 0.8);
        const clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), head.position.y);
        current.material.clippingPlanes = [clipPlane];
      }
    }
    
    if (progress >= 1) {
      isPrinting = false;
      head.position.y = 2;
      if (current) {
        current.material.clippingPlanes = [];
        current.material.opacity = 1;
      }
    }
  }

  function hasObject() {
    return current !== null && progress >= 1;
  }

  function takeIfClose(position) {
    if (!hasObject()) return null;

    const objectPos = new THREE.Vector3();
    current.getWorldPosition(objectPos);
    
    const distance = position.distanceTo(objectPos);
    if (distance > 3) return null;

    const obj = current;
    current = null;
    progress = 0;
    
    obj.material.transparent = false;
    obj.material.opacity = 1;
    
    return obj;
  }

  function returnObject(obj) {
    if (current || !obj) return false;
    
    current = obj;
    progress = 1;
    current.position.set(0, params.altura/2 + 0.25, 0);
    root.add(current);
    
    return true;
  }

  return {
    root,
    update,
    takeIfClose,
    returnObject,
    hasObject,
    get currentProgress() { return progress; }
  };
}
