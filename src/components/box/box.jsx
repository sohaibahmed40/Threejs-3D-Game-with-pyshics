import react, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';

export const Box = ({ height = 1, index, currentHeight,setBoxStack},props) => {
    const [x, setX] = useState(-10);
    let meshRef = useRef();
    useEffect(()=>{
},[meshRef])
    // const [x, setX] = useState(height == 1 ? 0 : -10);
    // const [sphereX, setSphereX] = useState(-10);
    // const [ballRef, sphereApi] = useBox(() => ({ mass: height == 1?0:1, position: [x, height, 0],allowSleep:false }));

    
    // useFrame(() => {
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
    useFrame(() => {
        if (height == 1) {
            meshRef.current.position.x = 0
            return
        }
        if (currentHeight - 1 == height) {

            meshRef.current.position.x += 0.15
        }
        else{
            // meshRef.current.scale.x=0.4
        }
    })
    return <mesh ref={meshRef} key={index} rotation={[0, 0, 0]} position={[x, height, 0]}>
        <boxGeometry key={index} attach='geometry' args={[3, 1, 3]} />
        <meshLambertMaterial attach='material' color={`hsl(${30 + height * 4},100%,50%)`} />
    </mesh>
}