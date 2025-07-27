import { useBox } from '@react-three/cannon';
import { Vector3 } from 'three';
import { useGameStore } from '@/hooks/useGameStore';

const platformSize = [1, 0.25, 1];

export default function OneWayPlatform(props) {

    let platformY = (props.position[1] + 0.5)

    const { 
        playerLocation,
        shift 
    } = useGameStore()

    return (
        <group>
            {(playerLocation.y > (platformY) && !shift) ?
                <CollisionBox
                    position={props.position}
                    platformSize={props.platformSize}
                />
                :
                <VisualBox
                    position={props.position}
                    platformSize={props.platformSize}
                />
            }
        </group>
    );
}
function VisualBox(props) {
    return (
        <group>
            {/* Box for the visual representation of the platform */}
            <mesh {...props} castShadow>
                <boxGeometry args={props.platformSize || platformSize} />
                <meshStandardMaterial color={'green'} />
            </mesh>
        </group>
    );
}

function CollisionBox(props) {
    let platformY = (props.position[1] + 0.1)

    const { playerLocation } = useGameStore()

    // const [ stopPlayer, setstopPlayer ] = useState()

    const [refBox] = useBox(() => ({
        mass: 0,
        position: props.position,
        collisionFilterGroup: 1,
        collisionFilterMask: 1,
        args: props.platformSize || platformSize,
        rotation: [0, 0, 0], // Rotation angles in radians (yaw, pitch, roll)
        onCollide: (contact) => {
            // Handle collision on the top surface
            const { body } = contact;
            // Check the collision normal to determine the direction
            const collisionDirection = new Vector3(0, 1, 0).applyQuaternion(body.quaternion);
            if (collisionDirection.y > 0) {
                console.log('Collided from the top direction!');
            } else {
                console.log('Collided from the bottom direction!');
                // Do something or prevent the effect when collided from the bottom
            }
        },
    }));

    return (
        <group>
            {/* Box for the visual representation of the platform */}
            <mesh ref={refBox} castShadow>
                <boxGeometry args={props.platformSize || platformSize} />
                <meshStandardMaterial color={'blue'} />
            </mesh>
        </group>
    );
}