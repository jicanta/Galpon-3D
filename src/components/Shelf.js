import * as THREE from 'three';

export class Shelf {
  constructor () {
    /* dimensiones */
    this.cols   = 8;
    this.levels = 2;
    this.slot   = 2.5;
    this.height = 2.5;
    this.depth  = 2.0;

    this.root = new THREE.Group();
    this.root.position.set(8, 0, -3);

    /* material madera clara “moderna” */
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0xb8935c, roughness: 0.6, metalness: 0.1
    });

    /* ───────── POSTS (InstancedMesh) ───────── */
    const postGeo  = new THREE.BoxGeometry(0.14, this.height + 0.4, 0.14);
    const postCnt  = (this.cols + 1) * (this.levels + 1);
    const posts    = new THREE.InstancedMesh(postGeo, woodMat, postCnt);
    posts.castShadow = true; posts.receiveShadow = true;

    let idx = 0;
    for (let c = 0; c <= this.cols; c++) {
      for (let l = 0; l <= this.levels; l++) {
        const m = new THREE.Matrix4().setPosition(
          c * this.slot - (this.cols * this.slot) / 2,
          l * this.height + this.height / 2,
          this.depth / 2 + 0.07
        );
        posts.setMatrixAt(idx++, m);
      }
    }
    this.root.add(posts);

    /* ───────── TABLONES (InstancedMesh) ───────── */
    const boardGeo = new THREE.BoxGeometry(this.cols * this.slot, 0.2, this.depth);
    const boards   = new THREE.InstancedMesh(boardGeo, woodMat, this.levels);
    boards.castShadow = boards.receiveShadow = true;

    for (let l = 0; l < this.levels; l++) {
      boards.setMatrixAt(l, new THREE.Matrix4().setPosition(0, (l + 1) * this.height, 0));
    }
    this.root.add(boards);

    /* ocupación por celda */
    this.free = Array.from({ length: this.levels },
      () => Array(this.cols).fill(true)
    );

    /* highlight verde translúcido */
    const hlGeo = new THREE.BoxGeometry(this.slot * 0.9, 0.25, this.depth * 0.9);
    const hlMat = new THREE.MeshBasicMaterial({
      color: 0x00ff00, transparent: true, opacity: 0.4, depthWrite: false
    });
    this.highlight = new THREE.Mesh(hlGeo, hlMat);
    this.highlight.visible = false;
    this.root.add(this.highlight);
  }

  /* ----------- util interno ----------- */
  #findFreeSlot (obj) {
    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3();
    box.getSize(size);

    if (
      size.x > this.slot * 0.9 ||
      size.z > this.depth * 0.9 ||
      size.y > this.height * 0.9
    ) return null;

    for (let l = 0; l < this.levels; l++)
      for (let c = 0; c < this.cols;  c++)
        if (this.free[l][c]) return { l, c };

    return null;
  }

  /* ----------- highlight ----------- */
  showHighlight (obj) {
    const slot = this.#findFreeSlot(obj);
    if (!slot) { this.highlight.visible = false; return; }

    const { l, c } = slot;
    this.highlight.position.set(
      (c + 0.5) * this.slot - (this.cols * this.slot) / 2,
      (l + 1) * this.height + 0.18,
      0
    );
    this.highlight.visible = true;
  }
  hideHighlight () { this.highlight.visible = false; }

  /* ----------- colocar objeto ----------- */
  addObject (obj) {
    const slot = this.#findFreeSlot(obj);
    if (!slot) return false;

    const { l, c } = slot;
    this.free[l][c] = false;

    const dst = new THREE.Vector3(
      (c + 0.5) * this.slot - (this.cols * this.slot) / 2,
      (l + 1) * this.height + 0.1,
      0
    );

    this.root.worldToLocal(obj.getWorldPosition(obj.position));
    obj.rotation.set(0, 0, 0);
    this.root.add(obj);

    obj.userData.dst = dst;
    obj.userData.t   = 0;
    obj.animateIn = dt => {
      obj.userData.t = THREE.MathUtils.clamp(obj.userData.t + dt * 3, 0, 1);
      const k = 10;
      obj.position.x = THREE.MathUtils.damp(obj.position.x, dst.x, k, dt);
      obj.position.y = THREE.MathUtils.damp(obj.position.y, dst.y, k, dt);
      obj.position.z = THREE.MathUtils.damp(obj.position.z, dst.z, k, dt);
      if (obj.position.distanceToSquared(dst) < 1e-4) delete obj.animateIn;
    };

    this.hideHighlight();
    return true;
  }

  /* para cámaras y distancias */
  center () {
    return new THREE.Vector3().setFromMatrixPosition(this.root.matrixWorld);
  }
}
