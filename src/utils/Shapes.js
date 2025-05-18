import * as THREE from 'three';

/* ── Perfiles Bézier para revolución (A1-A4) ── */
const A1 = [[0,0],[0.9,0],[1,0.2],[1,1.8],[0.9,2],[0,2]];
const A2 = [[0,0],[0.6,0],[0.7,2],[0,2]];
const A3 = [[0,0],[0.6,0],[0.3,1],[0.3,1.3],[0.9,1.6],[1,2],[0,2]];
const A4 = [[0,0],[0.5,0],[0.6,1],[1,1.1],[1.1,1.6],[0.6,1.8],[0,1.8]];

export const profiles = { A1, A2, A3, A4 };

/* ── Formas planas para barrido (B1-B4) ── */
function star (r=0.8,n=5) {
  const s=new THREE.Shape(); const a=2*Math.PI/n;
  s.moveTo(r,0);
  for(let i=1;i<=n;i++){
    s.lineTo(Math.cos(i*a)*r,Math.sin(i*a)*r);
    s.lineTo(Math.cos(i*a+a/2)*r*0.35,Math.sin(i*a+a/2)*r*0.35);
  }
  return s.closePath();
}

const B1=new THREE.Shape().moveTo(-0.6,-0.6).lineTo(0.6,-0.6).lineTo(0.6,0.6).lineTo(-0.6,0.6).closePath();
const B2=star();
const B3=new THREE.Shape().absarc(0,0,0.8,0,Math.PI*2);
const B4=new THREE.Shape()
  .moveTo(-0.5,-0.4).absarc(0,-0.4,0.5,Math.PI,0)
  .lineTo(0.5,0.8).absarc(0,0.8,0.5,0,Math.PI).closePath();

export const shapes = { B1, B2, B3, B4 };

/* ── Perfiles Catmull-Rom para revolución (C1-C4) ── */
function catProfile (...pts) {
  const crv = new THREE.CatmullRomCurve3(
    pts.map(([x,y])=>new THREE.Vector3(x,y,0)), false,'catmullrom',0.5);
  return crv.getPoints(24).map(v=>new THREE.Vector2(v.x,v.y));
}

const C1 = catProfile([0,0],[1,0.2],[0.8,1.8],[0,2]);
const C2 = catProfile([0,0],[0.5,0],[1,1],[0.5,2],[0,2]);
const C3 = catProfile([0,0],[0.7,0],[0.9,1],[0.5,2],[0,2]);
const C4 = catProfile([0,0],[0.4,0.4],[1.1,1.2],[0.6,1.8],[0,1.8]);

export const profilesCat = { C1, C2, C3, C4 };

/* ── Trayectoria Catmull-Rom 3D para barrido ── */
export function sweepPathCatmull (h=2) {
  return new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0,-h/2,0),
      new THREE.Vector3(0.8,-h/4,0.4),
      new THREE.Vector3(-0.6,h/4,-0.5),
      new THREE.Vector3(0,h/2,0)
    ], false,'catmullrom',0.5
  );
}
