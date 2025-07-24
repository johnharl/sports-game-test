import * as THREE from 'three';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcccccc); // Lighter background
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2); // Even brighter light
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 10, 5);
scene.add(directionalLight);

// Rink Dimensions
const rinkWidth = 30;
const rinkHeight = 15;
const boardHeight = 1;

// Loading Manager
const loadingManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadingManager);

loadingManager.onLoad = () => {
    console.log("All assets loaded, starting animation.");
    animate(); // Start the animation loop only after loading is complete
};

loadingManager.onError = (url) => {
    console.error(`There was an error loading ${url}`);
    // As a fallback, create a simple blue rink if the texture fails
    const rinkMaterial = new THREE.MeshStandardMaterial({ color: 0xd1e7ff });
    rink.material = rinkMaterial;
    animate();
};

// Ice Rink (Ground Plane)
const rinkTexture = textureLoader.load(
    'https://i.imgur.com/52y3b5v.png', // New, hopefully more reliable texture
);
const rinkGeometry = new THREE.PlaneGeometry(rinkWidth, rinkHeight);
// Start with a basic material, the texture will be applied once loaded
const rinkMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff }); 
const rink = new THREE.Mesh(rinkGeometry, rinkMaterial);
rink.rotation.x = -Math.PI / 2;
scene.add(rink);

// Apply texture to the material once it's loaded
rinkTexture.wrapS = THREE.RepeatWrapping;
rinkTexture.wrapT = THREE.RepeatWrapping;
rinkMaterial.map = rinkTexture;
rinkMaterial.needsUpdate = true;


// Sideboards
const boardMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const board1Geo = new THREE.BoxGeometry(rinkWidth, boardHeight, 0.2);
const board1 = new THREE.Mesh(board1Geo, boardMaterial);
board1.position.set(0, boardHeight / 2, -rinkHeight / 2);
scene.add(board1);
const board2 = new THREE.Mesh(board1Geo, boardMaterial);
board2.position.set(0, boardHeight / 2, rinkHeight / 2);
scene.add(board2);
const board3Geo = new THREE.BoxGeometry(0.2, boardHeight, rinkHeight);
const board3 = new THREE.Mesh(board3Geo, boardMaterial);
board3.position.set(-rinkWidth / 2, boardHeight / 2, 0);
scene.add(board3);
const board4 = new THREE.Mesh(board3Geo, boardMaterial);
board4.position.set(rinkWidth / 2, boardHeight / 2, 0);
scene.add(board4);

// Puck
const puckGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
const puckMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
const puck = new THREE.Mesh(puckGeometry, puckMaterial);
puck.position.y = 0.1;
scene.add(puck);

// Camera Position (Overhead)
camera.position.set(0, 18, 0);
camera.lookAt(scene.position);

// Game Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// We don't call animate() here anymore, the LoadingManager does.

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
