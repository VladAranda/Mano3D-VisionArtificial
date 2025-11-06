// === main.js ===
// Importar módulos desde CDN (solo funciona si el script en index.html tiene type="module")
import * as THREE from "https://unpkg.com/three@0.158.0/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.158.0/examples/jsm/loaders/GLTFLoader.js";

// === Configurar escena básica ===
const canvas = document.getElementById("output");
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(640, 480);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 640 / 480, 0.1, 1000);
camera.position.z = 4;

// === Luces ===
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 2, 3);
scene.add(light);

const ambient = new THREE.AmbientLight(0x404040, 2);
scene.add(ambient);

// === Cargar modelo 3D ===
const loader = new GLTFLoader();
let handModel = null;

loader.load(
  "./assets/models/rigged_hand.glb",
  (gltf) => {
    handModel = gltf.scene;
    handModel.scale.set(2, 2, 2);
    handModel.position.set(0, -1, 0);
    scene.add(handModel);
  },
  undefined,
  (error) => console.error("❌ Error cargando modelo:", error)
);

// === Animación ===
function animate() {
  requestAnimationFrame(animate);
  if (handModel) {
    handModel.rotation.y += 0.01;
    handModel.rotation.x = Math.sin(Date.now() * 0.001) * 0.2;
  }
  renderer.render(scene, camera);
}
animate();

// === Cámara en vivo (opcional) ===
const video = document.getElementById("webcam");
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
      video.play();
    })
    .catch((err) => console.warn("⚠️ No se pudo acceder a la cámara:", err));
}
