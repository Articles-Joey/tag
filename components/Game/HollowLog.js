import { useStore } from "@/hooks/useStore"
import { useCompoundBody } from "@react-three/cannon"
import { useMemo } from "react"
import { DoubleSide, BackSide } from "three"

export default function HollowLog(props) {

    const { position = [0, 1.6, 0], rotation = [0, 0, 0] } = props

    const radius = 1.5
    const length = 8
    const segments = 12
    const thickness = 0.2

    const graphicsQuality = useStore((state) => state.graphicsQuality)

    const shapes = useMemo(() => {
        const shapeArr = []
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2
            const x = Math.cos(angle) * (radius + thickness / 2)
            const y = Math.sin(angle) * (radius + thickness / 2)

            // Width of the plank (slightly overlapped to prevent gaps)
            const width = 2 * (radius + thickness / 2) * Math.tan(Math.PI / segments) * 1.1

            shapeArr.push({
                type: 'Box',
                // Box extent [x, y, z] is HALF-extents for Cannon? No, args are full extents [width, height, depth] usually in react-three-cannon 
                // but checking Docs: useBox args is [x, y, z] extent. 
                // Wait, useCompoundBody shapes args:
                // "args: [1, 1, 1]" -> Box of size 1x1x1.
                args: [thickness, width, length],
                position: [x, y, 0],
                rotation: [0, 0, angle]
            })
        }
        return shapeArr
    }, [])

    const [ref] = useCompoundBody(() => ({
        mass: 0, // Static
        type: 'Static',
        position,
        rotation,
        shapes
    }))

    return (
        <group ref={ref}>

            {graphicsQuality == "Low" &&
                <mesh receiveShadow castShadow rotation={[Math.PI / 2, 0, 0]}>
                    {/* Visual geometry: aligned to Y axis, so we rotate it to Z */}
                    <cylinderGeometry args={[radius, radius, length, segments, 1, true]} />
                    <meshStandardMaterial
                        color="#5C4033"
                        side={DoubleSide}
                        roughness={0.9}
                    />
                </mesh>
            }

            {["Medium", "High"].includes(graphicsQuality) &&
                <group rotation={[Math.PI / 2, 0, 0]}>
                    {/* Outer Shell */}
                    <mesh receiveShadow castShadow>
                        <cylinderGeometry args={[radius + thickness, radius + thickness, length, segments, 1, true]} />
                        <meshStandardMaterial color="#5C4033" roughness={0.9} />
                    </mesh>

                    {/* Inner Shell */}
                    <mesh receiveShadow castShadow>
                        <cylinderGeometry args={[radius, radius, length, segments, 1, true]} />
                        <meshStandardMaterial color="#4A332A" side={BackSide} roughness={0.9} />
                    </mesh>

                    {/* End Caps */}
                    <mesh position={[0, length / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[radius, radius + thickness, segments]} />
                        <meshStandardMaterial color="#5C4033" roughness={0.9} />
                    </mesh>
                    <mesh position={[0, -length / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[radius, radius + thickness, segments]} />
                        <meshStandardMaterial color="#5C4033" roughness={0.9} />
                    </mesh>
                </group>
            }

        </group>
    )
}
