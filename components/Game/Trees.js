import { useMemo } from 'react';
import Tree from "@/components/Models/Tree";
import { useStore } from '@/hooks/useStore';

function deterministicRandom(seed) {
    const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return value - Math.floor(value);
}

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
            const progress = (i % steps) * density - boundarySize;

            switch (side) {
                case 0: // North side
                    x = progress;
                    z = -boundarySize;
                    break;
                case 1: // East side
                    x = boundarySize;
                    z = progress;
                    break;
                case 2: // South side
                    x = -progress;
                    z = boundarySize;
                    break;
                case 3: // West side
                    x = -boundarySize;
                    z = -progress;
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
            scale: 0.8 + deterministicRandom(item.idx * 2 + 1) * 0.4,
            rotation: [
                0,
                deterministicRandom(item.idx * 2 + 2) * Math.PI * 2,
                0
            ]
        }));
    }, [graphicsQuality])

    return (
        <group>
            {trees.map((tree) => (
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