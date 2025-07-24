import * as THREE from 'three';

// Game Configuration Constants (Code Review Improvement)
const GAME_CONFIG = {
    RINK_WIDTH: 30,
    RINK_HEIGHT: 15,
    BOARD_HEIGHT: 1,
    PADDLE_SPEED: 0.3,
    PUCK_FRICTION: 0.98,
    PUCK_BOUNCE_DAMPING: 0.7,
    GAME_DURATION: 180, // 3 minutes in seconds
    AI_DIFFICULTY: 0.8,
    PARTICLE_COUNT: 50,
    MAX_FPS: 144
};

// Global variables
let scene, camera, renderer;
let rink, puck, player1Paddle, player2Paddle;
let goalLeft, goalRight, netLeft, netRight;
let particles = [];
let keys = {};
let gameState = {
    score: { player1: 0, player2: 0 },
    timeLeft: GAME_CONFIG.GAME_DURATION,
    gameRunning: true,
    isAIMode: false
};

// Audio system
let audioContext = null;
let audioInitialized = false;
const sounds = {};

// Physics vectors (reused for performance)
const tempVector1 = new THREE.Vector3();
const tempVector2 = new THREE.Vector3();
const tempVector3 = new THREE.Vector3();

/**
 * Initialize audio context properly for modern browsers (Code Review Fix)
 * Handles suspended audio context state and provides fallbacks
 */
function initAudio() {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        audioInitialized = true;
        console.log('Audio initialized successfully');
    } catch (error) {
        console.warn('Audio initialization failed:', error);
        audioInitialized = false;
    }
}

/**
 * Create sound effect (with proper oscillator cleanup)
 * @param {number} frequency - Sound frequency in Hz
 * @param {number} duration - Sound duration in seconds
 * @param {string} type - Oscillator type ('sine', 'square', 'sawtooth', 'triangle')
 */
function createSound(frequency, duration = 0.1, type = 'sine') {
    if (!audioInitialized || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
        
        // Properly clean up oscillator (Code Review Fix)
        oscillator.onended = () => {
            oscillator.disconnect();
            gainNode.disconnect();
        };
    } catch (error) {   
        console.warn('Sound creation failed:', error);
    }
}

// Sound effects
const playHitSound = () => createSound(440, 0.1, 'square');
const playGoalSound = () => createSound(880, 0.5, 'sawtooth');
const playWallSound = () => createSound(220, 0.05, 'triangle');

// Initialize Three.js scene
function initScene() {
    try {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xcccccc);
        
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 18, 0);
        camera.lookAt(0, 0, 0);
        
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 10, 5);
        scene.add(directionalLight);
        
        console.log('Scene initialized successfully');
    } catch (error) {
        console.error('Scene initialization failed:', error);
        throw error;
    }
}

/**
 * Create NHL-style rink markings programmatically (Refactored from large function)
 * Generates a canvas texture with center line, blue lines, goal lines, and face-off circles
 * @returns {THREE.CanvasTexture} Generated rink texture
 */
function createRinkTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawRinkMarkings(ctx, canvas);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    
    return texture;
}

// Refactored rink markings drawing (Code Review Improvement)
function drawRinkMarkings(ctx, canvas) {
    ctx.strokeStyle = '#0000ff';
    ctx.lineWidth = 2;
    
    // Center line
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    
    // Blue lines (defensive zones)
    const blueLineOffset = canvas.width * 0.25;
    ctx.beginPath();
    ctx.moveTo(blueLineOffset, 0);
    ctx.lineTo(blueLineOffset, canvas.height);
    ctx.moveTo(canvas.width - blueLineOffset, 0);
    ctx.lineTo(canvas.width - blueLineOffset, canvas.height);
    ctx.stroke();
    
    // Goal lines
    const goalLineOffset = canvas.width * 0.1;
    ctx.strokeStyle = '#ff0000';
    ctx.beginPath();
    ctx.moveTo(goalLineOffset, 0);
    ctx.lineTo(goalLineOffset, canvas.height);
    ctx.moveTo(canvas.width - goalLineOffset, 0);
    ctx.lineTo(canvas.width - goalLineOffset, canvas.height);
    ctx.stroke();
    
    drawFaceOffCircles(ctx, canvas);
}

