# TP1 - Simulación 3D interactiva: autoelevador, impresora 3D y estantería

## 🎯 Objetivo

El objetivo de este trabajo práctico es desarrollar una escena 3D interactiva que incluya:

- Un **auto elevador** controlable por teclado
- Una **impresora 3D** capaz de generar objetos utilizando superficies de revolución o barrido
- Una **estantería** donde se almacenan los objetos generados
- La **estructura del galpón** como fondo de la escena
- **Seis cámaras** diferentes para visualizar la escena desde distintas perspectivas

---

## 🔧 Controles

### Movimiento del auto elevador:
- `W` / `S`: avanzar / retroceder
- `A` / `D`: girar sobre su eje a la izquierda / derecha
- `Q` / `E`: subir / bajar la pala
- `G`: tomar o dejar un objeto (en la impresora o en la estantería)

### Cámaras:
- `1`: Cámara orbital general
- `2`: Cámara orbital impresora
- `3`: Cámara orbital estantería
- `4`: Vista de conductor del auto elevador
- `5`: Cámara de seguimiento trasera del auto elevador
- `6`: Cámara de seguimiento lateral del auto elevador

### Mouse:
- Movimiento del mouse: rotación en cámaras orbitales
- Rueda del mouse o teclas `O` / `P`: zoom in/out

---

## 🖨️ Impresora 3D

Genera objetos 3D mediante:

- **Curvas 2D** (Bezier o Catmull-Rom)
- **Superficies**:
  - De revolución
  - De barrido

### Formas 2D disponibles:
- Revolución: `A1`, `A2`, `A3`, `A4`
- Barrido: `B1`, `B2`, `B3`, `B4`

### Parámetros configurables desde el menú:
- Tipo de superficie (`barrido` o `revolución`)
- Selección de forma 2D
- Ángulo de torsión (solo barrido)
- Altura total
- Botón `Generar` para iniciar la creación del objeto

---

## 🗄️ Estantería

Modelo de estantería con:

- 2 niveles
- 8 espacios por nivel
- Capacidad para almacenar los objetos generados

---

## 🏗️ Estructura del galpón

El entorno general incluye el modelado del galpón donde se encuentran la impresora, estantería y el auto elevador.

---

## 💻 Tecnologías

- [Three.js](https://threejs.org/) (versión ≥ r150)
- JavaScript / HTML / CSS
- OrbitControls para manejo de cámaras orbitales

---

## 📦 Instalación y ejecución

1. Cloná este repositorio:
   ```bash
   git clone https://github.com/jicanta/Galpon-3D
