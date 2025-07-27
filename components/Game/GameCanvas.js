import { Canvas } from "@react-three/fiber"
import { Sky, useDetectGPU, useTexture, OrbitControls } from "@react-three/drei";

import { NearestFilter, RepeatWrapping, TextureLoader } from "three";
// import GameGrid from "./GameGrid";
import Tree from "@/components/Models/Tree";
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
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
                <circleGeometry attach="geometry" args={[width, height]} />
                <meshStandardMaterial attach="material" map={texture} />
            </mesh>
        </>
    );
};

import Sand from '@/components/Game/Sand';
// import { Cannon } from "./Models/Cannon";
// import { PaintBucket } from "./Models/PaintBucket";
import { Farm } from "@/components/Models/Farm";
import Duck from "@/components/Models/Duck";
import { Physics } from "@react-three/cannon";
import { Player } from "./Player";
import { useTagGameStore } from "@/hooks/useTagGameStore";
import { FPV } from "./FPV";
import Ground from "./Ground";
import Log from "./Log";
import Dummy from "./Dummy";
import { memo } from "react";
import BotPlayer from "./BotPlayer";

function GameCanvas(props) {

    // const GPUTier = useDetectGPU()

    const {
        handleCameraChange,
        gameState,
        players,
        move,
        cameraInfo,
        server
    } = props;

    const {
        controlType,
        // galleryTheme,
        // setGalleryTheme,
        // music,
        // setMusic
    } = useTagGameStore()

    return (
        <Canvas camera={{ position: [-10, 40, 40], fov: 50 }}>

            {/* <OrbitControls
            // autoRotate={gameState?.status == 'In Lobby'}
            /> */}

            <Sky
                // distance={450000}
                sunPosition={[0, -10, 0]}
            // inclination={0}
            // azimuth={0.25}
            // {...props} 
            />

            {controlType == "Mouse and Keyboard" &&
                <FPV
                // location={location}
                // setLocation={setLocation}
                // menuOpen={menuOpen}
                />
            }

            <Physics>

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

                <BotPlayer />

                {/* Center Dummy */}
                <Duck
                    position={[0, 0, -10]}
                    rotation={[0, 0, 0]}
                />

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

            <group>
                <Farm
                    scale={0.2}
                    position={[0, 0, 120]}
                />

                <Farm
                    scale={0.2}
                    position={[-40, 0, 115]}
                />

                <Farm
                    scale={0.2}
                    position={[40, 0, 115]}
                />
            </group>

            <group>
                <Farm
                    scale={0.2}
                    position={[0, 0, -120]}
                    rotation={[0, -Math.PI, 0]}
                />
                <Farm
                    scale={0.2}
                    position={[40, 0, -115]}
                    rotation={[0, -Math.PI, 0]}
                />
                <Farm
                    scale={0.2}
                    position={[-40, 0, -115]}
                    rotation={[0, -Math.PI, 0]}
                />
            </group>

            {/* West */}
            {[...Array(56)].map((item, i) => {
                return (
                    <>
                        <Tree
                            key={i}
                            scale={0.5}
                            position={[-90, 0, (-84 + i * 3)]}
                        />
                    </>
                )
            })}

            {/* East */}
            {[...Array(56)].map((item, i) => {
                return (
                    <>
                        <Tree
                            key={i}
                            scale={0.5}
                            position={[90, 0, (-84 + i * 3)]}
                        />
                    </>
                )
            })}

            {/* North */}
            {[...Array(60)].map((item, i) => {
                return (
                    <>
                        <Tree
                            key={i}
                            scale={0.5}
                            position={[(-88 + i * 3), 0, -80]}
                        />
                    </>
                )
            })}

            {/* South */}
            {[...Array(60)].map((item, i) => {
                return (
                    <>
                        <Tree
                            key={i}
                            scale={0.5}
                            position={[(-88 + i * 3), 0, 80]}
                        />
                    </>
                )
            })}

            <GrassPlane />

            <Sand
                args={[200, 200]}
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.1, 0]}
            />

            <ambientLight intensity={5} />
            <spotLight intensity={3000} position={[-50, 100, 50]} angle={5} penumbra={1} />

            {/* <pointLight position={[-10, -10, -10]} /> */}

        </Canvas>
    )
}

export default memo(GameCanvas)