// Face-off circles helper function
function drawFaceOffCircles(ctx, canvas) {
    ctx.strokeStyle = '#0000ff';
    const centerY = canvas.height / 2;
    const centerX = canvas.width / 2;
    const radius = 20;
    
    // Center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Corner circles
    const cornerOffset = canvas.width * 0.2;
    ctx.beginPath();
    ctx.arc(cornerOffset, centerY, radius * 0.7, 0, 2 * Math.PI);
    ctx.arc(canvas.width - cornerOffset, centerY, radius * 0.7, 0, 2 * Math.PI);
    ctx.stroke();
}

// Create game objects
function createGameObjects() {
    // Rink
    const rinkTexture = createRinkTexture();
    const rinkGeometry = new THREE.PlaneGeometry(GAME_CONFIG.RINK_WIDTH, GAME_CONFIG.RINK_HEIGHT);
    const rinkMaterial = new THREE.MeshStandardMaterial({ map: rinkTexture });
    rink = new THREE.Mesh(rinkGeometry, rinkMaterial);
    rink.rotation.x = -Math.PI / 2;
    scene.add(rink);
    
    createSideboards();
    createPuck();
    createPaddles();
    createGoals();
    createParticleSystem();
}

// Create sideboards
function createSideboards() {
    const boardMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    
    // Top and bottom boards
    const horizontalBoardGeo = new THREE.BoxGeometry(GAME_CONFIG.RINK_WIDTH, GAME_CONFIG.BOARD_HEIGHT, 0.2);
    const topBoard = new THREE.Mesh(horizontalBoardGeo, boardMaterial);
    topBoard.position.set(0, GAME_CONFIG.BOARD_HEIGHT / 2, -GAME_CONFIG.RINK_HEIGHT / 2);
    scene.add(topBoard);
    
    const bottomBoard = new THREE.Mesh(horizontalBoardGeo, boardMaterial);
    bottomBoard.position.set(0, GAME_CONFIG.BOARD_HEIGHT / 2, GAME_CONFIG.RINK_HEIGHT / 2);
    scene.add(bottomBoard);
    
    // Left and right boards
    const verticalBoardGeo = new THREE.BoxGeometry(0.2, GAME_CONFIG.BOARD_HEIGHT, GAME_CONFIG.RINK_HEIGHT);
    const leftBoard = new THREE.Mesh(verticalBoardGeo, boardMaterial);
    leftBoard.position.set(-GAME_CONFIG.RINK_WIDTH / 2, GAME_CONFIG.BOARD_HEIGHT / 2, 0);
    scene.add(leftBoard);
    
    const rightBoard = new THREE.Mesh(verticalBoardGeo, boardMaterial);
    rightBoard.position.set(GAME_CONFIG.RINK_WIDTH / 2, GAME_CONFIG.BOARD_HEIGHT / 2, 0);
    scene.add(rightBoard);
}

// Create puck
function createPuck() {
    const puckGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
    const puckMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
    puck = new THREE.Mesh(puckGeometry, puckMaterial);
    puck.position.set(0, 0.1, 0);
    puck.velocity = new THREE.Vector3(0, 0, 0);
    scene.add(puck);
}

// Create player paddles
function createPaddles() {
    const paddleGeometry = new THREE.CylinderGeometry(1, 1, 0.3, 32);
    
    // Player 1 (Blue) - Left side
    const player1Material = new THREE.MeshStandardMaterial({ color: 0x0066cc });
    player1Paddle = new THREE.Mesh(paddleGeometry, player1Material);
    player1Paddle.position.set(-8, 0.15, 0);
    scene.add(player1Paddle);
    
    // Player 2 (Red) - Right side
    const player2Material = new THREE.MeshStandardMaterial({ color: 0xcc0000 });
    player2Paddle = new THREE.Mesh(paddleGeometry, player2Material);
    player2Paddle.position.set(8, 0.15, 0);
    scene.add(player2Paddle);
}

