import react, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox, usePlane } from '@react-three/cannon';

export const Plane = ({ height, currentHeight }) => {
    const [x, setX] = useState(height == 1 ? 0 : -10);
    const [sphereX, setSphereX] = useState(-10);
    const [ballRef, sphereApi] = useBox(() => ({ mass: 0, position: [x, height, 0]}));

    // const [ref] = usePlane(() => ({ ...props }));
    // useFrame(() => {


    //     console.log("Inside WAll",currentHeight-1,height)
    //     if (currentHeight - 1 == height) {

    //         // ballRef.current.position.set();
    //         setSphereX((sphereX) => sphereX + 0.05); // set state x position to +0.05 (5 is fast)
    //         sphereApi.position.set(sphereX, height, 0); // apply the state to the sphere position

    //         // sphereApi.mass.set(1)
    //     }
    //     else {
    //         // console.log('inisde ref',meshRef.current, ballRef.current)
    //         // meshRef.current = ballRef.current
    //     }
    // })
    return <mesh ref={ballRef} rotation={[0, 0, 0]} position={[x, height, 0]}>
        <boxGeometry attach='geometry' args={[3, 1, 3]} />
        <meshLambertMaterial attach='material' color={`hsl(${30 + height * 4},100%,50%)`} />
    </mesh>
}