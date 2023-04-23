import React, { useState } from 'react'
import './App.css';
import { Canvas, useFrame } from '@react-three/fiber'
import { Box } from './components/box/box';
import { OrthographicCamera } from '@react-three/drei';
// import * as THREE from 'three'
import { useEffect } from 'react';
import { Physics } from '@react-three/cannon';
import Scene from './components/Scene/scene';
import ThreeObjectComponent from './components/Test';
// import {OrbitControls} from '@react-three/drei'
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
function App() {
  const [stack, setStack] = useState([])
  const [boxStack, setBoxStack] = useState([])
  const [currentHeight, setCurrentHeight] = useState(2)
  const toggleZoom = () => {
    // console.log('This is Box 1',this.document.getElementById('box1'))
    setStack((prev) => [...prev, currentHeight]);
    setCurrentHeight(currentHeight + 1)
  };

  useEffect(() => { 
    
  }, [stack])
  const [isWidth, setWidth] = useState()
  const [isHeigth, setHeigth] = useState()
  useEffect(() => {
    const width = 10
    setWidth(width);
    setHeigth(width + (window.innerWidth / window.innerHeight));
  }, [])
  return (
    <div className="App">
      {/* {isWidth && isHeigth &&
        <Canvas className='canvas' onClick={toggleZoom}>
       <Scene currentHeight={currentHeight} stack={stack} setBoxStack={setBoxStack}/>
        </Canvas>} */}
        <ThreeObjectComponent/>
    </div>
  )
}

export default App
