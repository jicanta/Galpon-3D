import * as THREE from 'three';

export function initShelf(scene) {
    const root = new THREE.Group();
    scene.add(root);

    // Materials
    const frameMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x90caf9,  // Light blue
        metalness: 0.7,
        roughness: 0.3,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
    });

    const shelfMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xeceff1,  // Light grey
        metalness: 0.5,
        roughness: 0.5,
        clearcoat: 0.3,
        clearcoatRoughness: 0.2
    });

    // Dimensions
    const width = 16;  // 8 spaces * 2 units each
    const height = 6;
    const depth = 2;
    const poleThickness = 0.2;
    const shelfThickness = 0.2;

    // Vertical poles
    for (let x = 0; x <= width; x += width/4) {
        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(poleThickness, poleThickness, height, 8),
            frameMaterial
        );
        pole.position.set(x - width/2, height/2, 0);
        pole.castShadow = true;
        root.add(pole);
    }

    // Horizontal shelves
    const levels = [height/3, 2*height/3];  // Two levels
    levels.forEach(y => {
        const shelf = new THREE.Mesh(
            new THREE.BoxGeometry(width, shelfThickness, depth),
            shelfMaterial
        );
        shelf.position.set(0, y, 0);
        shelf.castShadow = true;
        shelf.receiveShadow = true;
        root.add(shelf);
    });

    // Storage spaces management
    const slots = [];
    const spaceWidth = width / 8;
    
    // Create slots for each level (2 levels, 8 spaces each)
    levels.forEach(y => {
        for (let x = 0; x < 8; x++) {
            slots.push({
                position: new THREE.Vector3(
                    (x * spaceWidth) - (width/2) + (spaceWidth/2),
                    y + shelfThickness,
                    0
                ),
                occupied: false,
                object: null
            });
        }
    });

    // Visual indicators for empty slots
    const slotMarkers = slots.map(slot => {
        const marker = new THREE.Mesh(
            new THREE.PlaneGeometry(spaceWidth * 0.8, depth * 0.8),
            new THREE.MeshBasicMaterial({
                color: 0x4CAF50,
                transparent: true,
                opacity: 0.2,
                side: THREE.DoubleSide
            })
        );
        marker.rotation.x = -Math.PI / 2;
        marker.position.copy(slot.position);
        marker.visible = false;
        root.add(marker);
        return marker;
    });

    function findNearestEmptySlot(position) {
        let nearest = null;
        let minDistance = Infinity;

        slots.forEach((slot, index) => {
            if (!slot.occupied) {
                const worldPos = root.localToWorld(slot.position.clone());
                const distance = position.distanceTo(worldPos);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = { slot, index, distance };
                }
            }
        });

        return nearest;
    }

    function showAvailableSlot(position) {
        const nearest = findNearestEmptySlot(position);
        
        // Hide all markers first
        slotMarkers.forEach(marker => marker.visible = false);
        
        if (nearest && nearest.distance < 3) {
            slotMarkers[nearest.index].visible = true;
            return nearest;
        }
        return null;
    }

    function placeObject(object, slotIndex) {
        if (slotIndex < 0 || slotIndex >= slots.length || slots[slotIndex].occupied) {
            return false;
        }

        const slot = slots[slotIndex];
        const worldPos = root.localToWorld(slot.position.clone());
        
        scene.attach(object);  // Ensure object is in scene
        object.position.copy(worldPos);
        object.rotation.set(0, 0, 0);
        
        slot.occupied = true;
        slot.object = object;
        slotMarkers[slotIndex].visible = false;
        
        return true;
    }

    function removeObject(slotIndex) {
        if (slotIndex < 0 || slotIndex >= slots.length || !slots[slotIndex].occupied) {
            return null;
        }

        const slot = slots[slotIndex];
        const object = slot.object;
        slot.occupied = false;
        slot.object = null;
        
        return object;
    }

    // Position the shelf unit
    root.position.set(0, 0, -5);

    return {
        root,
        showAvailableSlot,
        placeObject,
        removeObject
    };
}
