import { useStore } from "@/hooks/useStore";
import { Farm } from "@/components/Models/Farm";

export default function Barns() {

    const graphicsQuality = useStore((state) => state.graphicsQuality);

    return (
        <>
            {[
                "Medium",
                "High"
            ].includes(graphicsQuality) &&
                <group>

                    <group>
                        <Farm
                            scale={0.1}
                            position={[0, 0, 120]}
                        />

                        <Farm
                            scale={0.1}
                            position={[-40, 0, 115]}
                        />

                        <Farm
                            scale={0.1}
                            position={[40, 0, 115]}
                        />
                    </group>

                    <group>
                        <Farm
                            scale={0.1}
                            position={[0, 0, -120]}
                            rotation={[0, -Math.PI, 0]}
                        />
                        <Farm
                            scale={0.1}
                            position={[40, 0, -115]}
                            rotation={[0, -Math.PI, 0]}
                        />
                        <Farm
                            scale={0.1}
                            position={[-40, 0, -115]}
                            rotation={[0, -Math.PI, 0]}
                        />
                    </group>

                </group>
            }
        </>
    )

}