// Create goals and nets
function createGoals() {
    const goalWidth = 6;
    const goalHeight = 2;
    const goalDepth = 2;
    
    // Goal posts and crossbars
    const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, goalHeight, 16);
    const postMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    
    // Left goal
    const leftPost1 = new THREE.Mesh(postGeometry, postMaterial);
    leftPost1.position.set(-GAME_CONFIG.RINK_WIDTH / 2, goalHeight / 2, -goalWidth / 2);
    scene.add(leftPost1);
    
    const leftPost2 = new THREE.Mesh(postGeometry, postMaterial);
    leftPost2.position.set(-GAME_CONFIG.RINK_WIDTH / 2, goalHeight / 2, goalWidth / 2);
    scene.add(leftPost2);
    
    // Right goal
    const rightPost1 = new THREE.Mesh(postGeometry, postMaterial);
    rightPost1.position.set(GAME_CONFIG.RINK_WIDTH / 2, goalHeight / 2, -goalWidth / 2);
    scene.add(rightPost1);
    
    const rightPost2 = new THREE.Mesh(postGeometry, postMaterial);
    rightPost2.position.set(GAME_CONFIG.RINK_WIDTH / 2, goalHeight / 2, goalWidth / 2);
    scene.add(rightPost2);
    
    // Goal areas for collision detection
    const goalGeometry = new THREE.BoxGeometry(goalDepth, goalHeight, goalWidth);
    const goalMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.1 
    });
    
    goalLeft = new THREE.Mesh(goalGeometry, goalMaterial);
    goalLeft.position.set(-GAME_CONFIG.RINK_WIDTH / 2 - goalDepth / 2, goalHeight / 2, 0);
    scene.add(goalLeft);
    
    goalRight = new THREE.Mesh(goalGeometry, goalMaterial);
    goalRight.position.set(GAME_CONFIG.RINK_WIDTH / 2 + goalDepth / 2, goalHeight / 2, 0);
    scene.add(goalRight);
    
    createNets(goalWidth, goalHeight, goalDepth);
}

// Create goal nets
function createNets(goalWidth, goalHeight, goalDepth) {
    const netMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xcccccc, 
        transparent: true, 
        opacity: 0.7,
        wireframe: true 
    });
    
    const netGeometry = new THREE.BoxGeometry(goalDepth, goalHeight, goalWidth);
    
    netLeft = new THREE.Mesh(netGeometry, netMaterial);
    netLeft.position.set(-GAME_CONFIG.RINK_WIDTH / 2 - goalDepth / 2, goalHeight / 2, 0);
    scene.add(netLeft);
    
    netRight = new THREE.Mesh(netGeometry, netMaterial);
    netRight.position.set(GAME_CONFIG.RINK_WIDTH / 2 + goalDepth / 2, goalHeight / 2, 0);
    scene.add(netRight);
}

// Create particle system for ice spray effects
function createParticleSystem() {
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(GAME_CONFIG.PARTICLE_COUNT * 3);
    const particleVelocities = [];
    
    for (let i = 0; i < GAME_CONFIG.PARTICLE_COUNT; i++) {
        particlePositions[i * 3] = 0;
        particlePositions[i * 3 + 1] = 0;
        particlePositions[i * 3 + 2] = 0;
        particleVelocities.push(new THREE.Vector3());
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.8
    });
    
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
    
    particles = {
        system: particleSystem,
        velocities: particleVelocities,
        active: false,
        timer: 0
    };
}

// Create UI overlay
function createUI() {
    const uiContainer = document.createElement('div');
    uiContainer.style.position = 'fixed';
    uiContainer.style.top = '20px';
    uiContainer.style.left = '20px';
    uiContainer.style.color = 'white';
    uiContainer.style.fontFamily = 'Arial, sans-serif';
    uiContainer.style.fontSize = '24px';
    uiContainer.style.zIndex = '1000';
    uiContainer.style.pointerEvents = 'none';
    uiContainer.id = 'game-ui';
    
    document.body.appendChild(uiContainer);
    
    // Instructions
    const instructions = document.createElement('div');
    instructions.style.position = 'fixed';
    instructions.style.bottom = '20px';
    instructions.style.left = '20px';
    instructions.style.color = 'white';
    instructions.style.fontFamily = 'Arial, sans-serif';
    instructions.style.fontSize = '16px';
    instructions.style.zIndex = '1000';
    instructions.style.pointerEvents = 'none';
    instructions.innerHTML = `
        Player 1 (Blue): Arrow Keys<br>
        Player 2 (Red): WASD<br>
        Space: Reset Puck<br>
        A: Toggle AI Mode
    `;
    document.body.appendChild(instructions);
}

