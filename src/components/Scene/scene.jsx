import React, { useRef, useState } from 'react'
import '../../App.css';
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Box } from '../box/box';
import { OrthographicCamera } from '@react-three/drei';
// import * as THREE from 'three'
import { useEffect } from 'react';
import { Physics } from '@react-three/cannon';
const CameraDolly = ({ currentHeight }) => {
  const [init,setInit] =useState(false);
    useFrame((state) => {
      if(!init){
        state.camera.position.set(4, 3, 5);
        state.camera.lookAt(0, currentHeight-1, 0)
        state.camera.position.y += currentHeight-1;
        setInit(true);
      }
      if(state.camera.position.y<currentHeight &&state.camera.position.y !== currentHeight)
      {state.camera.position.y += 0.10;}
    })
  
    return null
  }
function Scene({currentHeight,stack,setBoxStack}) {
  const createLayer=(heigth,i)=>{
    return <Box key={i} ref={ref => childRefs.current.push(ref)} index={i} height={heigth} currentHeight={currentHeight} plane={false} />
  }

  return (
    <React.Suspense fallback={<></>}>
    <ambientLight intensity={0.4} />
    <directionalLight position={[10, 20, 16]} intensity={1} />
    <Physics>
      {currentHeight && <Box ref={ref => childRefs.current.push(ref)} index={'011'} height={1} plane={true} />}
      {stack &&
        stack.map((heigth, i) => {
          return createLayer(heigth,i)
        })
      }
    </Physics>
    {currentHeight && <CameraDolly currentHeight={currentHeight} />}
  </React.Suspense>

  )
}

export default Scene
