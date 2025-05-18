import * as THREE from 'three';

export class Forklift {
/* ═════════════════════════════════ constructor ═════════════════════════════ */
  constructor () {
    /* dinámica */
    this.wheelR  = 0.55;           // radio rueda
    this.speed   = 15;              // m / s
    this.turnSpd = Math.PI;        // rad / s
    this.forkMax = 2.5;            // altura máx. horquilla
    this.forkSpd = 1;              // m / s
    
    /* nodo raíz y estado */
    this.root    = new THREE.Group();
    this.root.position.set(0, this.wheelR, 5);
    this.heading = 0;
    this.wRot    = 0;
    this.carried = null;

    /* medias extensiones del cuerpo (sin ruedas) */
    this.bodyHalfW = 1.20;
    this.bodyHalfD = 1.60;

    /* construcción visual */
    this.#buildChassis();
    this.#buildWheels();
    this.#buildCabin();
    this.#buildMastFork();
  }

/* ══════════════════════════════ construcción visual ═══════════════════════ */
  #buildChassis () {
    const yellow = 0xe8ec6a;

    /* base */
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.7, 3.2),
      new THREE.MeshStandardMaterial({ color: yellow })
    );
    base.position.y = 0.35;
    this.root.add(base);

    /* guardabarros (5 cm por encima de la rueda) */
    const fenderGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.45, 16, 1, true, 0, Math.PI)
      .rotateZ(Math.PI / 2);
    const fenderMat = new THREE.MeshStandardMaterial({ color: yellow, side: THREE.DoubleSide });
    const fY = this.wheelR - 0.4;
    [-1, 1].forEach(s => {
      [ 1.2, -1.2 ].forEach(z => {
        const f = new THREE.Mesh(fenderGeo, fenderMat);
        f.position.set(s * 1.5, fY, z);
        this.root.add(f);
      });
    });

    /* asiento y respaldo */
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.16, 0.7),
      new THREE.MeshStandardMaterial({ color: 0xffcf70 })
    );
    seat.position.set(0.2, 0.82, -0.7);

    const back = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.8, 0.12),
      new THREE.MeshStandardMaterial({ color: yellow })
    );
    back.position.set(0.2, 1.26, -1.05);

    /* bloque rojo delante del asiento */
    const block = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.45, 0.45),
      new THREE.MeshStandardMaterial({ color: 0xb63030 })
    );
    block.position.set(0.25, 0.55, -0.05);

    this.root.add(seat, back, block);
  }

  #buildWheels () {
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x6b48c9 });
    const hubMat  = new THREE.MeshStandardMaterial({ color: 0x26184f });

    const tireGeo = new THREE.TorusGeometry(this.wheelR, 0.12, 14, 22);
    const hubGeo  = new THREE.CylinderGeometry(this.wheelR * 0.4, this.wheelR * 0.4, 0.5, 20)
      .rotateZ(Math.PI / 2);

    const x = this.bodyHalfW + this.wheelR;              // ruedas sobresalen
    const poses = [ [ x,  1.2], [ x, -1.2], [-x,  1.2], [-x, -1.2] ];

    this.wheels = poses.map(([px, pz]) => {
      const g = new THREE.Group();
      const t = new THREE.Mesh(tireGeo, tireMat); t.rotation.y = Math.PI / 2;
      const h = new THREE.Mesh(hubGeo, hubMat);
      g.add(t, h);
      g.position.set(px, 0, pz);
      this.root.add(g);
      return g;
    });
  }

  #buildCabin () {
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const poleGeo = new THREE.BoxGeometry(0.1, 1.4, 0.1);

    [-1.0, 0.9].forEach(x => {
      const pf = new THREE.Mesh(poleGeo, poleMat); pf.position.set(x, 1.05,  0.6);
      const pb = pf.clone(); pb.position.z = -1.2;
      this.root.add(pf, pb);
    });

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.1, 2),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    roof.position.set(-0.05, 1.8, -0.3);
    this.root.add(roof);

    const wheel = new THREE.Mesh(
      new THREE.TorusGeometry(0.25, 0.035, 12, 20),
      new THREE.MeshStandardMaterial({ color: 0x222 })
    );
    wheel.rotation.x = -Math.PI / 2;
    wheel.position.set(0.6, 1.0, -0.4);

    const column = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8),
      new THREE.MeshStandardMaterial({ color: 0x444 })
    );
    column.rotation.z = -0.45;
    column.position.set(0.55, 0.8, -0.38);

    this.root.add(wheel, column);
  }

  #buildMastFork () {
    this.mast = new THREE.Group();
    this.mast.position.set(0, 0.7, 1.6);   // sobre chasis
    this.root.add(this.mast);

    /* columnas 3.4 m */
    const railGeo = new THREE.BoxGeometry(0.12, 3.4, 0.12);
    const railMat = new THREE.MeshStandardMaterial({ color: 0xcfd4f3 });
    [-0.3, 0.3].forEach(x => {
      const r = new THREE.Mesh(railGeo, railMat);
      r.position.set(x, 1.7, 0);
      this.mast.add(r);
    });

    /* travesaños adelantados 0.1 m */
    const braceGeo = new THREE.BoxGeometry(0.7, 0.12, 0.12);
    const braceMat = new THREE.MeshStandardMaterial({ color: 0xd64893 });
    [0.25, 1.8, 3.3].forEach(y => {
      const b = new THREE.Mesh(braceGeo, braceMat);
      b.position.set(0, y, 0.1);
      this.mast.add(b);
    });

    /* pala */
    this.forkGroup = new THREE.Group();
    this.forkHeight = 0;

    const fork = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.12, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xf4a742 })
    );
    fork.position.set(0, 0, 0.7);
    this.forkGroup.add(fork);
    this.mast.add(this.forkGroup);
  }