// Update UI display
function updateUI() {
    const ui = document.getElementById('game-ui');
    if (ui) {
        const minutes = Math.floor(gameState.timeLeft / 60);
        const seconds = Math.floor(gameState.timeLeft % 60);
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        ui.innerHTML = `
            <div>Blue: ${gameState.score.player1} - Red: ${gameState.score.player2}</div>
            <div>Time: ${timeString}</div>
            <div>Mode: ${gameState.isAIMode ? 'vs AI' : 'vs Human'}</div>
        `;
    }
}

// Input handling with proper cleanup (Code Review Improvement)
let keyHandlers = {};

function setupInputHandlers() {
    keyHandlers.keydown = (event) => {
        keys[event.code] = true;
        
        if (event.code === 'Space') {
            event.preventDefault();
            resetPuck();
        }
        
        if (event.code === 'KeyA' && !keys.KeyA) {
            gameState.isAIMode = !gameState.isAIMode;
        }
        
        // Initialize audio on first user interaction
        if (!audioInitialized) {
            initAudio();
        }
    };
    
    keyHandlers.keyup = (event) => {
        keys[event.code] = false;
    };
    
    keyHandlers.resize = () => {
        if (camera && renderer) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    };
    
    document.addEventListener('keydown', keyHandlers.keydown);
    document.addEventListener('keyup', keyHandlers.keyup);
    window.addEventListener('resize', keyHandlers.resize);
}

// Clean up event listeners (Code Review Fix)
function cleanupEventListeners() {
    if (keyHandlers.keydown) {
        document.removeEventListener('keydown', keyHandlers.keydown);
    }
    if (keyHandlers.keyup) {
        document.removeEventListener('keyup', keyHandlers.keyup);
    }
    if (keyHandlers.resize) {
        window.removeEventListener('resize', keyHandlers.resize);
    }
}

// Reset puck to center
function resetPuck() {
    puck.position.set(0, 0.1, 0);
    puck.velocity.set(0, 0, 0);
}

// Update player paddles
function updatePaddles() {
    const speed = GAME_CONFIG.PADDLE_SPEED;
    
    // Player 1 controls (Arrow Keys)
    if (keys['ArrowUp'] && player1Paddle.position.z > -GAME_CONFIG.RINK_HEIGHT / 2 + 1) {
        player1Paddle.position.z -= speed;
    }
    if (keys['ArrowDown'] && player1Paddle.position.z < GAME_CONFIG.RINK_HEIGHT / 2 - 1) {
        player1Paddle.position.z += speed;
    }
    if (keys['ArrowLeft'] && player1Paddle.position.x > -GAME_CONFIG.RINK_WIDTH / 2 + 1) {
        player1Paddle.position.x -= speed;
    }
    if (keys['ArrowRight'] && player1Paddle.position.x < 0) {
        player1Paddle.position.x += speed;
    }
    
    // Player 2 controls (WASD or AI)
    if (gameState.isAIMode) {
        updateAI();
    } else {
        if (keys['KeyW'] && player2Paddle.position.z > -GAME_CONFIG.RINK_HEIGHT / 2 + 1) {
            player2Paddle.position.z -= speed;
        }
        if (keys['KeyS'] && player2Paddle.position.z < GAME_CONFIG.RINK_HEIGHT / 2 - 1) {
            player2Paddle.position.z += speed;
        }
        if (keys['KeyA'] && player2Paddle.position.x > 0) {
            player2Paddle.position.x -= speed;
        }
        if (keys['KeyD'] && player2Paddle.position.x < GAME_CONFIG.RINK_WIDTH / 2 - 1) {
            player2Paddle.position.x += speed;
        }
    }
}

/**
 * AI opponent logic (with edge case fixes)
 * Predicts puck movement and moves towards target with boundary checking
 * Prevents AI from getting stuck at rink boundaries
 */
