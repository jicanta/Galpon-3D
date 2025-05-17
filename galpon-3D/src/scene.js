import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { initPrinter } from './printer3d.js';
import { initForklift } from './forklift.js';
import { initShelf } from './shelf.js';

// Scene, camera, and renderer setup
  const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a); // Darker background

const cameras = {
    orbital: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
    printerView: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
    shelfView: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
    driverView: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
    backView: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
    sideView: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
};

let activeCamera = cameras.orbital;
cameras.orbital.position.set(20, 20, 20);
cameras.orbital.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: false,
    powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2; // Slightly brighter
renderer.setClearColor(0x0a0a0a, 1);
  document.body.appendChild(renderer.domElement);

// Lighting setup
const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
mainLight.position.set(10, 15, 10);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 2048;
mainLight.shadow.mapSize.height = 2048;
mainLight.shadow.camera.near = 0.1;
mainLight.shadow.camera.far = 100;
mainLight.shadow.camera.left = -30;
mainLight.shadow.camera.right = 30;
mainLight.shadow.camera.top = 30;
mainLight.shadow.camera.bottom = -30;
scene.add(mainLight);

// Add accent lights for modern tech look
const blueAccent = new THREE.PointLight(0x0088ff, 5, 20);
blueAccent.position.set(-12, 5, -12); // Printer position
scene.add(blueAccent);

const shelfAccent = new THREE.PointLight(0x00ff88, 5, 20);
shelfAccent.position.set(12, 5, -12); // Shelf position
scene.add(shelfAccent);

// Add UI for help messages
const helpDiv = document.createElement('div');
helpDiv.style.position = 'fixed';
helpDiv.style.bottom = '20px';
helpDiv.style.left = '50%';
helpDiv.style.transform = 'translateX(-50%)';
helpDiv.style.padding = '10px 20px';
helpDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
helpDiv.style.color = 'white';
helpDiv.style.fontFamily = 'Arial, sans-serif';
helpDiv.style.fontSize = '16px';
helpDiv.style.borderRadius = '5px';
helpDiv.style.display = 'none';
document.body.appendChild(helpDiv);

// Room setup
function createRoom() {
    // Create a larger grid floor
    const gridHelper = new THREE.GridHelper(60, 60, 0x0088ff, 0x444444);
    gridHelper.position.y = 0.01; // Slightly above floor to prevent z-fighting
    gridHelper.material.opacity = 0.15;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Add floor with reddish-brown color like in the reference
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 60),
        new THREE.MeshPhysicalMaterial({
            color: 0x8B6B61, // Reddish-brown color
            metalness: 0.0,  // No metallic effect
            roughness: 0.8,  // More matte finish
            clearcoat: 0.0,  // Remove glossy coating
            clearcoatRoughness: 0.0,
            reflectivity: 0.1, // Minimal reflections
            envMapIntensity: 0.3 // Reduced environment reflections
        })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Add environment map for subtle reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new THREE.Scene()).texture;
}

