/*
Nicholas G Bennett

Vite used for dependancy management 

Demo written for Orbisky Systems 
*/

//Import Section
import './style.css'
import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MouseMeshInteraction } from './three_mmi.js';

//Creation of various objects and settings used during rendering.
//Boilerplate
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}
const scene = new THREE.Scene();
const origin = new THREE.Vector3(0,0,0);
const earthRadius = 40;

let selectedSat = "";
const header = document.getElementById("cords");

const camera = new THREE.PerspectiveCamera( 125, sizes.width / sizes.height, 0.1, 1000 );
//For the renderer, make sure to target the same class as the Canvas Tag in your Index.HTML
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.domElement.addEventListener("click", onclick, true);

const mmi = new MouseMeshInteraction(scene, camera);

//Add an Event Listener so that if the window resizes, the canvas also resizes
//Boilerplate
window.addEventListener('resize', () =>{
  //Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  //Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  //Update Renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

//Set Render and camera, default is middle of screen
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
camera.position.setZ(25);
camera.position.setY(25);

//Create a Sphere, wrap it in an image and normal texture
const planetGeometery = new THREE.SphereGeometry(earthRadius, 128, 128);
const planetTexture = new THREE.TextureLoader().load('earthtexture.jpg');
const planetNormal = new THREE.TextureLoader().load("earthnormal.webp");
const planetMaterial = new THREE.MeshStandardMaterial({
  map: planetTexture,
  normalMap: planetNormal
});
//Bind that Shape and Texture to a Mesh
const planet = new THREE.Mesh(planetGeometery, planetMaterial);
planet.position.set(0,-1,0);
scene.add(planet);

//Directional Light cast light towards a given object
const directLight = new THREE.DirectionalLight(0xFFFFFF, 1);
directLight.position.set(800, 10, 0)
scene.add(directLight)

/*const helper = new THREE.DirectionalLightHelper(directLight);
scene.add(helper);*/

//Instance Orbit controls to enable camera movement
const controls = new OrbitControls( camera, renderer.domElement );
controls.maxDistance = 100;
controls.minDistance = 65;
controls.maxPolarAngle = Math.PI * 1;

//Create background "stars"
function addStar(){
  //Geometry and Material
  const sphereGeometry = new THREE.SphereBufferGeometry(0.25, 64, 64);
  const sphereMaterial = new THREE.MeshBasicMaterial( { color: 'white' });
  const star = new THREE.Mesh( sphereGeometry, sphereMaterial );

  //Create random positions for the star, then place it in the scene 
  var x = THREE.MathUtils.randFloat(0, 1);
  const negative = THREE.MathUtils.randInt(0, 1);

  if(negative == 1){
    x = x + earthRadius + 1;
  }else{
    x = x - earthRadius - 2;
  }

  var y = THREE.MathUtils.randFloat(-50, 50);
  var z = THREE.MathUtils.randFloat(-50, 50);
  var currentVector = new THREE.Vector3(x,y,z);
  
  if(origin.distanceTo(currentVector) > (earthRadius + 2)){
    if(currentVector.x > 0){
      currentVector.x -= origin.distanceTo(currentVector) - (earthRadius + 2)
    }else{
      currentVector.x += origin.distanceTo(currentVector) - (earthRadius + 2)
    }
  }

  star.name = "COMSAT ID: " + (THREE.MathUtils.randInt(0,2000).toString());
  star.position.set(currentVector.x,currentVector.y,currentVector.z);
  mmi.addHandler(star.name, "click", function(mesh){
    console.log(star.name);
    selectedSat = star.name;
  })
  scene.add(star);
}
Array(10).fill().forEach(addStar);

const spaceTexture = new THREE.TextureLoader().load('8k_stars_milky_way.jpg');
scene.background = spaceTexture;

//Create a recursive animation loop, this is where the rendering happens
//Changes happen every single call, changing the parameters here will "animate" your code
function animate(){
  requestAnimationFrame(animate);

  mmi.update();

  //Update controls
  controls.update();

  if(selectedSat != ""){
    header.innerHTML = selectedSat;
  }

  planet.rotation.y += 0.001;



  // .render is draw
  renderer.render( scene, camera );
}
//Call the animation
animate();
