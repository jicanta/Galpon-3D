import * as dat from 'dat.gui';
import { hud }  from '../hud.js';

export function initGUI (printer, scene) {
  const gui = new dat.GUI({ width: 300 });
  const p   = printer.params;

  const refresh = () => hud.set(p);

  // Controles de la impresora
  const printerFolder = gui.addFolder('Impresora');
  printerFolder.add(p,'mode',{ Revolución:'revolution', Barrido:'sweep' })
     .name('Tipo').onChange(refresh);

  printerFolder.add(p,'form',[
      'A1','A2','A3','A4',
      'B1','B2','B3','B4', 'B5'])
     .name('Forma').onChange(refresh);

  printerFolder.add(p,'material', {
      Mate: 'matte',
      Brillante: 'shiny',
      Metálico: 'metallic',
      Plástico: 'plastic',
      Vidrio: 'glass'
    }).name('Material').onChange(refresh);

  printerFolder.add(p,'speed', 0.1, 2, 0.05).name('Velocidad').onChange(refresh);

  printerFolder.add(p,'height',0.5,3,0.1).name('Altura').onChange(refresh);
  printerFolder.add(p,'twist',0,360,10).name('Torsión (°)').onChange(refresh);
  printerFolder.addColor(p, 'color').name('Color').onChange(refresh);
  printerFolder.add({ Generar: () => { printer.generate(); refresh(); } }, 'Generar');

  // Controles de iluminación
  const lightingFolder = gui.addFolder('Iluminación');
  
  lightingFolder.add(scene.lights.ambient, 'intensity', 0, 1, 0.1)
    .name('Luz Ambiental');

  lightingFolder.add(scene.lights.directional, 'intensity', 0, 2, 0.1)
    .name('Luz Principal');

  lightingFolder.add(scene.lights.point, 'intensity', 0, 2, 0.1)
    .name('Luz Puntual');

  lightingFolder.add(scene.lights.fill, 'intensity', 0, 1, 0.1)
    .name('Luz de Relleno');

  lightingFolder.add(scene.lights.renderer, 'toneMappingExposure', 0, 2, 0.1)
    .name('Exposición');

  gui.close();
  refresh();
}
