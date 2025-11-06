// === Importaciones desde CDN ===
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js";
import {
  Hands,
  HAND_CONNECTIONS,
  drawConnectors,
  drawLandmarks,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js";
import { Camera } from "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";
import * as drawingUtils from "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js";

// === Escena básica de Three.js ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);

// === Luz ===
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// === Controles orbitales ===
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// === Cargar modelo de la mano ===
let handModel;
const loader = new GLTFLoader();
loader.load(
  "./assets/models/rigged_hand.glb",
  (gltf) => {
    handModel = gltf.scene;
    handModel.scale.set(2, 2, 2);
    scene.add(handModel);
    console.log("✅ Modelo 3D cargado");
  },
  undefined,
  (error) => console.error("❌ Error al cargar el modelo:", error)
);

// === Posición inicial de cámara ===
camera.position.set(0, 0, 5);

// === Canvas para la cámara ===
const videoElement = document.createElement("video");
videoElement.style.position = "absolute";
videoElement.style.bottom = "10px";
videoElement.style.right = "10px";
videoElement.style.width = "240px";
videoElement.style.border = "2px solid #fff";
videoElement.autoplay = true;
videoElement.muted = true;
videoElement.playsInline = true;
document.body.appendChild(videoElement);

// === Configurar MediaPipe Hands ===
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7,
});

hands.onResults(onResults);

const cameraFeed = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 640,
  height: 480,
});
cameraFeed.start();

// === Procesar resultados de MediaPipe ===
function onResults(results) {
  if (!results.multiHandLandmarks || !handModel) return;

  const landmarks = results.multiHandLandmarks[0];

  // Ejemplo: mover la mano 3D según la posición de la muñeca
  const wrist = landmarks[0];
  handModel.position.set(
    (wrist.x - 0.5) * 4,
    -(wrist.y - 0.5) * 3,
    -wrist.z * 2
  );

  // Ejemplo: rotar ligeramente según dedos
  const indexTip = landmarks[8];
  const thumbTip = landmarks[4];
  const dx = indexTip.x - thumbTip.x;
  const dy = indexTip.y - thumbTip.y;
  handModel.rotation.x = dy * 3;
  handModel.rotation.y = -dx * 3;
}

// === Animación ===
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// === Adaptar ventana ===
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
