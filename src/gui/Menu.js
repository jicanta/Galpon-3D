import * as dat from 'dat.gui';
import { hud }  from '../hud.js';

export function initGUI (printer) {
  const gui = new dat.GUI({ width: 300 });
  const p   = printer.params;

  const refresh = () => hud.set(p);

  gui.add(p,'mode',{ Revolución:'revolution', Barrido:'sweep' })
     .name('Tipo').onChange(refresh);

  gui.add(p,'form',[
      'A1','A2','A3','A4',
      'B1','B2','B3','B4'])
     .name('Forma').onChange(refresh);

  gui.add(p,'height',0.5,3,0.1).name('Altura').onChange(refresh);
  gui.add(p,'twist',0,360,10).name('Torsión (°)').onChange(refresh);
  gui.addColor(p, 'color').name('Color').onChange(refresh);

  gui.add({ Generar: () => { printer.generate(); refresh(); } }, 'Generar');

  gui.close();
  refresh();
}
