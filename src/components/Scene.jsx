import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon';
import img from "../assets/linkedin.webp";

let gameStarted = false;
let overhangs = []
const boxHeight = 1

let world = new CANNON.World();
let camera, scene, renderer, geometry, material;
let stack = [];
const originalBoxSize = 3; // Original width and height of a box
let score = 0;
let gameEnded = false;
let bestScore=0
const ThreeBoxComponent = () => {
  const canvasRef = useRef(null); // Ref to hold the canvas element
  const [gameStartedLocal, setGameStartedLocal] = useState(false)
  const [gameEndedLocal, setGameEndedLocal] = useState(false)
  const [scoreLocal, setScoreLocal] = useState(0)
  const [bestScoreLocal, setBestScore] = useState(0)

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
    mesh.position.set(x, y - 1, z);
    scene.add(mesh);

    // CannonJS
    const shape = new CANNON.Box(
      new CANNON.Vec3(width / 2, boxHeight / 2, depth / 2)
    );
    let mass = falls ? 5 : 0; // If it shouldn't fall then setting the mass to zero will keep it stationary
    mass *= width / originalBoxSize; // Reduce mass proportionately by size
    mass *= depth / originalBoxSize; // Reduce mass proportionately by size
    const body = new CANNON.Body({ mass, shape });
    body.position.set(x, y - 1, z);
    world.addBody(body);

    return {
      threejs: mesh,
      cannonjs: body,
      width,
      depth
    };
  }

  const init = () => {
    // Initialize CannonJS
    world.gravity.set(0, -10, 0); // Gravity pulls things down
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 40;
    scene = new THREE.Scene();
    addLayer(0, 0, originalBoxSize, originalBoxSize)
    addLayer(-10, 0, originalBoxSize, originalBoxSize, 'x')
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight);

    const directionLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionLight.position.set(10, 20, 0)
    scene.add(directionLight);

    const aspect = window.innerWidth / window.innerHeight
    const width = 25;
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
  function startGame() {
    gameEnded = false;
    setGameEndedLocal(false)
    stack = [];
    overhangs = [];
    score=0;
    setScoreLocal(score);

    if (world) {
      // Remove every object from world
      while (world.bodies.length > 0) {
        world.remove(world.bodies[0]);
      }
    }

    if (scene) {
      // Remove every Mesh from the scene
      while (scene.children.find((c) => c.type == "Mesh")) {
        const mesh = scene.children.find((c) => c.type == "Mesh");
        scene.remove(mesh);
      }

      // Foundation
      addLayer(0, 0, originalBoxSize, originalBoxSize);

      // First layer
      addLayer(-10, 0, originalBoxSize, originalBoxSize, "x");
    }

    if (camera) {
      // Reset camera positions
      camera.position.set(4, 4, 4);
      camera.lookAt(0, 0, 0);
    }
  }
  const onClickListener = () => {

  }
  const animation = () => {
    const speed = 0.15;
    const topLayer = stack[stack.length - 1];
    topLayer.threejs.position[topLayer.direction] += speed;
    topLayer.cannonjs.position[topLayer.direction] += speed;
    if (camera.position.y < boxHeight * (stack.length - 2) + 4) {
      camera.position.y += speed;
    }
    updatePhysics()
    renderer.render(scene, camera)
  }

  function addOverhang(x, z, width, depth) {
    const y = boxHeight * (stack.length - 1); // Add the new box one the same layer
    const overhang = generateBox(x, y, z, width, depth, true);
    overhangs.push(overhang);
  }

  function updatePhysics(timePassed) {
    world.step(1 / 60); // Step the physics world

    // Copy coordinates from Cannon.js to Three.js
    overhangs.forEach((element) => {
      element.threejs.position.copy(element.cannonjs.position);
      element.threejs.quaternion.copy(element.cannonjs.quaternion);
    });
  }

  useEffect(() => {
    init();
    window.addEventListener("click", () => {

      if (!gameEnded) {

        if (!gameStarted) {
          // init()
          renderer.setAnimationLoop(animation);
          setGameStartedLocal(true);
          gameStarted = true;
        }
        else {
          const topLayer = stack[stack.length - 1];
          const previousLayer = stack[stack.length - 2];
          const direction = topLayer.direction;

          const delta = topLayer.threejs.position[direction] - previousLayer.threejs.position[direction];
          const overHangsize = Math.abs(delta)
          const size = direction == 'x' ? topLayer.width : topLayer.depth;
          const overlap = size - overHangsize;
          if (overlap > 0) {
            score = score + 1;
            if(score>bestScore){
              bestScore=score;
              setBestScore(score)
            }
            setScoreLocal(score)
            const newWidth = direction == 'x' ? overlap : topLayer.width
            const newDepth = direction == 'z' ? overlap : topLayer.depth

            topLayer.width = newWidth;
            topLayer.depth = newDepth;

            topLayer.threejs.scale[direction] = overlap / size;
            topLayer.threejs.position[direction] -= delta / 2;

            // Update CannonJS model
            topLayer.cannonjs.position[direction] -= delta / 2;

            // Replace shape to a smaller one (in CannonJS you can't simply just scale a shape)
            const shape = new CANNON.Box(
              new CANNON.Vec3(newWidth / 2, boxHeight / 2, newDepth / 2)
            );
            topLayer.cannonjs.shapes = [];
            topLayer.cannonjs.addShape(shape);


            const overhangShift = (overlap / 2 + overHangsize / 2) * Math.sign(delta);
            const overhangX = direction == "x" ? topLayer.threejs.position.x + overhangShift : topLayer.threejs.position.x;
            const overhangZ = direction == "z" ? topLayer.threejs.position.z + overhangShift : topLayer.threejs.position.z;
            const overhangWidth = direction == "x" ? overHangsize : topLayer.width;
            const overhangDepth = direction == "z" ? overHangsize : topLayer.depth;

            addOverhang(overhangX, overhangZ, overhangWidth, overhangDepth);

            const nextX = direction == 'x' ? topLayer.threejs.position.x : -10;
            const nextZ = direction == 'z' ? topLayer.threejs.position.z : -10;
            const nextDirection = direction == 'x' ? 'z' : 'x';

            addLayer(nextX, nextZ, newWidth, newDepth, nextDirection)
          }
          else {
            resetGame();
          }

        }
      }

    });
    window.addEventListener("keydown", function (event) {
      if (event.key == " ") {
        event.preventDefault();
        eventHandler();
        return;
      }
      if (event.key == "R" || event.key == "r") {
        event.preventDefault();
        startGame();
        return;
      }
    });
    // Cleanup on unmount
    return () => {
      setGameStartedLocal(false);
      gameStarted = false
      // Dispose the box geometry and material
      geometry.dispose();
      material.dispose();
      // Dispose the renderer
      renderer.dispose();
      stack = [];
      overhangs = []
    };
  }, []);

  const resetGame = () => {
    const topLayer = stack[stack.length - 1];

    // Turn to top layer into an overhang and let it fall down
    addOverhang(
      topLayer.threejs.position.x,
      topLayer.threejs.position.z,
      topLayer.width,
      topLayer.depth
    );
    world.remove(topLayer.cannonjs);
    scene.remove(topLayer.threejs);

    gameEnded = true;
    setGameEndedLocal(true)
  }
  const onClick = () => {
    window.open(`https://www.linkedin.com/in/sohaib-ahmad-aa6b62141/`, '_blank')
  }
  return (
    <div className='canvasDiv'>
      {!gameStartedLocal && <div className='start'>
        Click To Start The Game
      </div>}
      {gameEndedLocal && <div className='end'>
        Your Score: {score}
        <br/>
        Best Score: {bestScoreLocal}
        <br/>
        Press R to Restart
      </div>}
      <div className='score'>
        Score: {scoreLocal}       
      </div>
      <div className='bestScore'>
        Best Score: {bestScoreLocal}       
      </div>
      <div className='copyright' onClick={onClick}>
        Created By Sohaib Ahmad <span ><img style={{width:'40px'}} src={img}/></span>   
      </div>
      <canvas ref={canvasRef} />
      <meta name="description" content="Welcome to Sohail's App, featuring 3D stack games and scripts by Sohail Ahmed" />
      <meta name="keywords" content="sohaib, 3d stack game, sohaib scripts"/>
    </div>
  );
};

export default ThreeBoxComponent;