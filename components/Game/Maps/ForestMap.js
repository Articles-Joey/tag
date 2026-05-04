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

const texture = new TextureLoader().load(`${process.env.NEXT_PUBLIC_CDN}games/Race Game/grass.jpg`)

const GrassPlane = () => {
    const width = 110;
    const height = 110;

    texture.magFilter = NearestFilter;
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(20, 20);

    return (
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
            <circleGeometry attach="geometry" args={[width, height]} />
            <meshStandardMaterial attach="material" map={texture} />
        </mesh>
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
