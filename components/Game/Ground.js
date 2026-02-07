import { memo, useState } from 'react';

import { useBox } from '@react-three/cannon';
// import { useStore } from '@/hooks/useStore';

function Ground(props) {

    // const touchControlsEnabled = useStore(state => state.touchControlsEnabled);

    // This reference gives us direct access to the THREE.Mesh object
    // const ref = useRef()

    const platform_size = [200, 0.25, 200]

    const [ref] = useBox(() => ({
        mass: 0,
        position: props.position,
        args: platform_size, // Dimensions of the cube
    }));

    // Hold state for hovered and clicked events
    // const [hovered, hover] = useState(false)
    // const [clicked, click] = useState(false)

    // Subscribe this component to the render-loop, rotate the mesh every frame
    // useFrame((state, delta) => (ref.current.rotation.x += delta))

    // Return the view, these are regular Threejs elements expressed in JSX
    return (
        <mesh
            {...props}
            ref={ref}
            scale={1}
        // onClick={(event) => click(!clicked)}
        // onPointerOver={(event) => (event.stopPropagation(), hover(true))}
        // onPointerOut={(event) => hover(false)}
        >
            <boxGeometry {...props} args={platform_size} />
            <meshStandardMaterial color={'green'} transparent={true} opacity={0.1} />
        </mesh>
    )

}

export default memo(Ground);