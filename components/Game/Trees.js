import { useMemo } from 'react';
import Tree from "@/components/Models/Tree";
import { useStore } from '@/hooks/useStore';

export default function Trees() {

    const graphicsQuality = useStore((state) => state.graphicsQuality);

    const trees = useMemo(() => {
        const items = [];
        const boundarySize = 90; // Half-size of the square boundary
        const density = 3; // Space between trees

        // Calculate steps for one side
        const steps = Math.floor((boundarySize * 2) / density);

        // Generate positions for the perimeter
        for (let i = 0; i < steps * 4; i++) {
            let x, z;
            
            // Determine which side of the square we are on based on progress
            // 0: North (-z), 1: East (+x), 2: South (+z), 3: West (-x)
            const side = Math.floor(i / steps);
            const progress = (i % steps) * density - boundarySize; // Goes from -boundary to +boundary

            switch(side) {
                case 0: // North side (moving East along X)
                    x = progress;
                    z = -boundarySize;
                    break;
                case 1: // East side (moving South along Z)
                    x = boundarySize;
                    z = progress;
                    break;
                case 2: // South side (moving West along X)
                    x = -progress; // Reverse direction
                    z = boundarySize;
                    break;
                case 3: // West side (moving North along Z)
                    x = -boundarySize;
                    z = -progress; // Reverse direction
                    break;
            }

            items.push({ idx: i, position: [x, 0, z] });
        }

        const filteredItems = items.filter((item, index) => {
            if (graphicsQuality === "High") return true; 
            if (graphicsQuality === "Medium") return index % 3 !== 0; 
            if (graphicsQuality === "Low") return index % 3 === 0;
            return true;
        });

        return filteredItems.map((item) => ({
            ...item,
            scale: 0.8 + Math.random() * 0.4,
            rotation: [0, Math.random() * Math.PI * 2, 0]
        }))

    }, [graphicsQuality])

    return (
        <group>
            {trees.map((tree, i) => (
                <Tree
                    key={tree.idx}
                    scale={tree.scale}
                    position={tree.position}
                    rotation={tree.rotation}
                />
            ))}
        </group>
    )
}