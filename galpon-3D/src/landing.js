import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

let scene, camera, renderer, text;
let particles = [];

init();
animate();

function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x4285f4, 2); // Google Blue
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x0F9D58, 2); // Google Green
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Load font and create text
    const fontLoader = new FontLoader();
    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', (font) => {
        const textGeometry = new TextGeometry('Galpon 3D', {
            font: font,
            size: 2,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 5
        });

        textGeometry.center();

        const material = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.8,
            roughness: 0.2,
            clearcoat: 1.0,
            clearcoatRoughness: 0.2
        });

        text = new THREE.Mesh(textGeometry, material);
        scene.add(text);

        // Add instruction text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;
        context.fillStyle = '#ffffff';
        context.font = '32px Arial';
        context.fillText('Press ENTER to continue', 120, 64);

        const instructionTexture = new THREE.CanvasTexture(canvas);
        const instructionMaterial = new THREE.MeshBasicMaterial({
            map: instructionTexture,
            transparent: true,
            opacity: 0
        });

        const instructionGeometry = new THREE.PlaneGeometry(8, 2);
        const instruction = new THREE.Mesh(instructionGeometry, instructionMaterial);
        instruction.position.y = -4;
        scene.add(instruction);

        // Fade in instruction
        setTimeout(() => {
            const fadeIn = setInterval(() => {
                if (instructionMaterial.opacity < 1) {
                    instructionMaterial.opacity += 0.02;
                } else {
                    clearInterval(fadeIn);
                }
            }, 50);
        }, 1000);
    });

    // Create particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 200;
    const posArray = new Float32Array(particleCount * 3);
    
    for(let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 50;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.05,
        color: 0x4285f4,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
    particles.push(particleSystem);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Handle Enter key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            transition();
        }
    });
}

function transition() {
    // Fade out effect
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = '#000';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 1s ease';
    overlay.style.zIndex = '1000';
    document.body.appendChild(overlay);

    // Fade in overlay
    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 100);

    // Load main scene
    setTimeout(() => {
        window.location.href = 'scene.html';
    }, 1000);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    if (text) {
        text.rotation.y += 0.003;
    }

    // Animate particles
    particles.forEach(particle => {
        particle.rotation.x += 0.0004;
        particle.rotation.y += 0.0002;
    });

    renderer.render(scene, camera);
} 