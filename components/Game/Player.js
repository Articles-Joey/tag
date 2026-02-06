import { useFrame, useThree } from "@react-three/fiber"
import { useSphere } from "@react-three/cannon"
import { memo, useEffect, useRef, useState } from "react"
import { Vector3 } from "three"
import { useKeyboard } from "@/hooks/useKeyboard"

import { useTagGameStore } from "@/hooks/useTagGameStore"
// import Duck from "../Models/Duck"
import SpacesuitModel from "../Models/Spacesuit"
import { degToRad } from "three/src/math/MathUtils"

const JUMP_FORCE = 4;
const SPEED = 4;

function PlayerBase() {

    const { moveBackward, moveForward, moveRight, moveLeft, jump, shift, crouch, cameraView } = useKeyboard()

    const [action, setAction] = useState("Idle")
    const isJumping = useRef(false)

    useEffect(() => {
        if (moveLeft || moveRight || moveBackward || moveForward) {
            if (!isJumping.current) setAction("Walk");
        } else {
            if (!isJumping.current) setAction("Idle");
        }
    }, [moveBackward, moveForward, moveRight, moveLeft])

    useEffect(() => {
        if (jump) {
            isJumping.current = true;
            setAction("Jump");
            setTimeout(() => {
                isJumping.current = false;
                // We don't manually reset action here, let the input change (or a manual ref check) handle it?
                // Actually, if we just set isJumping to false, the next movement update will fix it.
                // But if we are holding a key, dependencies might not change.
                // Force a check:
                 setAction(prev => {
                     // This is a bit hacky to force a re-eval if needed, or we rely on the component re-rendering?
                     // Let's just default to idle and let the movement hook pick it up if it fires? 
                     // No, the movement hook only fires on change.
                     return "Idle"
                 })
            }, 1000);
        }
    }, [jump])

    const [isThirdPerson, setIsThirdPerson] = useState(false)

    useEffect(() => {
        if (cameraView) setIsThirdPerson((prev) => !prev)
    }, [cameraView])

    const { camera } = useThree()

    const modelRef = useRef()

    const [ref, api] = useSphere(() => ({
        mass: 1,
        args: [0.3, 0.3, 0.3],
        type: 'Dynamic',
        position: [0, 1, 0],
    }))

    const setPlayer = useTagGameStore((state) => state.setPlayer);
    const setPosition = useTagGameStore((state) => state.setPosition);
    const setSprintEnergy = useTagGameStore((state) => state.setSprintEnergy);

    useEffect(() => {
        // Save ref and api to the store
        setPlayer(ref, api);

        // Subscribe to the position updates
        const unsubscribe = api.position.subscribe((position) => {
            setPosition([...position]); // Update position in the store
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [ref, api, setPlayer, setPosition]);

    const vel = useRef([0, 0, 0])
    useEffect(() => {

        const unsubscribe = api.velocity.subscribe((v) => vel.current = v)
        return () => unsubscribe();

    }, [api.velocity])

    const pos = useRef([0, 0, 0])

    useEffect(() => {

        const unsubscribe = api.position.subscribe((p) => pos.current = p)
        return () => unsubscribe();

    }, [api.position])

    useEffect(() => {
        console.log("Shift", shift)
    }, [shift])

    const sprintEnergy = useRef(5)
    const lastSprintTime = useRef(0)

    useFrame((state, delta) => {

        // return

        // camera.position.copy(new Vector3(pos.current[0], (pos.current[1] / (crouch ? 2 : 1)), pos.current[2]))

        // Update the camera position using the global state
        if (isThirdPerson) {
            const cameraDirection = new Vector3()
            camera.getWorldDirection(cameraDirection)

            const targetPos = new Vector3(
                pos.current[0],
                (pos.current[1] / (crouch ? 2 : 1)) + 0.5,
                pos.current[2]
            )

            const offset = cameraDirection.clone().multiplyScalar(-4)

            camera.position.copy(targetPos).add(offset)
        } else {
            camera.position.copy(
                new Vector3(
                    pos.current[0],
                    (pos.current[1] / (crouch ? 2 : 1)) + 1, // Adjust height for crouch
                    pos.current[2]
                )
            );
        }

        // console.log(pos)

        const direction = new Vector3()

        const frontVector = new Vector3(
            0,
            0,
            (moveBackward ? 1 : 0) - (moveForward ? 1 : 0)
        )

        const sideVector = new Vector3(
            (moveLeft ? 1 : 0) - (moveRight ? 1 : 0),
            0,
            0,
        )

        const isMoving = frontVector.length() > 0 || sideVector.length() > 0
        const isSprinting = shift && isMoving && sprintEnergy.current > 0

        if (isSprinting) {
            sprintEnergy.current = Math.max(0, sprintEnergy.current - delta)
            lastSprintTime.current = Date.now()
        } else if (Date.now() - lastSprintTime.current > 3000) {
            sprintEnergy.current = Math.min(5, sprintEnergy.current + delta)
        }

        setSprintEnergy(sprintEnergy.current)

        direction
            .subVectors(frontVector, sideVector)
            .normalize()
            .multiplyScalar(SPEED * (isSprinting ? 2 : 1))
            .applyEuler(camera.rotation)

        if (isMoving) {
            // Calculate rotation based on movement direction
            // Math.atan2(x, z) gives the angle relative to "Forward" (Z-axis)
            // Adjust depending on model orientation. Usually models face +Z or -Z.
            // If the model faces +Z, and we move +Z (Backward), atan2(0, 1) = 0.
            // If we move -Z (Forward), atan2(0, -1) = PI.
            // We'll trust atan2 gives the correct yaw angle for the world velocity.
            const rotation = Math.atan2(direction.x, direction.z);
            if (modelRef.current) {
                // Check if we have significant movement to avoid jitter
                if (Math.abs(direction.x) > 0.001 || Math.abs(direction.z) > 0.001) {
                    modelRef.current.rotation.y = rotation
                }
            }
        }

        api.velocity.set(direction.x, vel.current[1], direction.z)

        if (jump && Math.abs(vel.current[1]) < 0.05) {
            api.velocity.set(vel.current[0], JUMP_FORCE, vel.current[2])
        }

        if (modelRef.current) {
            modelRef.current.position.set(pos.current[0], pos.current[1], pos.current[2])
        }

    })

    return (
        <>
            <mesh ref={ref} />
            <group ref={modelRef}>

                {/* <Duck /> */}

                <SpacesuitModel
                    scale={0.5}
                    position={[0, -0.3, 0]}
                    action={action}
                />

            </group>
        </>
    )
}

const MemoizedPlayer = memo(PlayerBase);

export const Player = MemoizedPlayer;