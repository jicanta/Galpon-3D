import * as THREE from 'three';

export class TextureManager {
  constructor() {
    this.loader = new THREE.TextureLoader();
    this.cubeLoader = new THREE.CubeTextureLoader();
    this.textures = new Map();
    this.cubemaps = new Map();
  }

  loadTexture(path, options = {}) {
    if (this.textures.has(path)) {
      return this.textures.get(path);
    }

    const texture = this.loader.load(`/src/maps/${path}`);
    
    // Apply default settings
    texture.wrapS = options.wrapS || THREE.RepeatWrapping;
    texture.wrapT = options.wrapT || THREE.RepeatWrapping;
    texture.magFilter = options.magFilter || THREE.LinearFilter;
    texture.minFilter = options.minFilter || THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = options.generateMipmaps !== false;
    texture.flipY = options.flipY !== false;
    
    if (options.repeat) {
      texture.repeat.set(options.repeat.x || 1, options.repeat.y || 1);
    }
    
    if (options.offset) {
      texture.offset.set(options.offset.x || 0, options.offset.y || 0);
    }

    this.textures.set(path, texture);
    return texture;
  }

  loadCubemap(paths) {
    const key = paths.join(',');
    if (this.cubemaps.has(key)) {
      return this.cubemaps.get(key);
    }

    const fullPaths = paths.map(path => `/src/maps/${path}`);
    const cubemap = this.cubeLoader.load(fullPaths);
    this.cubemaps.set(key, cubemap);
    return cubemap;
  }

  // Predefined texture sets for easy access
  getWallTexture() {
    return this.loadTexture('CorrugatedMetalPanel02_1K_BaseColor.png', {
      repeat: { x: 4, y: 2 }
    });
  }

  getWallNormalMap() {
    return this.loadTexture('CorrugatedMetalPanel02_1K_Normal.png', {
      repeat: { x: 4, y: 2 }
    });
  }

  getFloorTexture() {
    return this.loadTexture('StoneTilesFloor01_1K_BaseColor.png', {
      repeat: { x: 20, y: 20 }
    });
  }

  getFloorNormalMap() {
    return this.loadTexture('StoneTilesFloor01_1K_Normal.png', {
      repeat: { x: 20, y: 20 }
    });
  }

  getCeilingTexture() {
    return this.loadTexture('Wood06_1K_BaseColor.png', {
      repeat: { x: 8, y: 6 }
    });
  }

  getCorrugatedRoofTexture() {
    return this.loadTexture('CorrugatedMetalPanel02_1K_BaseColor.png', {
      repeat: { x: 6, y: 4 }
    });
  }

  getForkliftTexture() {
    return this.loadTexture('texturaGrua.jpg');
  }

  getForkliftNormalMap() {
    return this.loadTexture('texturaGruaNormalMap.jpg');
  }

  getWheelTexture() {
    return this.loadTexture('rueda.jpg');
  }

  getGreyRoomCubemap() {
    return this.loadCubemap([
      'greyRoom1_right.jpg',   // positive X
      'greyRoom1_left.jpg',    // negative X
      'greyRoom1_top.jpg',     // positive Y
      'greyRoom1_bottom.jpg',  // negative Y
      'greyRoom1_front.jpg',   // positive Z
      'greyRoom1_back.jpg'     // negative Z
    ]);
  }

  getReflectionSphereMap() {
    return this.loadTexture('refmapGreyRoom3.jpg');
  }

  // Texture options for printed objects with normal maps
  getPrintedObjectTextures() {
    return [
      {
        name: 'Marble White',
        diffuse: this.loadTexture('Marble03_1K_BaseColor.png'),
        normal: this.loadTexture('Marble03_1K_Normal.png'),
        metalness: 0.1,
        roughness: 0.2
      },
      {
        name: 'Marble Black',
        diffuse: this.loadTexture('Marble09_1K_BaseColor.png'),
        normal: this.loadTexture('Marble09_1K_Normal.png'),
        metalness: 0.1,
        roughness: 0.2
      },
      {
        name: 'Pattern A',
        diffuse: this.loadTexture('Pattern02_1K_VarA.png'),
        normal: this.loadTexture('Pattern02_1K_Normal.png'),
        metalness: 0.0,
        roughness: 0.6
      },
      {
        name: 'Pattern B',
        diffuse: this.loadTexture('Pattern02_1K_VarB.png'),
        normal: this.loadTexture('Pattern02_1K_Normal.png'),
        metalness: 0.0,
        roughness: 0.6
      },
      {
        name: 'Pattern C',
        diffuse: this.loadTexture('Pattern02_1K_VarC.png'),
        normal: this.loadTexture('Pattern02_1K_Normal.png'),
        metalness: 0.0,
        roughness: 0.6
      },
      {
        name: 'Geometric A',
        diffuse: this.loadTexture('Pattern05_1K_VarA.png'),
        normal: this.loadTexture('Pattern05_1K_Normal.png'),
        metalness: 0.3,
        roughness: 0.4
      },
      {
        name: 'Geometric B',
        diffuse: this.loadTexture('Pattern05_1K_VarB.png'),
        normal: this.loadTexture('Pattern05_1K_Normal.png'),
        metalness: 0.3,
        roughness: 0.4
      },
      {
        name: 'Geometric C',
        diffuse: this.loadTexture('Pattern05_1K_VarC.png'),
        normal: this.loadTexture('Pattern05_1K_Normal.png'),
        metalness: 0.3,
        roughness: 0.4
      },
      {
        name: 'Scratched Metal',
        diffuse: this.loadTexture('ScratchedPaintedMetal01_1K_BaseColor.png'),
        normal: this.loadTexture('ScratchedPaintedMetal01_1K_Normal.png'),
        metalness: 0.8,
        roughness: 0.3
      },
      {
        name: 'Custom Pattern',
        diffuse: this.loadTexture('patron3.png'),
        normal: null, // No normal map available
        metalness: 0.0,
        roughness: 0.7
      }
    ];
  }

  // Normal map patterns for surface relief
  getNormalMapPatterns() {
    return [
      {
        name: 'Ninguno',
        normal: null,
        intensity: 0
      },
      {
        name: 'Ladrillo',
        normal: this.loadTexture('BrickWall01_1K_Normal.png'),
        intensity: 1.0
      },
      {
        name: 'Metal Rugoso',
        normal: this.loadTexture('ScratchedPaintedMetal01_1K_Normal.png'),
        intensity: 0.8
      },
      {
        name: 'Tejido',
        normal: this.loadTexture('Fabric07_1K_Normal.png'),
        intensity: 0.6
      },
      {
        name: 'Concreto',
        normal: this.loadTexture('Concrete04_1K_Normal.png'),
        intensity: 1.2
      },
      {
        name: 'Cuero',
        normal: this.loadTexture('Leather02_1K_Normal.png'),
        intensity: 0.5
      },
      {
        name: 'Madera',
        normal: this.loadTexture('Wood06_1K_Normal.png'),
        intensity: 0.7
      }
    ];
  }

  dispose() {
    this.textures.forEach(texture => texture.dispose());
    this.cubemaps.forEach(cubemap => cubemap.dispose());
    this.textures.clear();
    this.cubemaps.clear();
  }
}

// Global texture manager instance
export const textureManager = new TextureManager();