/* ═════════════════════════════ lógica de movimiento ═══════════════════════ */
  #tip () { return this.forkGroup.localToWorld(new THREE.Vector3(0,0,1.4)); }

  update (input, dt) {
    /* giro */
    const t = (input.key('KeyD')?1:0)-(input.key('KeyA')?1:0);
    if(t){ this.heading -= this.turnSpd*t*dt; this.root.rotation.y=this.heading; }

    /* avance con colisión (cuerpo+ruedas) */
    const f = (input.key('KeyW')?1:0)-(input.key('KeyS')?1:0);
    if(f){
      const v = this.speed*f*dt;
      const next = this.root.position.clone()
                  .add(new THREE.Vector3(Math.sin(this.heading)*v,0,Math.cos(this.heading)*v));

      const fullHalfW = this.bodyHalfW + this.wheelR;
      const fullHalfD = this.bodyHalfD + this.wheelR;

      const s=Math.sin(this.heading), c=Math.cos(this.heading);
      const margin = 0.05;
      const hx = Math.abs(c)*fullHalfW + Math.abs(s)*fullHalfD - margin;
      const hz = Math.abs(s)*fullHalfW + Math.abs(c)*fullHalfD - margin;

      let hit=false;
      for(const box of this._obsAABB??[]){
        if(next.x+hx<box.min.x || next.x-hx>box.max.x) continue;
        if(next.z+hz<box.min.z || next.z-hz>box.max.z) continue;
        hit=true; break;
      }

      if(!hit){
        this.root.position.copy(next);
        this.wRot -= v/this.wheelR;
        this.wheels.forEach(w=>w.rotation.x=this.wRot);
      }
    }

    /* horquilla */
    const lift=(input.key('KeyQ')?1:0)-(input.key('KeyE')?1:0);
    if(lift){
      this.forkHeight=THREE.MathUtils.clamp(this.forkHeight+lift*this.forkSpd*dt,0,this.forkMax);
      this.forkGroup.position.y=this.forkHeight;
    }

    /* highlight estante */
    if(this.shelf){
      const d=Math.hypot(this.#tip().x-this.shelf.center().x,
                         this.#tip().z-this.shelf.center().z);
      if(this.carried&&d<8) this.shelf.showHighlight(this.carried);
      else                  this.shelf.hideHighlight();
    }

    /* G tomar/dejar */
    if(input.key('KeyG')&&!this._gPrev){
      if(!this.carried) this.#pick(); else this.#place();
    }
    this._gPrev=input.key('KeyG');
  }

/* ═════════════════════════════ pick / place ══════════════════════════════ */
  #pick () {
    if(!this.printer) return;
    const obj=this.printer.currentObject();
    if(!obj) return;
    if(this.#tip().distanceTo(obj.getWorldPosition(new THREE.Vector3())) > 2.4) return;

    const taken=this.printer.detachObject();
    if(taken){
      this.forkGroup.add(taken);
      taken.position.set(0,0.15,0.7);
      this.carried=taken;
    }
  }

  #place () {
    if(!this.shelf) return;
    const d=Math.hypot(this.#tip().x-this.shelf.center().x,
                       this.#tip().z-this.shelf.center().z);
    if(d>8) return;
    if(this.shelf.addObject(this.carried)) this.carried=null;
  }

/* ═════════════════════════════ entorno / colisiones ═════════════════════ */
  setEnvironment (printer, shelf) {
    this.printer=printer; this.shelf=shelf;
    [printer.root, shelf.root].forEach(o=>o.updateWorldMatrix(true,true));
    this._obsAABB=[printer.root, shelf.root]
                    .map(o=>new THREE.Box3().setFromObject(o));
  }
}
