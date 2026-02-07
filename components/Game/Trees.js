import { useMemo } from 'react';
import Tree from "@/components/Models/Tree";
import { useStore } from '@/hooks/useStore';

export default function Trees() {

    const graphicsQuality = useStore((state) => state.graphicsQuality);

    const trees = useMemo(() => {
        const items = [];

        // Determine step based on quality
        // High = all trees (step 1)
        // Medium = 2/3 trees (approx step 1.5, or skip every 3rd? simpler to just increase step size)
        // Actually user said: 2/3 for medium, 1/3 for low.
        
        // Let's filter after generation or generate less.
        // Step logic:
        // High: i++ (100%)
        // Medium: i+=1.5? No loop must be integer.
        
        // Easier to filter the final list:
        // High: Modulo 1 (take all)
        // Medium: Take if (i % 3 !== 0) -> 66% 
        // Low: Take if (i % 3 === 0) -> 33%

        // West
        for (let i = 0; i < 56; i++) {
            items.push({ idx: i, position: [-90, 0, (-84 + i * 3)] })
        }
        // East
        for (let i = 0; i < 56; i++) {
            items.push({ idx: i + 100, position: [90, 0, (-84 + i * 3)] })
        }
        // North
        for (let i = 0; i < 60; i++) {
            items.push({ idx: i + 200, position: [(-88 + i * 3), 0, -80] })
        }
        // South
        for (let i = 0; i < 60; i++) {
            items.push({ idx: i + 300, position: [(-88 + i * 3), 0, 80] })
        }

        const filteredItems = items.filter((item, index) => {
            if (graphicsQuality === "High") return true; 
            if (graphicsQuality === "Medium") return index % 3 !== 0; // Keeps 0 (no), 1 (yes), 2 (yes), 3 (no) ... wait. 0%3=0.
            // 0, 1, 2, 3, 4, 5
            // H: Y, Y, Y, Y, Y, Y
            // M: N, Y, Y, N, Y, Y (66%)
            // L: Y, N, N, Y, N, N (33%) -> return index % 3 === 0
            
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