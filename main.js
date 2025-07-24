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

// Since we're not loading external assets anymore, we can start the animation immediately

// Ice Rink (Ground Plane)
const rinkGeometry = new THREE.PlaneGeometry(rinkWidth, rinkHeight);
const rinkMaterial = new THREE.MeshStandardMaterial({ color: 0xf0f8ff }); // Light ice blue
const rink = new THREE.Mesh(rinkGeometry, rinkMaterial);
rink.rotation.x = -Math.PI / 2;
scene.add(rink);

// Create rink markings programmatically
const redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red
const blueMaterial = new THREE.MeshBasicMaterial({ color: 0x0066cc }); // Blue

// Center ice circle (blue)
const centerCircleGeometry = new THREE.RingGeometry(2.5, 2.6, 64);
const centerCircle = new THREE.Mesh(centerCircleGeometry, blueMaterial);
centerCircle.rotation.x = -Math.PI / 2;
centerCircle.position.y = 0.001;
scene.add(centerCircle);

// Center line (red)
const centerLineGeometry = new THREE.PlaneGeometry(0.12, rinkHeight);
const centerLine = new THREE.Mesh(centerLineGeometry, redMaterial);
centerLine.rotation.x = -Math.PI / 2;
centerLine.position.y = 0.001;
scene.add(centerLine);

// Blue lines
const blueLineGeometry = new THREE.PlaneGeometry(0.3, rinkHeight);
const blueLine1 = new THREE.Mesh(blueLineGeometry, blueMaterial);
blueLine1.rotation.x = -Math.PI / 2;
blueLine1.position.set(-8.5, 0.001, 0);
scene.add(blueLine1);

const blueLine2 = new THREE.Mesh(blueLineGeometry, blueMaterial);
blueLine2.rotation.x = -Math.PI / 2;
blueLine2.position.set(8.5, 0.001, 0);
scene.add(blueLine2);

// Goal lines (red)
const goalLineGeometry = new THREE.PlaneGeometry(0.05, rinkHeight);
const goalLine1 = new THREE.Mesh(goalLineGeometry, redMaterial);
goalLine1.rotation.x = -Math.PI / 2;
goalLine1.position.set(-13, 0.001, 0);
scene.add(goalLine1);

const goalLine2 = new THREE.Mesh(goalLineGeometry, redMaterial);
goalLine2.rotation.x = -Math.PI / 2;
goalLine2.position.set(13, 0.001, 0);
scene.add(goalLine2);

// End zone face-off circles (red)
const endCircleGeometry = new THREE.RingGeometry(2.5, 2.6, 64);
const endCirclePositions = [
    { x: -10.5, z: 3.5 }, { x: -10.5, z: -3.5 },
    { x: 10.5, z: 3.5 }, { x: 10.5, z: -3.5 }
];

endCirclePositions.forEach(pos => {
    const circle = new THREE.Mesh(endCircleGeometry, redMaterial);
    circle.rotation.x = -Math.PI / 2;
    circle.position.set(pos.x, 0.001, pos.z);
    scene.add(circle);
});

// Face-off dots
const dotGeometry = new THREE.CircleGeometry(0.3, 32);
const dotPositions = [
    // Center ice
    { x: 0, z: 0 },
    // End zones (center of circles)
    { x: -10.5, z: 3.5 }, { x: -10.5, z: -3.5 },
    { x: 10.5, z: 3.5 }, { x: 10.5, z: -3.5 },
    // Neutral zone dots
    { x: -5.5, z: 3.5 }, { x: -5.5, z: -3.5 },
    { x: 5.5, z: 3.5 }, { x: 5.5, z: -3.5 }
];

dotPositions.forEach(pos => {
    const dot = new THREE.Mesh(dotGeometry, redMaterial);
    dot.rotation.x = -Math.PI / 2;
    dot.position.set(pos.x, 0.001, pos.z);
    scene.add(dot);
});

// Goal creases (blue semicircles)
const creaseShape = new THREE.Shape();
creaseShape.absarc(0, 0, 1.5, 0, Math.PI, false);
creaseShape.lineTo(-1.5, 0);
const creaseGeometry = new THREE.ShapeGeometry(creaseShape);

const crease1 = new THREE.Mesh(creaseGeometry, blueMaterial);
crease1.rotation.x = -Math.PI / 2;
crease1.position.set(-13.5, 0.001, 0);
scene.add(crease1);

const crease2 = new THREE.Mesh(creaseGeometry, blueMaterial);
crease2.rotation.x = -Math.PI / 2;
crease2.rotation.z = Math.PI;
crease2.position.set(13.5, 0.001, 0);
scene.add(crease2);

// Hash marks on face-off circles
const hashMarkGeometry = new THREE.PlaneGeometry(0.05, 0.5);
const hashMarkAngles = [0, Math.PI/2, Math.PI, -Math.PI/2];

endCirclePositions.forEach(circlePos => {
    hashMarkAngles.forEach(angle => {
        const hashMark = new THREE.Mesh(hashMarkGeometry, redMaterial);
        hashMark.rotation.x = -Math.PI / 2;
        hashMark.position.set(
            circlePos.x + Math.cos(angle) * 2.55,
            0.001,
            circlePos.z + Math.sin(angle) * 2.55
        );
        hashMark.rotation.z = angle;
        scene.add(hashMark);
    });
});


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

// Player Paddles
const paddleGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.5, 32);
const player1Material = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Red team
const player2Material = new THREE.MeshStandardMaterial({ color: 0x0000ff }); // Blue team

const player1 = new THREE.Mesh(paddleGeometry, player1Material);
player1.position.set(-rinkWidth / 4, 0.25, 0);
scene.add(player1);

const player2 = new THREE.Mesh(paddleGeometry, player2Material);
player2.position.set(rinkWidth / 4, 0.25, 0);
scene.add(player2);

// Camera Position (Overhead)
camera.position.set(0, 18, 0);
camera.lookAt(scene.position);

// Keyboard input tracking
const keys = {};
document.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

// Player movement boundaries
const paddleSpeed = 0.2;
const boundaryX = rinkWidth / 2 - 1.5;
const boundaryZ = rinkHeight / 2 - 1.5;

// Game Loop
function animate() {
    requestAnimationFrame(animate);
    
    // Player 1 controls (Arrow keys)
    if (keys['arrowup'] && player1.position.z > -boundaryZ) {
        player1.position.z -= paddleSpeed;
    }
    if (keys['arrowdown'] && player1.position.z < boundaryZ) {
        player1.position.z += paddleSpeed;
    }
    if (keys['arrowleft'] && player1.position.x > -boundaryX) {
        player1.position.x -= paddleSpeed;
    }
    if (keys['arrowright'] && player1.position.x < -2) {
        player1.position.x += paddleSpeed;
    }
    
    // Player 2 controls (WASD)
    if (keys['w'] && player2.position.z > -boundaryZ) {
        player2.position.z -= paddleSpeed;
    }
    if (keys['s'] && player2.position.z < boundaryZ) {
        player2.position.z += paddleSpeed;
    }
    if (keys['a'] && player2.position.x > 2) {
        player2.position.x -= paddleSpeed;
    }
    if (keys['d'] && player2.position.x < boundaryX) {
        player2.position.x += paddleSpeed;
    }
    
    renderer.render(scene, camera);
}

// Start the animation loop
animate();

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
