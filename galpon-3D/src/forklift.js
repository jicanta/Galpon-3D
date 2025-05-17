import * as THREE from 'three';

export function initForklift(scene) {
    const root = new THREE.Group();
    scene.add(root);

    // Materials
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xfdd835,  // Yellow
        metalness: 0.6,
        roughness: 0.4,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
    });

    const detailMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x424242,  // Dark grey
        metalness: 0.8,
        roughness: 0.2
    });

    const wheelMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x212121,  // Very dark grey
        metalness: 0.8,
        roughness: 0.5
    });

    // Body
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(2, 1.5, 3),
        bodyMaterial
    );
    body.position.y = 1;
    body.castShadow = true;
    root.add(body);

    // Cabin
    const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(2, 1, 1.5),
        bodyMaterial
    );
    cabin.position.set(0, 2, -0.5);
    cabin.castShadow = true;
    root.add(cabin);

    // Wheels
    const wheels = [];
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    wheelGeometry.rotateZ(Math.PI / 2);

    const wheelPositions = [
        [-1, 0.4, -1],
        [1, 0.4, -1],
        [-1, 0.4, 1],
        [1, 0.4, 1]
    ];

    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.position.set(...pos);
        wheel.castShadow = true;
        wheels.push(wheel);
        root.add(wheel);
    });

    // Lift mechanism
    const liftGroup = new THREE.Group();
    root.add(liftGroup);

    // Vertical poles
    const poleGeometry = new THREE.BoxGeometry(0.1, 5, 0.1);
    const poles = [];
    [-0.4, 0.4].forEach(x => {
        const pole = new THREE.Mesh(poleGeometry, detailMaterial);
        pole.position.set(x, 2.5, 1.8);
        poles.push(pole);
        liftGroup.add(pole);
    });

    // Fork
    const forkGroup = new THREE.Group();
    liftGroup.add(forkGroup);

    const forkBase = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.1, 0.8),
        detailMaterial
    );
    forkBase.position.set(0, 0, 1.8);
    forkGroup.add(forkBase);

    // Make forks longer and more visible
    [-0.4, 0.4].forEach(x => {
        const fork = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.1, 1.2),
            detailMaterial
        );
        fork.position.set(x, 0, 2.3);
        forkGroup.add(fork);
    });

    // Initial position
    root.position.set(0, 0, 0);
    let currentHeight = 0;
    let carrying = null;

    // Movement parameters
    const speed = 0.15;
    const turnSpeed = 0.08;
    const liftSpeed = 0.05;
    const maxLiftHeight = 4;
    const PICKUP_DISTANCE = 2.5;  // Increased for better usability
    const PICKUP_HEIGHT_TOLERANCE = 1.5;  // Increased for easier vertical alignment
    const PICKUP_ANGLE_TOLERANCE = 0.5;  // Maximum angle difference for pickup

    function update(keys) {
        // Forward/backward movement
        if (keys['w']) {
            root.position.x += Math.sin(root.rotation.y) * speed;
            root.position.z += Math.cos(root.rotation.y) * speed;
            wheels.forEach(wheel => {
                wheel.rotation.x += speed * 2;
            });
        }
        if (keys['s']) {
            root.position.x -= Math.sin(root.rotation.y) * speed;
            root.position.z -= Math.cos(root.rotation.y) * speed;
            wheels.forEach(wheel => {
                wheel.rotation.x -= speed * 2;
            });
        }

        // Rotation
        if (keys['a']) {
            root.rotation.y += turnSpeed;
            wheels.forEach((wheel, i) => {
                const radius = (i < 2) ? 1 : -1;
                wheel.rotation.x += turnSpeed * radius;
            });
        }
        if (keys['d']) {
            root.rotation.y -= turnSpeed;
            wheels.forEach((wheel, i) => {
                const radius = (i < 2) ? -1 : 1;
                wheel.rotation.x += turnSpeed * radius;
            });
        }

        // Fork height control
        if (keys['q'] && currentHeight < maxLiftHeight) {
            currentHeight = Math.min(currentHeight + liftSpeed, maxLiftHeight);
            forkGroup.position.y = currentHeight;
        }
        if (keys['e'] && currentHeight > 0) {
            currentHeight = Math.max(currentHeight - liftSpeed, 0);
            forkGroup.position.y = currentHeight;
        }

        // Update nearest slot indicator if carrying an object
        if (carrying && shelf) {
            const forkTipPos = getForkTipPosition();
            nearestSlot = shelf.showAvailableSlot(forkTipPos);
        }

        // Handle object placement/pickup with G key
        if (keys['g']) {
            if (carrying && nearestSlot) {
                const released = release();
                if (released) {
                    shelf.placeObject(released, nearestSlot.index);
                    nearestSlot = null;
                }
            }
        }
    }

    function getForkTipPosition() {
        const forkTipPos = new THREE.Vector3(0, 0, 1.8); // Position at fork tips
        forkGroup.localToWorld(forkTipPos);
        return forkTipPos;
    }

    function getForkDirection() {
        const direction = new THREE.Vector3(0, 0, 1);
        direction.applyQuaternion(root.quaternion);
        return direction;
    }

    function canPickup(object) {
        if (!object || carrying) return false;

        const forkTipPos = getForkTipPosition();
        const objectPos = new THREE.Vector3();
        object.getWorldPosition(objectPos);

        // Check horizontal distance from fork tips
        const horizontalDist = new THREE.Vector2(
            forkTipPos.x - objectPos.x,
            forkTipPos.z - objectPos.z
        ).length();

        // Check height difference
        const heightDiff = Math.abs(forkTipPos.y - objectPos.y);

        // Check if fork is facing the object
        const forkDir = getForkDirection();
        const toObject = new THREE.Vector3()
            .subVectors(objectPos, forkTipPos)
            .normalize();
        const angleDiff = forkDir.angleTo(toObject);

        console.log('Pickup check:', {
            horizontalDist,
            heightDiff,
            angleDiff,
            thresholds: {
                distance: PICKUP_DISTANCE,
                height: PICKUP_HEIGHT_TOLERANCE,
                angle: PICKUP_ANGLE_TOLERANCE
            }
        });

        return (
            horizontalDist < PICKUP_DISTANCE &&
            heightDiff < PICKUP_HEIGHT_TOLERANCE &&
            angleDiff < PICKUP_ANGLE_TOLERANCE
        );
    }

    function carry(object) {
        if (!object || carrying) return false;
        
        carrying = object;
        
        // Store the object's original scale
        const originalScale = object.scale.clone();
        
        // Parent to fork group and position correctly on the forks
        forkGroup.attach(object);
        
        // Position object directly on the forks
        const forkBasePos = new THREE.Vector3(0, 0.1, 1.8); // Slightly above forks to prevent z-fighting
        object.position.copy(forkBasePos);
        object.rotation.set(0, 0, 0); // Reset rotation
        object.scale.copy(originalScale);
        
        // Ensure object is fully visible
        if (object.material) {
            object.material.transparent = false;
            object.material.opacity = 1;
            object.material.side = THREE.DoubleSide;
            object.material.needsUpdate = true;
        }
        
        return true;
    }

    function release() {
        if (!carrying) return null;
        
        const released = carrying;
        
        // Get world position before detaching
        const worldPos = new THREE.Vector3();
        released.getWorldPosition(worldPos);
        
        // Store original scale
        const originalScale = released.scale.clone();
        
        // Detach from fork group
        scene.attach(released);
        
        // Maintain position and scale
        released.position.copy(worldPos);
        released.scale.copy(originalScale);
        
        // Keep object visible
        if (released.material) {
            released.material.transparent = false;
            released.material.opacity = 1;
            released.material.side = THREE.DoubleSide;
            released.material.needsUpdate = true;
        }
        
        carrying = null;
        return released;
    }

    let nearestSlot = null;
    let shelf = null;

    function setShelf(shelfSystem) {
        shelf = shelfSystem;
    }

    return {
        root,
        update,
        getForkTipPosition,
        getForkDirection,
        canPickup,
        carry,
        release,
        setShelf,
        get isCarrying() { return carrying !== null; }
    };
}
