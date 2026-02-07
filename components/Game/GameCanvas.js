import { Canvas } from "@react-three/fiber"
import { Sky, useDetectGPU, useTexture, OrbitControls } from "@react-three/drei";

import { NearestFilter, RepeatWrapping, TextureLoader } from "three";
// import GameGrid from "./GameGrid";

// import Witch from "../../../../../../components/Games/Race Game/PlayerModels/Witch";
// import { Star } from "../../../../../../components/Games/Race Game/Star";

const texture = new TextureLoader().load(`${process.env.NEXT_PUBLIC_CDN}games/Race Game/grass.jpg`)

const GrassPlane = () => {

    const width = 110; // Set the width of the plane
    const height = 110; // Set the height of the plane

    texture.magFilter = NearestFilter;
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.repeat.set(20, 20)

    return (
        <>
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
                <circleGeometry attach="geometry" args={[width, height]} />
                <meshStandardMaterial attach="material" map={texture} />
            </mesh>
        </>
    );
};

import Sand from '@/components/Game/Sand';
// import { Cannon } from "./Models/Cannon";
// import { PaintBucket } from "./Models/PaintBucket";

// import Duck from "@/components/Models/Duck";
import { DuckModel as Duck } from "@/components/Models/Duck.jsx";
import { Debug, Physics } from "@react-three/cannon";
import { Player } from "./Player";
import { useTagGameStore } from "@/hooks/useTagGameStore";
import { FPV } from "./FPV";
import Ground from "./Ground";
import Log from "./Log";
import Dummy from "./Dummy";
import { memo } from "react";
import BotPlayer from "./BotPlayer";
import Trees from "./Trees";
import Grass from "./Grass";
import Players from "./Players";
import ItMarker from "./ItMarker";
import Obstacles from "./Obstacles";
import Barns from "./Barns";
import { useStore } from "@/hooks/useStore";
// import { useStore } from "@/hooks/useStore";

function GameCanvas(props) {

    // const GPUTier = useDetectGPU()

    // const {
    //     handleCameraChange,
    //     gameState,
    //     players,
    //     move,
    //     cameraInfo,
    //     server
    // } = props;

    // const {
    //     position,
    //     controlType,
    //     setControlType,
    //     tagCounter,
    //     debug,
    //     setDebug
    // } = useTagGameStore(state => ({
    //     position: state.position,
    //     controlType: state.controlType,
    //     setControlType: state.setControlType,
    //     tagCounter: state.tagCounter,
    //     debug: state.debug,
    //     setDebug: state.setDebug
    // }));

    const controlType = useTagGameStore(state => state.controlType)
    const debug = useTagGameStore(state => state.debug)

    const darkMode = useStore((state) => state.darkMode);

    return (
        <Canvas shadows id="game-canvas" camera={{ position: [-10, 40, 40], fov: 50 }}>

            {/* <OrbitControls
            // autoRotate={gameState?.status == 'In Lobby'}
            /> */}

            <Sky
                // distance={450000}
                sunPosition={
                    darkMode ?
                    [100, 0, 100]
                    :
                    [100, 20, 100]
                } // Mid-day/Sunset position
            // inclination={0}
            // azimuth={0.25}
            // {...props} 
            />

            <ambientLight intensity={darkMode ? 1 : 2} />
            <directionalLight
                position={[50, 60, 50]}
                intensity={darkMode ? 1 : 2}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-left={-100}
                shadow-camera-right={100}
                shadow-camera-top={100}
                shadow-camera-bottom={-100}
            />

            {controlType == "Mouse and Keyboard" &&
                <FPV
                // location={location}
                // setLocation={setLocation}
                // menuOpen={menuOpen}
                />
            }

            <Physics
                gravity={[0, -10, 0]}
                defaultContactMaterial={{ friction: 0, restitution: 0 }}
                iterations={20}
                tolerance={0.0001}
            >

                <Debug
                    scale={debug ? 1 : 0}
                >
                    <Ground />

                    <Log
                        position={[0, 0.25, 10]}
                        size={[10, 0.5, 0.5]}
                    />

                    <Log
                        position={[0, 0.25, 12]}
                        size={[10, 0.5, 0.5]}
                    />

                    <Log
                        position={[0, 0.25, 14]}
                        size={[10, 0.5, 0.5]}
                    />

                    <Dummy />

                    {controlType == "Mouse and Keyboard" &&
                        <Player />
                    }

                    <Players />

                    <Obstacles />

                    {/* <BotPlayer /> */}

                    <ItMarker />

                    {/* Center Dummy */}
                    <Duck
                        position={[0, 0, -10]}
                        rotation={[0, 0, 0]}
                    />

                </Debug>

            </Physics>

            {/* Fake Players */}
            {/* <group scale={1} position={[0, 0.1, 0]}>
                <Duck
                    position={[10, 0, -10]}
                    rotation={[0, 0, 0]}
                />

                <Duck
                    position={[-10, 0, -10]}
                    rotation={[0, 0, 0]}
                />

                <Duck
                    position={[10, 0, 10]}
                    rotation={[0, -Math.PI, 0]}
                />

                <Duck
                    position={[-10, 0, 10]}
                    rotation={[0, -Math.PI, 0]}
                />
            </group> */}

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

            {/* <ambientLight intensity={5} /> */}
            <spotLight intensity={500} position={[-50, 100, 50]} angle={5} penumbra={1} />

            {/* <pointLight position={[-10, -10, -10]} /> */}

        </Canvas>
    )
}

export default memo(GameCanvas)