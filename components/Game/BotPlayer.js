import { useSphere } from "@react-three/cannon";
import Duck from "@/components/Models/Duck";

export default function BotPlayer() {

    const [ref, api] = useSphere(() => ({
        mass: 3,
        type: 'Dynamic',
        position: [10, 2, 0],
        args: [1, 1, 10]
    }))

    return (
        <group ref={ref}>

            <Duck
                // position={[0, 0, 10]}
                rotation={[0, 0, 0]}
            />

        </group>
    )
}