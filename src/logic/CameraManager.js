import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class CameraManager {
  constructor (renderer, scene) {
    this.clock = new THREE.Clock();
    const aspect = window.innerWidth / window.innerHeight;
    const create = () => new THREE.PerspectiveCamera(65, aspect, 0.1, 500);

    /* 1-3 orbitales */
    this.cam1 = create(); this.cam1.position.set(20, 15, 20);
    this.cam2 = create(); this.cam3 = create();
    this.ctl1 = new OrbitControls(this.cam1, renderer.domElement); this.ctl1.target.set(0, 2, 0);
    this.ctl2 = new OrbitControls(this.cam2, renderer.domElement);
    this.ctl3 = new OrbitControls(this.cam3, renderer.domElement);

    /* 4-6 seguimiento montacargas */
    this.cam4 = create(); this.cam5 = create(); this.cam6 = create();

    this.index = 1;
    this.list  = [null, this.cam1, this.cam2, this.cam3, this.cam4, this.cam5, this.cam6];

    window.addEventListener('keydown', e => {
      const n = Number(e.key);
      if (n >= 1 && n <= 6) this.index = n;
    });
  }

  setTargets (printer, shelf) {
    this._printer = printer;
    this._shelf   = shelf;
  }

  active   () { return this.list[this.index]; }
  deltaTime() { return this.clock.getDelta(); }

  onResize () {
    this.list.slice(1).forEach(c => {
      c.aspect = window.innerWidth / window.innerHeight;
      c.updateProjectionMatrix();
    });
  }

  update (forklift) {
    /* — orbitales actualizan controles — */
    [this.ctl1, this.ctl2, this.ctl3].forEach(c => c.update());

    /* cámara 2 apunta a impresora (una sola vez se reubica) */
    if (this._printer) {
      const tgt = this._printer.center();
      this.ctl2.target.copy(tgt);
      if (this.cam2.position.length() < 0.1) {
        this.cam2.position.copy(tgt).add(new THREE.Vector3(8, 6, 8));
      }
    }
    /* cámara 3 apunta a estantería */
    if (this._shelf) {
        const tgt = this._shelf.center();
        this.ctl3.target.copy(tgt);

        /* sólo la primera vez: coloca la cámara 6 m delante, 3 m arriba, 10 m al costado */
        if (this.cam3.userData.first === undefined) {
            this.cam3.position.copy(tgt).add(new THREE.Vector3(-6, 3, 10));
            this.cam3.userData.first = false;      // marca que ya se ubicó
        }
    }

    /* — cámaras 4-6 siguen al montacargas — */
    const pos  = forklift.root.position;
    const dirF = new THREE.Vector3(Math.sin(forklift.heading), 0, Math.cos(forklift.heading));
    const side = new THREE.Vector3().crossVectors(dirF, new THREE.Vector3(0, 1, 0));

    /* 4: conductor (First-Person) */
    this.cam4.position.copy(pos).addScaledVector(dirF.clone().negate(), 0.3).setY(pos.y + 1.6);
    this.cam4.lookAt(pos.clone().addScaledVector(dirF, 5).setY(pos.y + 1.6));

    /* 5: trasera */
    this.cam5.position.copy(pos).addScaledVector(dirF, -5).setY(pos.y + 2);
    this.cam5.lookAt(pos.clone().setY(pos.y + 1));

    /* 6: lateral */
    this.cam6.position.copy(pos).addScaledVector(side, 5).setY(pos.y + 2);
    this.cam6.lookAt(pos.clone().setY(pos.y + 1));
  }
}
