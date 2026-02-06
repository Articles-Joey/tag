import { useMemo } from 'react';
import Tree from "@/components/Models/Tree";

export default function Trees() {

    const trees = useMemo(() => {
        const items = [];

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

        return items.map((item) => ({
            ...item,
            scale: 0.8 + Math.random() * 0.4,
            rotation: [0, Math.random() * Math.PI * 2, 0]
        }))

    }, [])

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