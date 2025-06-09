# 🏭 3D Warehouse Simulation

A modern 3D warehouse simulation built with Three.js, featuring interactive forklift controls, dynamic lighting, and realistic physics.

![Three.js](https://img.shields.io/badge/Three.js-r159-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)

## ✨ Features

- 🚛 Interactive forklift with realistic physics
- 📦 Dynamic shelf system with customizable slots
- 🖨️ 3D printer with animated printing process
- 💡 Advanced lighting system
- 🎮 Intuitive controls for forklift operation
- 🎨 Modern UI with interactive GUI controls
- 🌟 Realistic materials and textures
- 🎯 Collision detection and physics simulation

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jicanta/Galpon-3D.git
cd Galpon-3D
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🎮 Controls

- **W/A/S/D** - Move forklift forward/left/backward/right
- **Q/E** - Rotate forklift left/right
- **Space** - Lift/lower forks
- **Shift** - Accelerate
- **Mouse** - Look around
- **ESC** - Toggle menu

## 🏗️ Project Structure

```
src/
├── components/         # 3D components and models
│   ├── Forklift.js    # Forklift implementation
│   ├── Shelf.js       # Shelf system
│   ├── Printer.js     # 3D printer model
│   └── Terrain.js     # Warehouse floor and environment
├── logic/             # Game logic and physics
├── gui/               # User interface components
└── main.js           # Main application entry point
```

## 🛠️ Technologies Used

- [Three.js](https://threejs.org/) - 3D graphics library
- [Vite](https://vitejs.dev/) - Build tool and development server
- [dat.GUI](https://github.com/dataarts/dat.gui) - GUI controls

## 🎨 Features in Detail

### Forklift System
- Realistic physics-based movement
- Collision detection with environment
- Smooth acceleration and braking
- Fork lifting mechanism

### Shelf System
- Dynamic slot management
- Realistic object placement
- Interactive item handling
- Customizable shelf configurations

### Lighting System
- Dynamic shadows
- Point lights for shelf illumination
- Ambient lighting for realistic atmosphere
- Configurable light parameters