import { useState } from 'react';

import { useBox } from '@react-three/cannon';
import { useTagGameStore } from '@/hooks/useTagGameStore';

export default function Dummy(props) {

    const platform_size = props.size

    const [color, setColor] = useState('saddlebrown');

    // Function to generate a random color
    const getRandomColor = () => {
        const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        return randomColor;
    };

    const {
        // tagCounter,
        setTagCounter
    } = useTagGameStore(state => ({
        // tagCounter: state.tagCounter,
        setTagCounter: state.setTagCounter
    }));

    const [ref, api] = useBox(() => ({
        mass: 0,
        isTrigger: true,
        position: [5, 1, 0],
        args: [1, 1, 1], // Dimensions of the cube
        onCollide: () => {
            const tagCounter = useTagGameStore.getState().tagCounter;
            console.log("colliding", tagCounter);
            setColor(getRandomColor());
            setTagCounter(tagCounter + 1)
        },
        // onCollideBegin: () => {
        //     console.log("start collision");
        // },
    }));

    return (
        <mesh
            {...props}
            ref={ref}
            scale={1}
        >
            <boxGeometry {...props} args={platform_size} />
            <meshStandardMaterial color={color} transparent={true} opacity={0.5} />
        </mesh>
    )

}