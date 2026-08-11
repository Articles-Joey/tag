import { NearestFilter, RepeatWrapping, TextureLoader } from "three";
import Sand from '@/components/Game/Sand';
import { DuckModel as Duck } from "@/components/Models/Duck.jsx";
import Ground from "../Ground";
import Log from "../Log";
import Dummy from "../Dummy";
import Trees from "../Trees";
import Grass from "../Grass";
import Obstacles from "../Obstacles";
import Barns from "../Barns";
import HollowLog from "../HollowLog";
import { degToRad } from "three/src/math/MathUtils";
import { useStore } from "@/hooks/useStore";
import { useTexture } from "@react-three/drei";

const GrassPlane = () => {
    const graphicsQuality = useStore(state => state.graphicsQuality)
    const [colorMap, normalMap] = useTexture([
        '/textures/Grass/Poliigon_GrassPatchyGround_4585_BaseColor.jpg',
        '/textures/Grass/Poliigon_GrassPatchyGround_4585_Normal.png'
    ])

    let width
    let height

    let baseAmount = 300

    if (graphicsQuality == 'Low') {
        width = baseAmount
        height = baseAmount
    }
    if (graphicsQuality == 'Medium') {
        width = baseAmount * 2
        height = baseAmount * 2
    }
    if (graphicsQuality == 'High') {
        width = baseAmount * 3
        height = baseAmount * 3
    }

    [colorMap, normalMap].forEach((t) => {
        t.magFilter = NearestFilter;
        t.wrapS = RepeatWrapping
        t.wrapT = RepeatWrapping
        t.repeat.set(width / 10, height / 10)
    })

    return (
        <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.25, 0]}>
                <planeGeometry attach="geometry" args={[width, height]} />
                <meshStandardMaterial attach="material" map={colorMap} normalMap={normalMap} />
            </mesh>
        </>
    );
};

export default function ForestMap() {
    return (
        <>
            {/* Physics objects */}
            <Ground position={[0, 0, 0]} />

            <Log position={[0, 0.25, 10]} size={[10, 0.5, 0.5]} />
            <Log position={[0, 0.25, 12]} size={[10, 0.5, 0.5]} />
            <Log position={[0, 0.25, 14]} size={[10, 0.5, 0.5]} />

            <Dummy />

            <HollowLog position={[10, 1.6, 0]} />

            <Obstacles />

            <Duck
                position={[10, 3.1, 0]}
                rotation={[0, degToRad(-90), 0]}
            />

            {/* Decorative (outside physics) */}
            <Barns />
            <Trees />
            <Grass />
            <GrassPlane />

            <Sand
                receiveShadow
                args={[200, 200]}
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.1, 0]}
            />
        </>
    );
}
