import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { useState } from 'react';

const platformSize = [1, 0.25, 1];

let direction = 1;

export default function MovingPlatform(props) {

    const [refBox, api] = useBox(() => ({
        mass: 0,
        position: [props.startPosition, 1, 0], // Set initial position
        args: platformSize,
        collisionFilterGroup: 1,
        collisionFilterMask: 0,
    }));

    // const [ direction, setDirection ] = useState(1)

    // Animation parameters
    const animationSpeed = 0.02; // Adjust the speed as needed
    const targetPosition = props.endPosition;

    // Use useFrame to update the position of the box in each frame
    useFrame(() => {
        // Update the position of the box along the x-axis based on the current direction
        refBox.current.position.x += animationSpeed * direction;

        // console.log(refBox.current.position.x, direction)

        // Use api.position to update the position
        api.position.set(
            refBox.current.position.x,
            refBox.current.position.y,
            refBox.current.position.z
        );

        // Check if the box has reached the target positions
        if (refBox.current.position.x >= targetPosition) {
            console.log('-1')
            // setDirection(-1)
            direction = -1; // Change direction to move to the left
            return
        } else if (refBox.current.position.x <= props.startPosition) {
            console.log('1')
            // setDirection(1)
            direction = 1; // Change direction to move to the right
            return
        }
    });

    return (
        <group>
            {/* Box for the visual representation of the moving platform */}
            <mesh ref={refBox} castShadow>
                <boxGeometry args={platformSize} />
                <meshStandardMaterial color={props.color || 'orange'} />
            </mesh>
        </group>
    );
}