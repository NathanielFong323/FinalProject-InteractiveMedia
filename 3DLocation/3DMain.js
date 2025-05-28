//3D model Web by https://www.youtube.com/watch?v=lGokKxJ8D2c
//Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// To allow for importing the .gltf file
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

//Create a Three.JS Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

//create a new camera with positions and angles
const camera = new THREE.PerspectiveCamera(75, 600 / 400, 0.1, 70);
camera.position.set(-3,7,5);
camera.lookAt(new THREE.Vector3(0,0,0));

//list of available models
const models = ['Plush', 'Plant', 'Bag', 'Slippers', 'Cup'];
let currentModelIndex = 0;
let wireframeMode = false;
let lowQualityMode = false;
let object = null;
let controls = null;


const loader = new GLTFLoader();

function updateStatusBar(modelName, polyCount) {
  document.getElementById('currentModel').textContent = modelName;
  document.getElementById('polyCount').textContent = polyCount;
}

//Wireframe and Solid color from https://stackoverflow.com/questions/31539130/display-wireframe-and-solid-color
function applyRetroMaterial(mesh) {
  if (wireframeMode) {
    mesh.material = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
  } else if (lowQualityMode) {
    mesh.material = new THREE.MeshPhongMaterial({
      color: 0xcccccc,
      specular: 0x111111,
      shininess: 30,
      flatShading: true,
      side: THREE.DoubleSide
    });
  } else {
    if (mesh.userData.originalMaterial) {
      mesh.material = mesh.userData.originalMaterial;
    }
  }
}

function countPolygons(object) {
  let count = 0;
  object.traverse(function(child) {
    if (child.isMesh) {
      count += child.geometry.attributes.position.count / 3;
    }
  });
  return count;
}

function loadModel(modelName) {
  if (object) {
    scene.remove(object);
  }
  if (controls) {
    controls.dispose();
    controls = null;
  }
  updateStatusBar(modelName, "Loading...");
  
  //Load the file
  loader.load(
    `Model/${modelName}/scene.gltf`,
    function (gltf) {
      object = gltf.scene;

      object.traverse(function(child) {
        if (child.isMesh) {
          applyRetroMaterial(child);
        }
      });
      
      scene.add(object);

      camera.position.z = modelName === "Plush" ? 10 : 15;
      
      controls = new OrbitControls(camera, renderer.domElement);
      controls.update();
      
      const polyCount = Math.floor(countPolygons(object));
      updateStatusBar(modelName, polyCount);
    },
    function (xhr) {
      const percentLoaded = Math.round(xhr.loaded / xhr.total * 100);
      updateStatusBar(modelName, `Loading ${percentLoaded}%`);
    },
  );
}

const renderer = new THREE.WebGLRenderer({ 
});
renderer.setSize(675, 450);
renderer.setPixelRatio(1);

document.getElementById("container3D").appendChild(renderer.domElement);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x404040, 5);
scene.add(ambientLight);

//grid helper from https://threejs.org/docs/#api/en/helpers/GridHelper
const gridHelper = new THREE.GridHelper(10, 10, 0x808080, 0x808080);
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

loadModel(models[currentModelIndex]);

document.getElementById('cycleModel').addEventListener('click', () => {
  currentModelIndex = (currentModelIndex + 1) % models.length;
  loadModel(models[currentModelIndex]);
  wireframeMode = false;
  lowQualityMode = false;
  scene.remove(ambientLight);
  scene.add(ambientLight);
});


document.getElementById('wireframeBtn').addEventListener('click', () => {
  wireframeMode = !wireframeMode;
  
  if (wireframeMode) {
    lowQualityMode = false;
    document.getElementById('lowResBtn').textContent = "Low Quality";
  }
  
  if (object) {
    object.traverse(function(child) {
      if (child.isMesh) {
        if (!child.userData.originalMaterial) {
          child.userData.originalMaterial = child.material;
        }
        applyRetroMaterial(child);
      }
    });
  }
});


document.getElementById('lowResBtn').addEventListener('click', () => {
  lowQualityMode = !lowQualityMode;
  
  if (lowQualityMode) {
    wireframeMode = false;
    document.getElementById('wireframeBtn').textContent = "Wireframe";
    scene.remove(ambientLight);
  }
  else {
    scene.add(ambientLight);
  }

  if (object) {
    object.traverse(function(child) {
      if (child.isMesh) {
        if (!child.userData.originalMaterial) {
          child.userData.originalMaterial = child.material;
        }
        applyRetroMaterial(child);
      }
    });
  }
});

function animate() {
  requestAnimationFrame(animate);
  
  if (object && !controls.enabled) {
    object.rotation.y += 0.005;
  }
  
  if (controls) {
    controls.update();
  }
  
  renderer.render(scene, camera);
}

animate();