// Initialize scene
function init() {
    // Create room
    createRoom();

    // Initialize components
    const printer = initPrinter(scene);
    printer.root.position.set(-12, 0, -12);

    const shelf = initShelf(scene);
    shelf.root.position.set(12, 0, -12);

    const forklift = initForklift(scene);
    forklift.root.position.set(0, 0, 8);

    // Connect systems
    forklift.setShelf(shelf);

    // Keyboard state
    const keys = {};
    window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

    // Camera controls
    let orbitControls = new OrbitControls(cameras.orbital, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.minDistance = 5;
    orbitControls.maxDistance = 30;

    // Camera switching
    window.addEventListener('keydown', (e) => {
        const smoothTransition = (camera, targetPos, targetLookAt, duration = 1000) => {
            const startPos = camera.position.clone();
            const startLookAt = new THREE.Vector3();
            camera.getWorldDirection(startLookAt);
            startLookAt.add(camera.position);
            
            const startTime = Date.now();
            
            function animate() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Smooth easing
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                
                camera.position.lerpVectors(startPos, targetPos, easeProgress);
                
                const currentLookAt = new THREE.Vector3();
                currentLookAt.lerpVectors(startLookAt, targetLookAt, easeProgress);
                camera.lookAt(currentLookAt);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            }
            
            animate();
        };

        switch(e.key) {
            case '1':
                activeCamera = cameras.orbital;
                if (orbitControls) orbitControls.dispose();
                orbitControls = new OrbitControls(activeCamera, renderer.domElement);
                orbitControls.enableDamping = true;
                orbitControls.dampingFactor = 0.05;
                orbitControls.minDistance = 5;
                orbitControls.maxDistance = 30;
                smoothTransition(activeCamera, new THREE.Vector3(20, 20, 20), new THREE.Vector3(0, 0, 0));
                break;
            case '2':
                activeCamera = cameras.printerView;
                if (orbitControls) orbitControls.dispose();
                orbitControls = new OrbitControls(activeCamera, renderer.domElement);
                orbitControls.enableDamping = true;
                orbitControls.dampingFactor = 0.05;
                orbitControls.target.copy(printer.root.position);
                smoothTransition(
                    activeCamera,
                    printer.root.position.clone().add(new THREE.Vector3(5, 5, 5)),
                    printer.root.position
                );
                break;
            case '3':
                activeCamera = cameras.shelfView;
                if (orbitControls) orbitControls.dispose();
                orbitControls = new OrbitControls(activeCamera, renderer.domElement);
                orbitControls.enableDamping = true;
                orbitControls.dampingFactor = 0.05;
                orbitControls.target.copy(shelf.root.position);
                smoothTransition(
                    activeCamera,
                    shelf.root.position.clone().add(new THREE.Vector3(5, 5, 5)),
                    shelf.root.position
                );
                break;
            case '4':
                activeCamera = cameras.driverView;
                if (orbitControls) {
                    orbitControls.dispose();
                    orbitControls = null;
                }
                break;
            case '5':
                activeCamera = cameras.backView;
                if (orbitControls) {
                    orbitControls.dispose();
                    orbitControls = null;
                }
                break;
            case '6':
                activeCamera = cameras.sideView;
                if (orbitControls) {
                    orbitControls.dispose();
                    orbitControls = null;
                }
                break;
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        Object.values(cameras).forEach(camera => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Zoom controls for orbital cameras
    window.addEventListener('keydown', (e) => {
        if (orbitControls) {
            if (e.key === 'o') orbitControls.dollyIn(1.1);
            if (e.key === 'p') orbitControls.dollyOut(1.1);
        }
    });

    // Handle object pickup/drop
    window.addEventListener('keydown', (e) => {
        if (e.key === 'g' || e.key === 'G') {
            const forkPosition = forklift.getForkTipPosition();
            
            if (!forklift.isCarrying) {
                // Try to pick up from printer
                const distToPrinter = forkPosition.distanceTo(printer.root.position);
                
                if (distToPrinter < 5) {
                    const object = printer.takeIfClose(forkPosition);
                    if (object) {
                        forklift.carry(object);
                    }
                }
            } else {
                // Try to place in shelf
                const nearestSlot = shelf.showAvailableSlot(forkPosition);
                if (nearestSlot && nearestSlot.distance < 3) {
                    const released = forklift.release();
                    if (released) {
                        const success = shelf.placeObject(released, nearestSlot.index);
                        if (!success) {
                            forklift.carry(released);
                        }
                    }
                }
            }
        }
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Update printer
        printer.update();

        // Update forklift
        forklift.update(keys);

        // Update help message and shelf indicators
        if (forklift) {
            const forkPosition = forklift.getForkTipPosition();
            const distToPrinter = forkPosition.distanceTo(printer.root.position);
            
            helpDiv.style.display = 'none';
            
            if (!forklift.isCarrying) {
                if (distToPrinter < 5 && printer.hasObject()) {
                    helpDiv.textContent = 'Presione G para agarrar el objeto';
                    helpDiv.style.backgroundColor = 'rgba(0, 136, 255, 0.8)';
                    helpDiv.style.display = 'block';
                }
            } else {
                const nearestSlot = shelf.showAvailableSlot(forkPosition);
                if (nearestSlot && nearestSlot.distance < 3) {
                    helpDiv.textContent = 'Presione G para dejar el objeto';
                    helpDiv.style.backgroundColor = 'rgba(0, 255, 136, 0.8)';
                    helpDiv.style.display = 'block';
                }
            }
        }

        // Update cameras
        if (activeCamera === cameras.driverView) {
            const forkliftDir = new THREE.Vector3(0, 0, -1).applyQuaternion(forklift.root.quaternion);
            const cameraOffset = new THREE.Vector3(0, 2, 0.5);
            activeCamera.position.copy(forklift.root.position).add(cameraOffset);
            activeCamera.lookAt(
                forklift.root.position.clone()
                    .add(forkliftDir.multiplyScalar(5))
                    .add(new THREE.Vector3(0, 1, 0))
            );
        } else if (activeCamera === cameras.backView) {
            const cameraOffset = new THREE.Vector3(0, 3, -8);
            cameraOffset.applyQuaternion(forklift.root.quaternion);
            activeCamera.position.lerp(
                forklift.root.position.clone().add(cameraOffset),
                0.1
            );
            activeCamera.lookAt(forklift.root.position);
        } else if (activeCamera === cameras.sideView) {
            const cameraOffset = new THREE.Vector3(8, 3, 0);
            cameraOffset.applyQuaternion(forklift.root.quaternion);
            activeCamera.position.lerp(
                forklift.root.position.clone().add(cameraOffset),
                0.1
            );
            activeCamera.lookAt(forklift.root.position);
        }

        // Update orbital controls if active
        if (orbitControls) {
            orbitControls.update();
        }
        
        renderer.render(scene, activeCamera);
    }

    // Start animation
    animate();
}

// Start everything
init();
