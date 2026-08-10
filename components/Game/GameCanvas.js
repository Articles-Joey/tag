import { Canvas } from "@react-three/fiber"
import { Sky, useDetectGPU, useTexture, OrbitControls, Stats } from "@react-three/drei";

import { NearestFilter, RepeatWrapping, TextureLoader } from "three";
// import GameGrid from "./GameGrid";

// import Witch from "../../../../../../components/Games/Race Game/PlayerModels/Witch";
// import { Star } from "../../../../../../components/Games/Race Game/Star";

import Sand from '@/components/Game/Sand';
// import { Cannon } from "./Models/Cannon";
// import { PaintBucket } from "./Models/PaintBucket";

// import Duck from "@/components/Models/Duck";
import { DuckModel as Duck } from "@/components/Models/Duck.jsx";
import { Debug, Physics } from "@react-three/cannon";
import { Player } from "./Player";
import { useTagGameStore } from "@/hooks/useTagGameStore";
import { FPV } from "./FPV";
import { memo, useMemo } from "react";
// import BotPlayer from "./BotPlayer";
import Players from "./Players";
import ItMarker from "./ItMarker";
import { useStore } from "@/hooks/useStore";
import { usePeerStore } from "@/hooks/usePeerStore";
import { degToRad } from "three/src/math/MathUtils";

import ForestMap from "./Maps/ForestMap";
import DesertMap from "./Maps/DesertMap";
import RoomMap from "./Maps/RoomMap";
import WarehouseMap from "./Maps/WarehouseMap";

const MapComponents = {
    Forest: ForestMap,
    Desert: DesertMap,
    Room: RoomMap,
    Warehouse: WarehouseMap,
};
// import { useStore } from "@/hooks/useStore";

function GameCanvas() {

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
    // const controlType = useStore(state => state.controlType);
    const showStats = useStore((state) => state?.debugConfig?.showStats);

    const currentMap = usePeerStore(state => state.currentMap);

    const ActiveMap = MapComponents[currentMap] || ForestMap;

    const physicsProps = useMemo(() => ({
        gravity: [0, -10, 0],
        defaultContactMaterial: { friction: 0, restitution: 0 }
    }), [])

    return (
        <Canvas shadows id="game-canvas" camera={{ position: [-10, 40, 40], fov: 50 }}>

            {showStats && <>
                        <Stats className="stats-overlay" />
                    </>}

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
                gravity={physicsProps.gravity}
                defaultContactMaterial={physicsProps.defaultContactMaterial}
                iterations={20}
                tolerance={0.0001}
            >

                <Debug
                    scale={debug ? 1 : 0}
                >
                    {/* Active map provides ground, obstacles, and decorations */}
                    <ActiveMap />

                    {controlType == "Mouse and Keyboard" &&
                        <Player />
                    }

                    <Players />

                    {/* <BotPlayer /> */}

                    <ItMarker />

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

            {/* <ambientLight intensity={5} /> */}
            <spotLight intensity={500} position={[-50, 100, 50]} angle={5} penumbra={1} />

            {/* <pointLight position={[-10, -10, -10]} /> */}

        </Canvas>
    )
}

export default memo(GameCanvas)