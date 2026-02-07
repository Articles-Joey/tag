// Note: Handles Grass and Flowers even though it is called Grass

import * as THREE from 'three'
import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTagGameStore } from '@/hooks/useTagGameStore'
import { OrangeFlowerModel } from "@/components/Models/Orange Flower.jsx";
import { useStore } from '@/hooks/useStore';

export default function Grass({ 
    options = { 
        count: 5000, 
        radius: 40, 
        width: 0.1, 
        height: 0.5, 
        color: '#2f6f00' 
    } 
}) {

    const graphicsQuality = useStore((state) => state.graphicsQuality);

    const meshRef = useRef()
    const { count, radius, width, height, color } = options // 40 radius seems good for view

    // Access the store api directly to avoid re-renders
    const storeApi = useTagGameStore.api || useTagGameStore

    // Create the single blade geometry
    const geometry = useMemo(() => {
        // Simple tapered plane
        // 5 segments for curve
        const geo = new THREE.PlaneGeometry(width, height, 1, 4);
        geo.translate(0, height / 2, 0); // Base at 0,0,0

        const posAttribute = geo.attributes.position;
        const vertex = new THREE.Vector3();

        // Bend the grass
        for (let i = 0; i < posAttribute.count; i++) {
            vertex.fromBufferAttribute(posAttribute, i);
            
            // Curve logic: bend along Z based on Y height
            // Parabolic curve: z = a * y^2
            const bendRatio = vertex.y / height;
            const curveAmount = 0.4; // Adjustable curve
            vertex.z += Math.pow(bendRatio, 2) * curveAmount; // Bend backward
            
            // Taper width at top
            // If it's a vertex on the left/right side, pull it in as Y goes up
            // Check x sign. Original width is split -width/2 to +width/2
            // We can just scale x by (1 - bendRatio)
            vertex.x *= (1 - bendRatio * 0.6); // Taper to 40% width at top
            
            posAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        
        geo.computeVertexNormals();
        return geo;
    }, [width, height]);

    const activeGrassCount = useMemo(() => {
        if (graphicsQuality === 'Low') return Math.floor(count / 3);
        if (graphicsQuality === 'Medium') return Math.floor(count * (2 / 3));
        return count;
    }, [count, graphicsQuality]);

    // Initial positions and offsets
    const instances = useMemo(() => {
        const temp = [];
        for (let i = 0; i < activeGrassCount; i++) {
            temp.push({
                x: (Math.random() - 0.5) * radius * 2,
                z: (Math.random() - 0.5) * radius * 2,
                scale: 0.8 + Math.random() * 0.5,
                rotation: Math.random() * Math.PI * 2,
            })
        }
        return temp;
    }, [activeGrassCount, radius])

    const flowers = useMemo(() => {
        if (graphicsQuality === 'Low') return [];

        let flowerMultiplier = 1;
        if (graphicsQuality === 'Medium') flowerMultiplier = 0.5;

        const flowerCount = Math.floor((count / 50) * flowerMultiplier); // Less flowers than grass
        const temp = [];
        for (let i = 0; i < flowerCount; i++) {
            temp.push({
                x: (Math.random() - 0.5) * radius * 2,
                z: (Math.random() - 0.5) * radius * 2,
                scale: 0.1 + Math.random() * 0.3,
                rotation: [0, Math.random() * Math.PI * 2, 0],
                id: i
            })
        }
        return temp;
    }, [count, radius, graphicsQuality])

    const dummy = useMemo(() => new THREE.Object3D(), [])
    
    // To update flowers as we move, we need a way to re-position them just like grass.
    // However, they are React components, not instances in an InstancedMesh (unless we refactor).
    // For simplicity with independent models, we can use a similar wrap logic in a component wrapper or just specific flower locations.
    // If performance is key, we should use InstancedMesh for flowers too, but that requires extracting geometry from GLTF.
    // Given "OrangeFlowerModel" is a component, let's just render them. 
    // To make them wrap, we might need a separate component that handles its own wrapping or updating.
    
    // Let's make a wrapper component for a single flower that handles wrapping logic.
    const InfiniteFlower = ({ initialX, initialZ, initialScale, initialRotation, radius, storeApi }) => {
        const ref = useRef()
        
        useFrame(() => {
            if (!ref.current) return;
            
            const gameStore = storeApi.getState();
            const playerPos = gameStore.position || [0, 0, 0];
            const px = playerPos[0];
            const pz = playerPos[2];
            
            let x = initialX;
            let z = initialZ;
            
            let dx = x - px;
            let dz = z - pz;

            // Wrap logic (same as grass but simpler since we just move the object)
            // Note: This logic assumes 'initialX' is the anchor. 
            // Actually, for React components, we can just compute the position every frame directly.
            
            // Re-calculate wrapped position
            // We want (x - px) to be within [-radius, radius]
            // x_wrapped = x - round((x - px) / width) * width?
            // width = radius * 2
            
            const width = radius * 2;
            
            // Shift x relative to player to find relative offset
            let rx = (x - px);
            let rz = (z - pz);
            
            // Wrap relative offset to be within -radius to +radius
            // Modulo logic: ((rx % width) + width) % width - radius ??
            // Or the iterative approach from before:
            
            while (rx > radius) rx -= width;
            while (rx < -radius) rx += width;
            
            while (rz > radius) rz -= width;
            while (rz < -radius) rz += width;
            
            // Final position is player position + wrapped relative offset?
            // No, that makes them stick to player.
            // We want absolute position that snaps.
            
            // Correct approach:
            // The "virtual" world is infinite. We just act like there are infinite flowers.
            // But we only have N flowers.
            // This instancing logic is specific to the "grid" moving.
            
            // Let's stick to the previous imperative logic:
            // Determine the "cell" the player is in?
            
            // Let's reuse the simple imperative logic:
            let finalX = initialX;
            let finalZ = initialZ;
            
            // Wrap based on distance to player
            if (finalX - px > radius) finalX -= radius * 2 * Math.ceil((finalX - px - radius) / (radius * 2));
            else if (finalX - px < -radius) finalX += radius * 2 * Math.ceil((px - radius - finalX) / (radius * 2));

            if (finalZ - pz > radius) finalZ -= radius * 2 * Math.ceil((finalZ - pz - radius) / (radius * 2));
            else if (finalZ - pz < -radius) finalZ += radius * 2 * Math.ceil((pz - radius - finalZ) / (radius * 2));
            
            ref.current.position.set(finalX, 0.2, finalZ);
        })

        return (
            <group ref={ref}>
                <OrangeFlowerModel scale={initialScale} rotation={initialRotation} />
            </group>
        )
    }

    useFrame((state) => {
        if (!meshRef.current) return;

        // Get robust player position (from store without subscribing)
        const gameStore = storeApi.getState();
        const playerPos = gameStore.position || [0, 0, 0];
        const px = playerPos[0];
        const pz = playerPos[2];

        // Update blades
        instances.forEach((blade, i) => {
            
            let x = blade.x; // World position stored in blade.x? No, relative to 0?
            let z = blade.z;
            
            // We want x, z to be the "current" position. 
            // Better: Store absolute positions in `instances` and wrap them relative to player.
            
            // Logic:
            // Calculate distance from player on each axis
            let dx = x - px;
            let dz = z - pz;

            // Wrap around
            if (dx > radius) {
                x -= radius * 2;
                blade.x = x;
            } else if (dx < -radius) {
                x += radius * 2;
                blade.x = x;
            }

            if (dz > radius) {
                z -= radius * 2;
                blade.z = z;
            } else if (dz < -radius) {
                z += radius * 2;
                blade.z = z;
            }

            // Update matrix
            dummy.position.set(x, 0.1, z); // 0.1 for ground height
            dummy.scale.setScalar(blade.scale);
            
            // Gentle wind (slow sway)
            // Using position for phase offset to create wave effect
            const time = state.clock.elapsedTime
            const sway = Math.sin(time * 0.5 + x * 0.1 + z * 0.1) * 0.1;
            
            dummy.rotation.set(sway, blade.rotation, 0);
            
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        })
        
        meshRef.current.instanceMatrix.needsUpdate = true;
    })

    return (
        <>
            <instancedMesh 
                ref={meshRef} 
                args={[geometry, null, activeGrassCount]}
                castShadow 
                receiveShadow
            >
                <meshStandardMaterial side={THREE.DoubleSide} color={color} />
            </instancedMesh>
            
            {flowers.map(flower => (
                <InfiniteFlower 
                    key={flower.id}
                    initialX={flower.x}
                    initialZ={flower.z}
                    initialScale={flower.scale}
                    initialRotation={flower.rotation}
                    radius={radius}
                    storeApi={storeApi}
                />
            ))}
        </>
    )
}
