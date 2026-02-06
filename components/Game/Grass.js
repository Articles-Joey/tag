import * as THREE from 'three'
import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTagGameStore } from '@/hooks/useTagGameStore'

export default function Grass({ 
    options = { 
        count: 5000, 
        radius: 40, 
        width: 0.1, 
        height: 0.5, 
        color: '#2f6f00' 
    } 
}) {
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

    // Initial positions and offsets
    const instances = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            temp.push({
                x: (Math.random() - 0.5) * radius * 2,
                z: (Math.random() - 0.5) * radius * 2,
                scale: 0.8 + Math.random() * 0.5,
                rotation: Math.random() * Math.PI * 2,
            })
        }
        return temp;
    }, [count, radius])

    const dummy = useMemo(() => new THREE.Object3D(), [])

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
        <instancedMesh 
            ref={meshRef} 
            args={[geometry, null, count]}
            castShadow 
            receiveShadow
        >
            <meshStandardMaterial side={THREE.DoubleSide} color={color} />
        </instancedMesh>
    )
}
