import * as dat from 'dat.gui';
import { hud }  from '../hud.js';
import { textureManager } from '../utils/TextureLoader.js';

export function initGUI (printer, scene, warehouse) {
  const gui = new dat.GUI({ width: 300 });
  const p   = printer.params;

  const refresh = () => hud.set(p);

  // Controles de la impresora
  const printerFolder = gui.addFolder('Impresora');
  
  // Configuración básica
  printerFolder.add(p,'mode',{ Revolución:'revolution', Barrido:'sweep' })
     .name('Tipo').onChange(refresh);
  printerFolder.add(p,'form',[
      'A1','A2','A3','A4',
      'B1','B2','B3','B4', 'B5'])
     .name('Forma').onChange(refresh);
  printerFolder.add(p,'height',0.5,3,0.1).name('Altura').onChange(refresh);
  printerFolder.add(p,'twist',0,360,10).name('Torsión (°)').onChange(refresh);
  printerFolder.add(p,'speed', 0.1, 2, 0.05).name('Velocidad').onChange(refresh);
  
  // Configuración de apariencia
  const appearanceFolder = printerFolder.addFolder('Apariencia');
  appearanceFolder.add(p, 'useTexture')
    .name('Usar Textura').onChange(refresh);
    
  const textureOptions = {};
  textureManager.getPrintedObjectTextures().forEach(tex => {
    textureOptions[tex.name] = tex.name;
  });
  appearanceFolder.add(p, 'texture', textureOptions)
    .name('Textura').onChange(refresh);
    
  appearanceFolder.addColor(p, 'color').name('Color Base').onChange(refresh);
  
  appearanceFolder.add(p, 'surfaceFinish', {
    'Plástica': 'plastica',
    'Mate': 'matte', 
    'Brillante': 'brillante'
  }).name('Acabado').onChange(refresh);
  
  // Configuración de relieve (mapas de normales)
  const reliefFolder = appearanceFolder.addFolder('Relieve');
  
  const normalPatternOptions = {};
  textureManager.getNormalMapPatterns().forEach(pattern => {
    normalPatternOptions[pattern.name] = pattern.name;
  });
  reliefFolder.add(p, 'normalPattern', normalPatternOptions)
    .name('Patrón Relieve').onChange(refresh);
    
  reliefFolder.add(p, 'normalIntensity', 0, 2, 0.1)
    .name('Intensidad').onChange(refresh);
  
  appearanceFolder.add(p,'material', {
      Mate: 'matte',
      Brillante: 'shiny',
      Metálico: 'metallic',
      Plástico: 'plastic',
      Vidrio: 'glass'
    }).name('Material Especial').onChange(refresh);
  
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

  // Controles de luces de techo (spotlights)
  if (warehouse && warehouse.spotlights) {
    const ceilingFolder = gui.addFolder('Luces del Techo');
    const spotParams = warehouse.getSpotlightParams();
    
    ceilingFolder.add(spotParams, 'intensity', 0, 3, 0.1)
      .name('Intensidad')
      .onChange(value => {
        spotParams.intensity = value;
        warehouse.updateSpotlights(spotParams);
      });
    
    ceilingFolder.add(spotParams, 'distance', 10, 50, 1)
      .name('Distancia')
      .onChange(value => {
        spotParams.distance = value;
        warehouse.updateSpotlights(spotParams);
      });
    
    ceilingFolder.add(spotParams, 'angle', 0.1, Math.PI/2, 0.1)
      .name('Ángulo')
      .onChange(value => {
        spotParams.angle = value;
        warehouse.updateSpotlights(spotParams);
      });
    
    ceilingFolder.add(spotParams, 'penumbra', 0, 1, 0.1)
      .name('Penumbra')
      .onChange(value => {
        spotParams.penumbra = value;
        warehouse.updateSpotlights(spotParams);
      });
  }

  // Controles de luces de la impresora
  if (printer.printerLights) {
    const printerLightParams = {
      intensity: printer.printerLights[0].intensity,
      distance: printer.printerLights[0].distance
    };
    
    printerFolder.add(printerLightParams, 'intensity', 0, 2, 0.1)
      .name('Luces Impresora')
      .onChange(value => {
        printer.printerLights.forEach(light => light.intensity = value);
      });
  }

  gui.close();
  refresh();
}
