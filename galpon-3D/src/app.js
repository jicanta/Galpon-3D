import { initScene }   from './scene.js';
import { initCameras } from './cameras.js';
import { initInput }   from './input.js';
import { initPrinter } from './printer3d.js';
import { Forklift }    from './forklift.js';
import { Shelf }       from './shelf.js';

export function initApp(){
  const { scene, renderer } = initScene();
  const cams = initCameras(scene);
  initInput();

  const printer  = initPrinter(scene);
  const shelf    = new Shelf(scene);
  const forklift = new Forklift(scene, cams);

  renderer.setAnimationLoop(time=>{
    printer.update(time);
    forklift.update(time, shelf, printer);
    cams.update(time);
    renderer.render(scene, cams.active);
  });
}
