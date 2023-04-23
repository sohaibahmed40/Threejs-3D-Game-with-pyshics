import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

let gameStarted = false;
const boxHeight = 1
let camera, scene, renderer,geometry,material;
let stack = [];
const originalBoxSize = 3; // Original width and height of a box

const ThreeBoxComponent = () => {
  // const [stack,setStack]=useState([]);
  const canvasRef = useRef(null); // Ref to hold the canvas element

  function addLayer(x, z, width, depth, direction) {
    const y = boxHeight * stack.length; // Add the new box one layer higher
    const layer = generateBox(x, y, z, width, depth, false);
    layer.direction = direction;
    stack.push(layer);
  }

  function generateBox(x, y, z, width, depth, falls) {
    // ThreeJS
     geometry = new THREE.BoxGeometry(width, boxHeight, depth);
    const color = new THREE.Color(`hsl(${30 + stack.length * 4}, 100%, 50%)`);
     material = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    scene.add(mesh);

    // CannonJS
    // const shape = new CANNON.Box(
    //   new CANNON.Vec3(width / 2, boxHeight / 2, depth / 2)
    // );
    // let mass = falls ? 5 : 0; // If it shouldn't fall then setting the mass to zero will keep it stationary
    // mass *= width / originalBoxSize; // Reduce mass proportionately by size
    // mass *= depth / originalBoxSize; // Reduce mass proportionately by size
    // const body = new CANNON.Body({ mass, shape });
    // body.position.set(x, y, z);
    // world.addBody(body);

    return {
      threejs: mesh,
      // cannonjs: body,
      width,
      depth
    };
  }

  const init = () => {
    scene = new THREE.Scene();
    addLayer(0, 0, originalBoxSize, originalBoxSize)
    addLayer(-10, 0,originalBoxSize, originalBoxSize,'x')
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight);

    const directionLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionLight.position.set(10, 20, 0)
    scene.add(directionLight);

    const aspect = window.innerWidth / window.innerHeight
    const width = 40;
    const heigth = width / aspect;
     camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      heigth / 2,
      heigth / -2,
      1,
      100
    );
    camera.position.set(4, 4, 4);
    camera.lookAt(0, 0, 0)

    // Foundation
    // addLayer(0, 0, originalBoxSize, originalBoxSize);

    renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
    // const renderScene = () => {
    //   requestAnimationFrame(renderScene);
    // };
    // renderScene();
  }
  const onClickListener = () => {
 
  }
  const animation = () => {
    const speed = 0.15;
    const topLayer = stack[stack.length - 1];
    topLayer.threejs.position[topLayer.direction] += speed;
    if (camera.position.y < boxHeight * (stack.length - 2) + 4) {
      camera.position.y += speed;
    }
    renderer.render(scene, camera)
  }

  useEffect(() => {
    init();
    window.addEventListener("click", () => {
      console.log('inside Listener ELSE',gameStarted)
      if (!gameStarted) {
        renderer.setAnimationLoop(animation);
        gameStarted = true;
      }
      else {
        const topLayer = stack[stack.length - 1];
        const direction=topLayer.direction;
        const nextX=direction=='x'? 0 : -10;
        const nextZ=direction=='z'? 0 : -10;
        const newWidth=originalBoxSize;
        const newDepth=originalBoxSize;
        const nextDirection= direction=='x'?'z':'x';
        addLayer(nextX,nextZ,newWidth,newDepth,nextDirection)
      }
    });
    // Cleanup on unmount
    return () => {
      gameStarted = false;
      // Dispose the box geometry and material
      geometry.dispose();
      material.dispose();
      // Dispose the renderer
      renderer.dispose();
      stack = [];
    };
  }, []);

  useEffect(()=>{console.log("This is Stack Data:",stack)},stack)
  return (
    <div>
      {/* Render Three.js scene */}
      <canvas ref={canvasRef} />
    </div>
  );
};

export default ThreeBoxComponent;