function updateAI() {
    const aiSpeed = GAME_CONFIG.PADDLE_SPEED * GAME_CONFIG.AI_DIFFICULTY;
    const paddle = player2Paddle;
    
    // Target position based on puck position
    tempVector1.copy(puck.position);
    tempVector2.copy(paddle.position);
    
    // Predict puck movement
    if (puck.velocity.length() > 0.1) {
        tempVector3.copy(puck.velocity).multiplyScalar(10);
        tempVector1.add(tempVector3);
    }
    
    // Move towards target with boundary checking (Edge case fix)
    const targetX = Math.max(0, Math.min(GAME_CONFIG.RINK_WIDTH / 2 - 1, tempVector1.x));
    const targetZ = Math.max(-GAME_CONFIG.RINK_HEIGHT / 2 + 1, 
                           Math.min(GAME_CONFIG.RINK_HEIGHT / 2 - 1, tempVector1.z));
    
    // Smooth AI movement to prevent sticking at boundaries
    const diffX = targetX - paddle.position.x;
    const diffZ = targetZ - paddle.position.z;
    
    if (Math.abs(diffX) > 0.1) {
        paddle.position.x += Math.sign(diffX) * Math.min(aiSpeed, Math.abs(diffX));
    }
    if (Math.abs(diffZ) > 0.1) {
        paddle.position.z += Math.sign(diffZ) * Math.min(aiSpeed, Math.abs(diffZ));
    }
}

/**
 * Update puck physics (refactored from large function)
 * Handles friction, wall collisions, paddle collisions, and goal detection
 * Uses optimized collision detection to prevent sticking issues
 */
function updatePuck() {
    if (!puck.velocity) return;
    
    // Apply friction
    puck.velocity.multiplyScalar(GAME_CONFIG.PUCK_FRICTION);
    
    // Update position
    puck.position.add(puck.velocity);
    
    // Wall collision detection and bouncing
    handleWallCollisions();
    
    // Paddle collisions
    handlePaddleCollisions();
    
    // Goal detection
    handleGoalDetection();
    
    // Stop very slow movement
    if (puck.velocity.length() < 0.01) {
        puck.velocity.set(0, 0, 0);
    }
}

// Handle wall collisions (refactored helper function)
function handleWallCollisions() {
    const bounds = {
        left: -GAME_CONFIG.RINK_WIDTH / 2,
        right: GAME_CONFIG.RINK_WIDTH / 2,
        top: -GAME_CONFIG.RINK_HEIGHT / 2,
        bottom: GAME_CONFIG.RINK_HEIGHT / 2
    };
    
    if (puck.position.x <= bounds.left || puck.position.x >= bounds.right) {
        puck.velocity.x *= -GAME_CONFIG.PUCK_BOUNCE_DAMPING;
        puck.position.x = Math.max(bounds.left, Math.min(bounds.right, puck.position.x));
        playWallSound();
        createIceSpray(puck.position);
    }
    
    if (puck.position.z <= bounds.top || puck.position.z >= bounds.bottom) {
        puck.velocity.z *= -GAME_CONFIG.PUCK_BOUNCE_DAMPING;
        puck.position.z = Math.max(bounds.top, Math.min(bounds.bottom, puck.position.z));
        playWallSound();
        createIceSpray(puck.position);
    }
}

/**
 * Handle paddle collisions with improved detection (Code Review Fix)
 * Uses distance-based collision detection with separation to prevent sticking
 * Applies realistic physics with randomness for arcade feel
 */
function handlePaddleCollisions() {
    [player1Paddle, player2Paddle].forEach(paddle => {
        const distance = puck.position.distanceTo(paddle.position);
        if (distance < 1.5) {
            // Calculate collision vector
            tempVector1.subVectors(puck.position, paddle.position).normalize();
            
            // Apply velocity with some randomness for realistic feel
            const force = 0.5 + Math.random() * 0.3;
            puck.velocity.copy(tempVector1).multiplyScalar(force);
            
            // Separate puck from paddle to prevent sticking
            puck.position.copy(paddle.position).add(tempVector1.multiplyScalar(1.5));
            
            playHitSound();
            createIceSpray(puck.position);
        }
    });
}

// Handle goal detection
function handleGoalDetection() {
    const goalY = 0.5; // Height threshold for goal
    
    if (puck.position.y < goalY) return;
    
    // Left goal (Player 2 scores)
    if (puck.position.x < -GAME_CONFIG.RINK_WIDTH / 2 && 
        Math.abs(puck.position.z) < 3) {
        gameState.score.player2++;
        playGoalSound();
        resetPuck();
    }
    
    // Right goal (Player 1 scores)
    if (puck.position.x > GAME_CONFIG.RINK_WIDTH / 2 && 
        Math.abs(puck.position.z) < 3) {
        gameState.score.player1++;
        playGoalSound();
        resetPuck();
    }
}

