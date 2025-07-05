# Galpón 3D - Trabajo Práctico Final de Computación Gráfica

## 🏭 Descripción del Proyecto

Este proyecto implementa una **escena 3D interactiva de un galpón industrial** con impresora 3D, montacargas y sistema de almacenamiento. Desarrollado como trabajo práctico final para la materia Computación Gráfica, implementa técnicas avanzadas de **iluminación Phong**, **mapeo de texturas**, **mapas de reflexión** y **mapas normales**.

![Three.js](https://img.shields.io/badge/Three.js-v0.176.0-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)
![Vite](https://img.shields.io/badge/Vite-v6.3.5-purple)

### 🎯 Características Principales

- **Galpón Industrial Realista**: Estructura con paredes metálicas corrugadas, techo a dos aguas y vigas estructurales
- **Impresora 3D Animada**: Sistema de impresión layer-by-layer con clipping planes dinámicos
- **Montacargas Operativo**: Vehículo completamente funcional con física de colisiones
- **Sistema de Iluminación Completo**: Modelo Phong con 6 spotlights industriales + 4 luces omnidireccionales
- **Texturas Realistas**: 10+ texturas con mapeo UV correcto y mapas normales
- **Interfaz de Control Completa**: GUI para controlar todos los aspectos de la escena

## 🚀 Instalación y Ejecución

### Prerequisitos
- **Node.js** (versión 18 o superior)
- **npm** (incluido con Node.js)

### Pasos de Instalación

1. **Navegar al directorio del proyecto**
```bash
cd "Galpon 3D/Galpon-3D"
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar el servidor de desarrollo**
```bash
npm run dev
```

4. **Abrir en el navegador**
   - La aplicación se abrirá automáticamente en `http://localhost:5173`
   - Si no se abre automáticamente, navegar manualmente a esa URL

### Comandos Disponibles
- `npm run dev` - Servidor de desarrollo con hot reload
- `npm run build` - Compilar para producción
- `npm run preview` - Previsualizar build de producción

## 🎮 Controles y Navegación

### 🚛 Controles del Montacargas
- **W** - Avanzar
- **S** - Retroceder  
- **A** - Girar izquierda
- **D** - Girar derecha
- **Q** - Subir horquilla
- **E** - Bajar horquilla
- **G** - Recoger/Soltar objetos

### 📹 Controles de Cámara
- **Clic + Arrastrar** - Rotar vista
- **Rueda del ratón** - Zoom in/out
- **Clic derecho + Arrastrar** - Desplazar vista

### 🎛️ Panel de Control (GUI)
Ubicado en la esquina superior derecha, permite controlar:

#### Impresora 3D
- **Tipo**: Revolución o Barrido (Extrusion)
- **Forma**: 9 perfiles diferentes (A1-A4, B1-B5)
- **Textura**: 10 opciones de texturas realistas
- **Material**: 5 tipos (Mate, Brillante, Metálico, Plástico, Vidrio)
- **Altura**: 0.5 - 3.0 unidades
- **Torsión**: 0° - 360°
- **Velocidad**: Velocidad de impresión
- **Color**: Selector de color personalizado

#### Sistema de Iluminación
- **Luz Ambiental**: Intensidad global
- **Luz Principal**: Luz direccional principal
- **Luz Puntual**: Luz auxiliar
- **Luz de Relleno**: Iluminación suave
- **Exposición**: Control de tone mapping

#### Luces del Techo (6 Spotlights Industriales)
- **Intensidad**: 0 - 3.0
- **Distancia**: 10 - 50 unidades
- **Ángulo**: Control del cono de luz
- **Penumbra**: Suavidad de bordes

#### Luces de la Impresora (4 Luces Omnidireccionales)
- **Intensidad**: 0 - 2.0
- **Alcance**: 5 - 20 unidades

## 🏗️ Arquitectura del Proyecto

### 📁 Estructura de Archivos
```
Galpon-3D/
├── src/
│   ├── components/          # Componentes 3D principales
│   │   ├── Forklift.js     # Montacargas con física
│   │   ├── Printer.js      # Impresora 3D animada
│   │   ├── Shelf.js        # Sistema de estanterías
│   │   └── Warehouse.js    # Estructura del galpón
│   ├── gui/
│   │   └── Menu.js         # Interfaz de usuario
│   ├── logic/
│   │   ├── CameraManager.js # Control de cámaras
│   │   └── Input.js        # Manejo de entrada
│   ├── utils/
│   │   ├── Shapes.js       # Geometrías y perfiles
│   │   └── TextureLoader.js # Gestión de texturas
│   ├── maps/               # Texturas y mapas
│   ├── renders/            # Imágenes de referencia
│   ├── main.js             # Punto de entrada principal
│   └── hud.js              # HUD overlay
├── index.html              # Página principal
├── package.json            # Configuración npm
└── README.md              # Esta documentación
```

### 🔧 Tecnologías Utilizadas
- **Three.js** (v0.176.0) - Motor de renderizado 3D
- **Vite** (v6.3.5) - Build tool y servidor de desarrollo
- **dat.GUI** (v0.7.9) - Interfaz de usuario
- **WebGL** - Renderizado acelerado por hardware

## 🎨 Características Técnicas Implementadas

### ✅ Modelo de Iluminación Phong
- **Implementación completa** del modelo de iluminación Phong
- **Materiales MeshPhongMaterial** con propiedades `shininess` y `specular`
- **Sombras en tiempo real** con `PCFSoftShadowMap`
- **10 fuentes de luz** distribuidas estratégicamente

### ✅ Sistema de Texturas Avanzado
- **20+ texturas** de alta calidad (1K resolution)
- **Mapas difusos** para todos los objetos
- **Mapas normales** para superficies con relieve
- **Mapas de reflexión** con cubemaps y mapas esféricos
- **UV mapping correcto** sin deformaciones

### ✅ Galpón Industrial Realista
- **Paredes metálicas corrugadas** con textura procedural
- **Techo a dos aguas** con chapa metálica
- **Estructura de vigas** y soportes
- **Piso industrial** con textura de baldosas
- **Dimensiones realistas** (60m x 40m x 12m)

### ✅ Sistema de Iluminación Profesional
#### 6 Spotlights Industriales en el Techo
- **Modelos 3D detallados** de luminarias
- **Cables de suspensión** realistas
- **Carcasas metálicas** con reflectores
- **Controles GUI independientes**

#### 4 Luces Omnidireccionales en la Impresora
- **Decaimiento lineal** como especificado
- **Iluminación focal** de la pieza en impresión
- **Integración con animación** de impresión

### ✅ Objetos Impresos con Texturas
- **10 texturas seleccionables**: Mármoles, patrones geométricos, metal rayado
- **UV mapping automático**: Cilíndrico para revolución, planar para extrusión
- **Mapeo correcto** manteniendo proporción de aspecto
- **Sistema de materiales** con 5 tipos diferentes

### ✅ Montacargas Realista
- **Ruedas texturizadas** con textura `rueda.jpg`
- **Rines metálicos** con detalles de pernos
- **Chasis texturizado** con mapa normal
- **Física de colisiones** con deslizamiento
- **Animación de ruedas** sincronizada

## 🎯 Cumplimiento de Requisitos del TP

### ✅ Algoritmos de Iluminación
- [x] **Modelo de Phong** implementado completamente
- [x] **Mapas de color difuso** en todos los objetos
- [x] **Mapas de reflexión** en base de impresora

### ✅ Texturas del Galpón
- [x] **Paredes** con textura de panel metálico corrugado + mapa normal
- [x] **Techo** con textura de chapa metálica
- [x] **Piso** con textura de baldosas industriales
- [x] **Mapeo plano** sin deformaciones

### ✅ Texturas del Vehículo
- [x] **Ruedas** con textura realista y UV mapping correcto
- [x] **Chasis** con textura y mapa normal
- [x] **Proporciones** mantenidas sin estiramientos

### ✅ Objetos Impresos
- [x] **10 texturas** seleccionables desde menú
- [x] **UV mapping correcto** para cada tipo de geometría
- [x] **Relación de aspecto** preservada

### ✅ Mapas de Reflexión
- [x] **Cubemap** implementado en base de impresora
- [x] **Reflectividad** configurable
- [x] **Integración** con iluminación del entorno

### ✅ Sistema de Luces
- [x] **6 spotlights** en el techo con modelos 3D
- [x] **4 luces omnidireccionales** con decaimiento lineal
- [x] **Controles GUI** para todos los parámetros

### ✅ Características Opcionales
- [x] **Mapas normales** para relieve en paredes y forklift
- [x] **Estructura industrial** realista del galpón
- [x] **Física avanzada** del montacargas
- [x] **Animaciones** suaves y realistas

## 🐛 Solución de Problemas

### Problema: El servidor no inicia
**Solución**: 
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Problema: Texturas no cargan
**Verificar**:
- Archivos en `/src/maps/` están presentes
- Permisos de lectura del directorio
- Cache del navegador (F5 para refrescar)

### Problema: Performance baja
**Optimizaciones**:
- Reducir calidad de sombras en código
- Disminuir resolución de texturas
- Limitar número de luces activas

## 👨‍💻 Información del Desarrollo

**Materia**: Computación Gráfica  
**Trabajo Práctico**: TP Final - Modelos de Iluminación y Texturas  
**Tecnología**: Three.js + WebGL  
**Año**: 2025  

### 🎯 Objetivos Cumplidos
- ✅ Implementación completa del modelo Phong
- ✅ Sistema de texturas profesional
- ✅ Galpón industrial realista
- ✅ Montacargas funcional con texturas
- ✅ Sistema de iluminación avanzado
- ✅ Interfaz de usuario completa
- ✅ Optimización y performance
- ✅ Documentación exhaustiva

---

**¡Disfruta explorando el Galpón 3D! 🏭✨**

*Este proyecto demuestra la implementación práctica de técnicas avanzadas de computación gráfica en tiempo real, incluyendo iluminación Phong, mapeo de texturas, y renderizado PBR usando Three.js y WebGL.*