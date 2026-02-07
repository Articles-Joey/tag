import { useSphere } from "@react-three/cannon"
import { useFrame } from "@react-three/fiber"
import SpacesuitModel from "../Models/Spacesuit"
import { useRef } from "react"
import { Text, Billboard } from "@react-three/drei"

export default function RemotePlayer({ player }) {
    const [ref, api] = useSphere(() => ({
        mass: 1,
        type: 'Kinematic',
        args: [0.3],
        position: player.position,
        userData: { id: player.id, type: 'player' }
    }))

    useFrame(() => {
        if (player.position) {
            api.position.set(player.position[0], player.position[1], player.position[2])
        }
    })

    return (
        <group ref={ref}>
            <SpacesuitModel
                scale={0.5}
                position={[0, -0.3, 0]}
                rotation={player.rotation ? [0, player.rotation, 0] : [0, 0, 0]}
                action={player.action || "Idle"}
            />
            {/* Nickname Label */}
            <Billboard position={[0, 0.8, 0]}>
                <Text 
                    fontSize={0.25} 
                    color="white" 
                    outlineWidth={0.02} 
                    outlineColor="black"
                    anchorX="center" 
                    anchorY="middle"
                >
                    {player.nickname || player.id}
                </Text>
            </Billboard>
        </group>
    )
}
