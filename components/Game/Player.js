import { useFrame, useThree } from "@react-three/fiber"
import { useSphere } from "@react-three/cannon"
import { memo, useEffect, useRef, useState } from "react"
import { Vector3 } from "three"
import { useKeyboard } from "@/hooks/useKeyboard"

import { useTagGameStore } from "@/hooks/useTagGameStore"
import { usePeerStore } from "@/hooks/usePeerStore"
// import Duck from "../Models/Duck"
import SpacesuitModel from "../Models/Spacesuit"
import { degToRad } from "three/src/math/MathUtils"

const JUMP_FORCE = 4;
const SPEED = 4;

function PlayerBase() {

    const { moveBackward, moveForward, moveRight, moveLeft, jump, shift, crouch, cameraView } = useKeyboard()

    const [action, setAction] = useState("Idle")
    const [speed, setSpeed] = useState(1)
    const [isJumping, setIsJumping] = useState(false)

    useEffect(() => {
        if (isJumping) return;
        
        if (moveLeft || moveRight || moveBackward || moveForward) {
            if (shift) {
                setAction("Run");
            } else {
                setAction("Walk");
            }
        } else {
            setAction("Idle");
        }
    }, [moveBackward, moveForward, moveRight, moveLeft, isJumping, shift])

    const [isThirdPerson, setIsThirdPerson] = useState(false)

    useEffect(() => {
        if (cameraView) setIsThirdPerson((prev) => !prev)
    }, [cameraView])

    const { camera } = useThree()

    const modelRef = useRef()
    
    // Track how many frames we've been "still" vertically to detect ground vs apex
    const groundedFrames = useRef(0)

    const [ref, api] = useSphere(() => ({
        mass: 1,
        args: [0.3],
        type: 'Dynamic',
        position: [0, 1, 0],
        fixedRotation: true,
        angularDamping: 1,
    }))

    const setPlayer = useTagGameStore((state) => state.setPlayer);
    const setPosition = useTagGameStore((state) => state.setPosition);
    const setRotation = useTagGameStore((state) => state.setRotation);
    const setActionStore = useTagGameStore((state) => state.setAction);
    const setSprintEnergy = useTagGameStore((state) => state.setSprintEnergy);

    useEffect(() => {
        setActionStore(action);
    }, [action, setActionStore]);

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
        } else {
            const { gameState, peer } = usePeerStore.getState();
            // If we are "IT", we recover stamina faster (2s vs 3s)
            const isIt = gameState?.itPlayerId && peer?.id && gameState.itPlayerId === peer.id;
            const recoveryCooldown = isIt ? 2000 : 3000;

            if (Date.now() - lastSprintTime.current > recoveryCooldown) {
                sprintEnergy.current = Math.min(5, sprintEnergy.current + delta)
            }
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
                    setRotation(rotation)
                }
            }
        }

        // Boundary Checks (Prevent going past -85 and 85)
        if (pos.current[0] > 85 && direction.x > 0) direction.x = 0;
        if (pos.current[0] < -85 && direction.x < 0) direction.x = 0;
        if (pos.current[2] > 85 && direction.z > 0) direction.z = 0;
        if (pos.current[2] < -85 && direction.z < 0) direction.z = 0;

        api.velocity.set(direction.x, vel.current[1], direction.z)

        // Check if grounded (low vertical velocity for multiple frames)
        if (Math.abs(vel.current[1]) < 0.1) {
            groundedFrames.current += 1
        } else {
            groundedFrames.current = 0
        }

        // Jump if grounded for at least 3 frames (avoids apex jumping)
        if (jump && groundedFrames.current > 2) {
            api.velocity.set(vel.current[0], JUMP_FORCE, vel.current[2])
            groundedFrames.current = 0

            // Play Run animation at 3x speed for 1 second to simulate jump
            setIsJumping(true)
            setAction("Run")
            setSpeed(3)
            
            setTimeout(() => {
                setIsJumping(false)
                setSpeed(1)
            }, 1000)
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
                    speed={speed}
                />

            </group>
        </>
    )
}

const MemoizedPlayer = memo(PlayerBase);

export const Player = MemoizedPlayer;