/**
 * Create ice spray particle effect
 * Generates particle spray at collision points for visual feedback
 * @param {THREE.Vector3} position - World position where particles should spawn
 */
function createIceSpray(position) {
    if (!particles.system) return;
    
    particles.active = true;
    particles.timer = 30; // frames
    
    const positions = particles.system.geometry.attributes.position.array;
    
    for (let i = 0; i < GAME_CONFIG.PARTICLE_COUNT; i++) {
        const index = i * 3;
        positions[index] = position.x + (Math.random() - 0.5) * 2;
        positions[index + 1] = position.y + Math.random() * 0.5;
        positions[index + 2] = position.z + (Math.random() - 0.5) * 2;
        
        // Set random velocities
        particles.velocities[i].set(
            (Math.random() - 0.5) * 0.2,
            Math.random() * 0.1,
            (Math.random() - 0.5) * 0.2
        );
    }
    
    particles.system.geometry.attributes.position.needsUpdate = true;
}

// Update particle system
function updateParticles() {
    if (!particles.active || !particles.system) return;
    
    particles.timer--;
    if (particles.timer <= 0) {
        particles.active = false;
        return;
    }
    
    const positions = particles.system.geometry.attributes.position.array;
    
    for (let i = 0; i < GAME_CONFIG.PARTICLE_COUNT; i++) {
        const index = i * 3;
        positions[index] += particles.velocities[i].x;
        positions[index + 1] += particles.velocities[i].y;
        positions[index + 2] += particles.velocities[i].z;
        
        // Apply gravity and friction
        particles.velocities[i].y -= 0.002;
        particles.velocities[i].multiplyScalar(0.98);
    }
    
    particles.system.geometry.attributes.position.needsUpdate = true;
}

// Game timer
function updateGameTimer(deltaTime) {
    if (gameState.gameRunning && gameState.timeLeft > 0) {
        gameState.timeLeft -= deltaTime;
        if (gameState.timeLeft <= 0) {
            gameState.timeLeft = 0;
            gameState.gameRunning = false;
            console.log('Game Over!');
        }
    }
}

// Frame rate limiting (Code Review Improvement)
let lastFrameTime = 0;
const targetFrameTime = 1000 / GAME_CONFIG.MAX_FPS;

// Main animation loop with error handling
function animate(currentTime = 0) {
    try {
        // Frame rate limiting
        if (currentTime - lastFrameTime < targetFrameTime) {
            requestAnimationFrame(animate);
            return;
        }
        
        const deltaTime = (currentTime - lastFrameTime) / 1000;
        lastFrameTime = currentTime;
        
        if (gameState.gameRunning) {
            updatePaddles();
            updatePuck();
            updateParticles();
            updateGameTimer(deltaTime);
            updateUI();
        }
        
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
        
    } catch (error) {
        console.error('Animation loop error:', error);
        // Continue animation even if there's an error
        requestAnimationFrame(animate);
    }
}

// Initialize game with proper error handling
async function initGame() {
    try {
        console.log('Initializing 3D Hockey Game...');
        
        initScene();
        createGameObjects();
        createUI();
        setupInputHandlers();
        
        // Start animation
        animate();
        
        console.log('Game initialized successfully!');
    } catch (error) {
        console.error('Game initialization failed:', error);
        
        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '50%';
        errorDiv.style.left = '50%';
        errorDiv.style.transform = 'translate(-50%, -50%)';
        errorDiv.style.background = 'rgba(255, 0, 0, 0.8)';
        errorDiv.style.color = 'white';
        errorDiv.style.padding = '20px';
        errorDiv.style.borderRadius = '10px';
        errorDiv.style.zIndex = '10000';
        errorDiv.innerHTML = `Game initialization failed: ${error.message}`;
        document.body.appendChild(errorDiv);
    }
}

// Cleanup function for proper resource management
function cleanup() {
    cleanupEventListeners();
    
    if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
    }
    
    if (renderer) {
        renderer.dispose();
    }
    
    // Clean up geometries and materials
    scene?.traverse((object) => {
        if (object.geometry) {
            object.geometry.dispose();
        }
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
            } else {
                object.material.dispose();
            }
        }
    });
}

// Handle page unload for cleanup
window.addEventListener('beforeunload', cleanup);

// Start the game
initGame();