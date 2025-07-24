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

// Create programmatic hockey rink texture
function createRinkTexture() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // High resolution canvas for crisp lines
    const canvasWidth = 1024;
    const canvasHeight = 512;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Scale factors to map rink dimensions to canvas
    const scaleX = canvasWidth / rinkWidth;
    const scaleY = canvasHeight / rinkHeight;
    
    // Fill with ice color (light blue-white)
    ctx.fillStyle = '#f0f8ff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Set line properties
    ctx.strokeStyle = '#ff0000'; // Red for center line
    ctx.lineWidth = 3;
    
    // Center red line
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2, 0);
    ctx.lineTo(canvasWidth / 2, canvasHeight);
    ctx.stroke();
    
    // Blue lines (1/3 from each end)
    ctx.strokeStyle = '#0000ff';
    ctx.lineWidth = 2;
    
    // Left blue line
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 3, 0);
    ctx.lineTo(canvasWidth / 3, canvasHeight);
    ctx.stroke();
    
    // Right blue line
    ctx.beginPath();
    ctx.moveTo((2 * canvasWidth) / 3, 0);
    ctx.lineTo((2 * canvasWidth) / 3, canvasHeight);
    ctx.stroke();
    
    // Goal lines (near each end)
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    
    // Left goal line
    const goalLineOffset = canvasWidth * 0.1;
    ctx.beginPath();
    ctx.moveTo(goalLineOffset, 0);
    ctx.lineTo(goalLineOffset, canvasHeight);
    ctx.stroke();
    
    // Right goal line
    ctx.beginPath();
    ctx.moveTo(canvasWidth - goalLineOffset, 0);
    ctx.lineTo(canvasWidth - goalLineOffset, canvasHeight);
    ctx.stroke();
    
    // Center ice circle
    ctx.strokeStyle = '#0000ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(canvasWidth / 2, canvasHeight / 2, 60, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Center face-off dot
    ctx.fillStyle = '#0000ff';
    ctx.beginPath();
    ctx.arc(canvasWidth / 2, canvasHeight / 2, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // Face-off circles in each zone
    const faceOffRadius = 40;
    const faceOffY1 = canvasHeight * 0.25;
    const faceOffY2 = canvasHeight * 0.75;
    
    // Left zone face-off circles
    ctx.strokeStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(canvasWidth / 6, faceOffY1, faceOffRadius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(canvasWidth / 6, faceOffY2, faceOffRadius, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Right zone face-off circles
    ctx.beginPath();
    ctx.arc((5 * canvasWidth) / 6, faceOffY1, faceOffRadius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc((5 * canvasWidth) / 6, faceOffY2, faceOffRadius, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Face-off dots
    ctx.fillStyle = '#ff0000';
    const dotRadius = 6;
    ctx.beginPath();
    ctx.arc(canvasWidth / 6, faceOffY1, dotRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(canvasWidth / 6, faceOffY2, dotRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc((5 * canvasWidth) / 6, faceOffY1, dotRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc((5 * canvasWidth) / 6, faceOffY2, dotRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Goal creases (simplified semi-circles)
    ctx.strokeStyle = '#0000ff';
    ctx.lineWidth = 2;
    
    // Left goal crease
    ctx.beginPath();
    ctx.arc(goalLineOffset, canvasHeight / 2, 25, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    
    // Right goal crease
    ctx.beginPath();
    ctx.arc(canvasWidth - goalLineOffset, canvasHeight / 2, 25, Math.PI / 2, 3 * Math.PI / 2);
    ctx.stroke();
    
    return new THREE.CanvasTexture(canvas);
}

// Ice Rink (Ground Plane)
const rinkGeometry = new THREE.PlaneGeometry(rinkWidth, rinkHeight);
const rinkTexture = createRinkTexture();
const rinkMaterial = new THREE.MeshStandardMaterial({ 
    map: rinkTexture,
    transparent: false
});
const rink = new THREE.Mesh(rinkGeometry, rinkMaterial);
rink.rotation.x = -Math.PI / 2;
scene.add(rink);


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

// Goals
const goalWidth = 4;
const goalHeight = 1.33; // NHL regulation height
const goalDepth = 1.5;
const goalPostRadius = 0.08;

// Goal posts material
const goalPostMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xff0000,
    metalness: 0.8,
    roughness: 0.2
});

// Function to create a simple but effective goal net
function createGoalNet() {
    const netGroup = new THREE.Group();
    
    // Simple mesh net using planes
    const netMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        wireframe: true
    });
    
    // Back net
    const backNetGeometry = new THREE.PlaneGeometry(goalWidth, goalHeight, 10, 8);
    const backNet = new THREE.Mesh(backNetGeometry, netMaterial);
    backNet.position.set(0, goalHeight/2, -goalDepth * 0.6);
    netGroup.add(backNet);
    
    // Side nets
    const sideNetGeometry = new THREE.PlaneGeometry(goalDepth * 0.6, goalHeight, 6, 8);
    
    const leftSideNet = new THREE.Mesh(sideNetGeometry, netMaterial);
    leftSideNet.position.set(-goalWidth/2, goalHeight/2, -goalDepth * 0.3);
    leftSideNet.rotation.y = Math.PI / 2;
    netGroup.add(leftSideNet);
    
    const rightSideNet = new THREE.Mesh(sideNetGeometry, netMaterial);
    rightSideNet.position.set(goalWidth/2, goalHeight/2, -goalDepth * 0.3);
    rightSideNet.rotation.y = Math.PI / 2;
    netGroup.add(rightSideNet);
    
    // Top net
    const topNetGeometry = new THREE.PlaneGeometry(goalWidth, goalDepth * 0.6, 10, 6);
    const topNet = new THREE.Mesh(topNetGeometry, netMaterial);
    topNet.position.set(0, goalHeight, -goalDepth * 0.3);
    topNet.rotation.x = Math.PI / 2;
    netGroup.add(topNet);
    
    return netGroup;
}

// Left Goal (Blue team defends)
const leftGoalGroup = new THREE.Group();

// Left goal posts
const goalPostGeometry = new THREE.CylinderGeometry(goalPostRadius, goalPostRadius, goalHeight, 16);
const leftGoalPost1 = new THREE.Mesh(goalPostGeometry, goalPostMaterial);
leftGoalPost1.position.set(0, goalHeight/2, -goalWidth/2);
leftGoalGroup.add(leftGoalPost1);

const leftGoalPost2 = new THREE.Mesh(goalPostGeometry, goalPostMaterial);
leftGoalPost2.position.set(0, goalHeight/2, goalWidth/2);
leftGoalGroup.add(leftGoalPost2);

// Left goal crossbar
const crossbarGeometry = new THREE.CylinderGeometry(goalPostRadius, goalPostRadius, goalWidth + goalPostRadius*2, 16);
const leftCrossbar = new THREE.Mesh(crossbarGeometry, goalPostMaterial);
leftCrossbar.position.set(0, goalHeight, 0);
leftCrossbar.rotation.x = Math.PI / 2;
leftGoalGroup.add(leftCrossbar);

// Add corner joints for realism
const jointGeometry = new THREE.SphereGeometry(goalPostRadius * 1.2, 8, 8);
const joint1 = new THREE.Mesh(jointGeometry, goalPostMaterial);
joint1.position.set(0, goalHeight, -goalWidth/2);
leftGoalGroup.add(joint1);

const joint2 = new THREE.Mesh(jointGeometry, goalPostMaterial);
joint2.position.set(0, goalHeight, goalWidth/2);
leftGoalGroup.add(joint2);

// Left goal net
const leftNet = createGoalNet();
leftNet.rotation.y = Math.PI / 2; // Rotate to face right
leftGoalGroup.add(leftNet);

// Position the entire left goal at the left end
leftGoalGroup.position.set(-rinkWidth/2 + 0.1, 0, 0);
scene.add(leftGoalGroup);

// Right Goal (Red team defends)
const rightGoalGroup = new THREE.Group();

// Right goal posts
const rightGoalPost1 = new THREE.Mesh(goalPostGeometry, goalPostMaterial);
rightGoalPost1.position.set(0, goalHeight/2, -goalWidth/2);
rightGoalGroup.add(rightGoalPost1);

const rightGoalPost2 = new THREE.Mesh(goalPostGeometry, goalPostMaterial);
rightGoalPost2.position.set(0, goalHeight/2, goalWidth/2);
rightGoalGroup.add(rightGoalPost2);

// Right goal crossbar
const rightCrossbar = new THREE.Mesh(crossbarGeometry, goalPostMaterial);
rightCrossbar.position.set(0, goalHeight, 0);
rightCrossbar.rotation.x = Math.PI / 2;
rightGoalGroup.add(rightCrossbar);

// Add corner joints
const joint3 = new THREE.Mesh(jointGeometry, goalPostMaterial);
joint3.position.set(0, goalHeight, -goalWidth/2);
rightGoalGroup.add(joint3);

const joint4 = new THREE.Mesh(jointGeometry, goalPostMaterial);
joint4.position.set(0, goalHeight, goalWidth/2);
rightGoalGroup.add(joint4);

// Right goal net
const rightNet = createGoalNet();
rightNet.rotation.y = -Math.PI / 2; // Rotate to face left
rightGoalGroup.add(rightNet);

// Position the entire right goal at the right end
rightGoalGroup.position.set(rinkWidth/2 - 0.1, 0, 0);
scene.add(rightGoalGroup);

// Puck
const puckGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
const puckMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
const puck = new THREE.Mesh(puckGeometry, puckMaterial);
puck.position.y = 0.1;
scene.add(puck);

// Puck Physics
const puckVelocity = { x: 0, z: 0 };
const friction = 0.98;
const bounceReduction = 0.8;

// Game State
let player1Score = 0;
let player2Score = 0;
let gameStartTime = Date.now();
let gamePaused = false;
let isSinglePlayer = false; // Default to two-player mode

// Sound System
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Create sound effects using Web Audio API
function createHitSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 200;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function createGoalSound() {
    // Create a more complex goal horn sound
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator1.frequency.value = 220;
    oscillator2.frequency.value = 330;
    oscillator1.type = 'sawtooth';
    oscillator2.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
    
    oscillator1.start(audioContext.currentTime);
    oscillator2.start(audioContext.currentTime);
    oscillator1.stop(audioContext.currentTime + 0.8);
    oscillator2.stop(audioContext.currentTime + 0.8);
}

function createWallBounceSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 150;
    oscillator.type = 'triangle';
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
}

// UI Elements
const player1ScoreElement = document.getElementById('player1-score');
const player2ScoreElement = document.getElementById('player2-score');
const timerElement = document.getElementById('timer');
const gameModeElement = document.getElementById('game-mode');

// Player Paddles
const paddleGeometry = new THREE.CylinderGeometry(1, 1, 0.3, 32);

// Player 1 Paddle (Blue Team - Left Side)
const paddle1Material = new THREE.MeshStandardMaterial({ color: 0x0066cc });
const paddle1 = new THREE.Mesh(paddleGeometry, paddle1Material);
paddle1.position.set(-10, 0.15, 0);
scene.add(paddle1);

// Player 2 Paddle (Red Team - Right Side)
const paddle2Material = new THREE.MeshStandardMaterial({ color: 0xcc0000 });
const paddle2 = new THREE.Mesh(paddleGeometry, paddle2Material);
paddle2.position.set(10, 0.15, 0);
scene.add(paddle2);

// Particle System for Ice Spray
const particleCount = 100;
const particles = [];
const particleGeometry = new THREE.SphereGeometry(0.05, 4, 4);
const particleMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffffff,
    transparent: true,
    opacity: 0.6
});

// Create particle pool
for (let i = 0; i < particleCount; i++) {
    const particle = new THREE.Mesh(particleGeometry, particleMaterial);
    particle.visible = false;
    scene.add(particle);
    particles.push({
        mesh: particle,
        velocity: new THREE.Vector3(),
        life: 0
    });
}

// Track previous paddle positions for ice spray effect
let paddle1PrevPos = paddle1.position.clone();
let paddle2PrevPos = paddle2.position.clone();

// Function to emit ice spray particles
function emitIceSpray(position, direction, speed) {
    if (speed < 0.15) return; // Only emit if moving fast enough
    
    const particlesToEmit = Math.min(5, Math.floor(speed * 10));
    
    for (let i = 0; i < particlesToEmit; i++) {
        const particle = particles.find(p => p.life <= 0);
        if (particle) {
            particle.mesh.position.copy(position);
            particle.mesh.position.y = 0.05;
            particle.mesh.visible = true;
            
            // Random spray direction
            const angle = Math.random() * Math.PI * 2;
            particle.velocity.set(
                -direction.x * 0.1 + Math.cos(angle) * 0.05,
                Math.random() * 0.1,
                -direction.z * 0.1 + Math.sin(angle) * 0.05
            );
            
            particle.life = 0.5; // Particle lifetime in seconds
        }
    }
}

// Update particles
function updateParticles(deltaTime) {
    particles.forEach(particle => {
        if (particle.life > 0) {
            particle.life -= deltaTime;
            particle.mesh.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
            particle.velocity.y -= 0.5 * deltaTime; // Gravity
            particle.mesh.material.opacity = particle.life * 1.2;
            
            if (particle.life <= 0) {
                particle.mesh.visible = false;
            }
        }
    });
}

// Camera Position (Overhead)
camera.position.set(0, 18, 0);
camera.lookAt(scene.position);

// Player Controls
const keys = {};
const paddleSpeed = 0.3;

// Track key states
document.addEventListener('keydown', (event) => {
    keys[event.code] = true;
    
    // Reset puck position with spacebar
    if (event.code === 'Space') {
        resetPuck();
        event.preventDefault();
    }
    
    // Switch game modes
    if (event.code === 'Digit1') {
        isSinglePlayer = true;
        gameModeElement.textContent = 'Single Player (vs AI)';
        console.log('Switched to Single Player mode');
    }
    if (event.code === 'Digit2') {
        isSinglePlayer = false;
        gameModeElement.textContent = 'Two Player';
        console.log('Switched to Two Player mode');
    }
});

document.addEventListener('keyup', (event) => {
    keys[event.code] = false;
});

// AI opponent logic
function updateAI() {
    // AI controls the red paddle (paddle2)
    const aiSpeed = paddleSpeed * 0.85; // Slightly slower than human player
    const puckPosition = puck.position;
    const paddlePosition = paddle2.position;
    
    // AI strategy based on puck position
    if (puckPosition.x > 0) {
        // Puck is on AI's side - defend
        const targetZ = puckPosition.z;
        const targetX = Math.max(puckPosition.x - 2, rinkWidth/2 - 4);
        
        // Move towards defensive position
        if (paddlePosition.z < targetZ - 0.5 && paddlePosition.z < rinkHeight/2 - 1) {
            paddle2.position.z += aiSpeed;
        } else if (paddlePosition.z > targetZ + 0.5 && paddlePosition.z > -rinkHeight/2 + 1) {
            paddle2.position.z -= aiSpeed;
        }
        
        if (paddlePosition.x < targetX - 0.5 && paddlePosition.x < rinkWidth/2 - 1) {
            paddle2.position.x += aiSpeed;
        } else if (paddlePosition.x > targetX + 0.5 && paddlePosition.x > -rinkWidth/2 + 1) {
            paddle2.position.x -= aiSpeed;
        }
    } else {
        // Puck is on opponent's side - move to center position
        const centerX = 10;
        const centerZ = 0;
        
        if (paddlePosition.z < centerZ - 0.5 && paddlePosition.z < rinkHeight/2 - 1) {
            paddle2.position.z += aiSpeed * 0.5;
        } else if (paddlePosition.z > centerZ + 0.5 && paddlePosition.z > -rinkHeight/2 + 1) {
            paddle2.position.z -= aiSpeed * 0.5;
        }
        
        if (paddlePosition.x < centerX - 0.5 && paddlePosition.x < rinkWidth/2 - 1) {
            paddle2.position.x += aiSpeed * 0.5;
        } else if (paddlePosition.x > centerX + 0.5 && paddlePosition.x > 10) {
            paddle2.position.x -= aiSpeed * 0.5;
        }
    }
}

// Update paddle positions based on input
function updatePaddles() {
    // Player 1 Controls (Arrow Keys) - Blue Paddle
    if (keys['ArrowUp'] && paddle1.position.z > -rinkHeight/2 + 1) {
        paddle1.position.z -= paddleSpeed;
    }
    if (keys['ArrowDown'] && paddle1.position.z < rinkHeight/2 - 1) {
        paddle1.position.z += paddleSpeed;
    }
    if (keys['ArrowLeft'] && paddle1.position.x > -rinkWidth/2 + 1) {
        paddle1.position.x -= paddleSpeed;
    }
    if (keys['ArrowRight'] && paddle1.position.x < rinkWidth/2 - 1) {
        paddle1.position.x += paddleSpeed;
    }
    
    // Player 2 Controls - either human (WASD) or AI
    if (isSinglePlayer) {
        updateAI();
    } else {
        // Human Player 2 Controls (WASD) - Red Paddle
        if (keys['KeyW'] && paddle2.position.z > -rinkHeight/2 + 1) {
            paddle2.position.z -= paddleSpeed;
        }
        if (keys['KeyS'] && paddle2.position.z < rinkHeight/2 - 1) {
            paddle2.position.z += paddleSpeed;
        }
        if (keys['KeyA'] && paddle2.position.x > -rinkWidth/2 + 1) {
            paddle2.position.x -= paddleSpeed;
        }
        if (keys['KeyD'] && paddle2.position.x < rinkWidth/2 - 1) {
            paddle2.position.x += paddleSpeed;
        }
    }
}

// Reset puck to center
function resetPuck() {
    puck.position.set(0, 0.1, 0);
    puckVelocity.x = 0;
    puckVelocity.z = 0;
}

// Update UI elements
function updateUI() {
    player1ScoreElement.textContent = player1Score;
    player2ScoreElement.textContent = player2Score;
    
    // Update timer
    if (!gamePaused) {
        const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Check if puck is in goal
function checkGoal() {
    const puckX = puck.position.x;
    const puckZ = puck.position.z;
    
    // Check left goal (Player 2 scores)
    if (puckX < -rinkWidth/2 + 0.5 && 
        puckZ > -goalWidth/2 && 
        puckZ < goalWidth/2) {
        player2Score++;
        console.log(`Player 2 scores! Score: Player 1: ${player1Score}, Player 2: ${player2Score}`);
        createGoalSound(); // Play goal sound
        updateUI();
        resetPuck();
        return true;
    }
    
    // Check right goal (Player 1 scores)
    if (puckX > rinkWidth/2 - 0.5 && 
        puckZ > -goalWidth/2 && 
        puckZ < goalWidth/2) {
        player1Score++;
        console.log(`Player 1 scores! Score: Player 1: ${player1Score}, Player 2: ${player2Score}`);
        createGoalSound(); // Play goal sound
        updateUI();
        resetPuck();
        return true;
    }
    
    return false;
}

// Puck Physics Update
function updatePuck() {
    // Check for goals first
    if (checkGoal()) {
        return; // Exit early if goal was scored
    }
    
    // Apply velocity to position
    puck.position.x += puckVelocity.x;
    puck.position.z += puckVelocity.z;
    
    // Apply friction
    puckVelocity.x *= friction;
    puckVelocity.z *= friction;
    
    // Stop very slow movement
    if (Math.abs(puckVelocity.x) < 0.01) puckVelocity.x = 0;
    if (Math.abs(puckVelocity.z) < 0.01) puckVelocity.z = 0;
    
    // Wall bouncing
    const puckRadius = 0.5;
    const wallBuffer = 0.2; // Extra buffer for the sideboards
    let hitWall = false;
    
    // Left and right walls (with goal openings)
    if (puck.position.x <= -rinkWidth/2 + puckRadius + wallBuffer) {
        // Check if puck is in goal area
        if (puck.position.z < -goalWidth/2 || puck.position.z > goalWidth/2) {
            puck.position.x = -rinkWidth/2 + puckRadius + wallBuffer;
            puckVelocity.x = Math.abs(puckVelocity.x) * bounceReduction;
            hitWall = true;
        }
    }
    if (puck.position.x >= rinkWidth/2 - puckRadius - wallBuffer) {
        // Check if puck is in goal area
        if (puck.position.z < -goalWidth/2 || puck.position.z > goalWidth/2) {
            puck.position.x = rinkWidth/2 - puckRadius - wallBuffer;
            puckVelocity.x = -Math.abs(puckVelocity.x) * bounceReduction;
            hitWall = true;
        }
    }
    
    // Top and bottom walls
    if (puck.position.z <= -rinkHeight/2 + puckRadius + wallBuffer) {
        puck.position.z = -rinkHeight/2 + puckRadius + wallBuffer;
        puckVelocity.z = Math.abs(puckVelocity.z) * bounceReduction;
        hitWall = true;
    }
    if (puck.position.z >= rinkHeight/2 - puckRadius - wallBuffer) {
        puck.position.z = rinkHeight/2 - puckRadius - wallBuffer;
        puckVelocity.z = -Math.abs(puckVelocity.z) * bounceReduction;
        hitWall = true;
    }
    
    // Play wall bounce sound if hit
    if (hitWall && (Math.abs(puckVelocity.x) > 0.1 || Math.abs(puckVelocity.z) > 0.1)) {
        createWallBounceSound();
    }
    
    // Basic paddle-puck collision detection
    checkPaddleCollision(paddle1);
    checkPaddleCollision(paddle2);
}

// Check collision between puck and paddle
function checkPaddleCollision(paddle) {
    const distance = puck.position.distanceTo(paddle.position);
    const collisionDistance = 1.5; // Combined radius of puck and paddle
    
    if (distance < collisionDistance) {
        // Calculate collision direction
        const direction = new THREE.Vector3();
        direction.subVectors(puck.position, paddle.position).normalize();
        
        // Add some velocity to the puck based on collision
        const hitStrength = 0.4;
        puckVelocity.x += direction.x * hitStrength;
        puckVelocity.z += direction.z * hitStrength;
        
        // Separate puck from paddle to prevent sticking
        puck.position.copy(paddle.position).add(direction.multiplyScalar(collisionDistance));
        
        // Play hit sound
        createHitSound();
    }
}

// Track time for particle updates
let lastTime = Date.now();

// Game Loop
function animate() {
    requestAnimationFrame(animate);
    
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
    lastTime = currentTime;
    
    updatePaddles();
    updatePuck();
    updateUI();
    
    // Check for ice spray from paddle movement
    const paddle1Movement = paddle1.position.clone().sub(paddle1PrevPos);
    const paddle1Speed = paddle1Movement.length();
    if (paddle1Speed > 0.01) {
        emitIceSpray(paddle1.position, paddle1Movement.normalize(), paddle1Speed);
    }
    paddle1PrevPos = paddle1.position.clone();
    
    const paddle2Movement = paddle2.position.clone().sub(paddle2PrevPos);
    const paddle2Speed = paddle2Movement.length();
    if (paddle2Speed > 0.01) {
        emitIceSpray(paddle2.position, paddle2Movement.normalize(), paddle2Speed);
    }
    paddle2PrevPos = paddle2.position.clone();
    
    // Update particle system
    updateParticles(deltaTime);
    
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
