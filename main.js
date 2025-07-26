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

// Game Progression State
const gameState = {
    currentPeriod: 1,
    maxPeriods: 3,
    periodDuration: 3 * 60 * 1000, // 3 minutes in milliseconds
    periodTimeLeft: 3 * 60 * 1000, // Time remaining in current period
    intermissionDuration: 15 * 1000, // 15 seconds intermission
    intermissionTimeLeft: 0,
    gamePhase: 'playing', // 'playing', 'intermission', 'game_over', 'victory', 'defeat'
    currentLevel: 1,
    maxLevel: 3,
    periodStartTime: Date.now(),
    intermissionStartTime: 0,
    levelProgress: loadLevelProgress()
};

// Load level progress from localStorage
function loadLevelProgress() {
    const saved = localStorage.getItem('hockey_game_level');
    return saved ? parseInt(saved) : 1;
}

// Save level progress to localStorage
function saveLevelProgress(level) {
    localStorage.setItem('hockey_game_level', level.toString());
    gameState.levelProgress = level;
}

// Initialize game state based on saved progress
gameState.currentLevel = gameState.levelProgress;

// Sound System
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Goal Celebration State
const celebrationState = {
    isActive: false,
    startTime: 0,
    duration: 3000, // 3 seconds
    team: null, // 'blue' or 'red'
    originalLightIntensity: { ambient: 1.2, directional: 0.8 },
    strobeInterval: null
};

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

// Commentator Voice System
function playCommentatorVoice(team) {
    // Check if Speech Synthesis is supported
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance();
        
        // Randomize excitement level and phrases
        const phrases = [
            `And they shoot... AND THEY SCORE! ${team} team finds the back of the net!`,
            `GOAL! What a shot by ${team} team! The crowd goes wild!`,
            `He shoots, he scores! Fantastic goal by ${team} team!`,
            `AND THAT'S A GOAL! ${team} team lights the lamp!`,
            `GOOOOOAL! ${team} team with a beautiful finish!`
        ];
        
        utterance.text = phrases[Math.floor(Math.random() * phrases.length)];
        utterance.rate = 1.2; // Slightly faster for excitement
        utterance.pitch = 1.1; // Higher pitch for excitement
        utterance.volume = 0.8;
        
        // Try to find an appropriate voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
            voice.name.includes('English') || voice.lang.includes('en')
        );
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
        
        // Delay slightly so it doesn't overlap with goal horn
        setTimeout(() => {
            speechSynthesis.speak(utterance);
        }, 800);
    }
}

// Dynamic Lighting System for Goal Celebrations
function startGoalCelebration(team) {
    celebrationState.isActive = true;
    celebrationState.startTime = Date.now();
    celebrationState.team = team;
    
    // Store original light intensities
    celebrationState.originalLightIntensity.ambient = ambientLight.intensity;
    celebrationState.originalLightIntensity.directional = directionalLight.intensity;
    
    // Set team colors for lighting
    const teamColors = {
        blue: new THREE.Color(0x0066ff),
        red: new THREE.Color(0xff0066)
    };
    
    // Start strobe effect
    let strobePhase = 0;
    celebrationState.strobeInterval = setInterval(() => {
        strobePhase = (strobePhase + 1) % 4;
        
        if (strobePhase === 0 || strobePhase === 2) {
            // Bright team-colored flash
            ambientLight.color = teamColors[team];
            directionalLight.color = teamColors[team];
            ambientLight.intensity = 2.0;
            directionalLight.intensity = 1.5;
        } else {
            // Dim phase
            ambientLight.color = new THREE.Color(0xffffff);
            directionalLight.color = new THREE.Color(0xffffff);
            ambientLight.intensity = 0.3;
            directionalLight.intensity = 0.2;
        }
    }, 150); // Strobe every 150ms
    
    // Start screen border flash
    startScreenBorderFlash(team);
    
    // Enhanced celebration particles
    emitCelebrationParticles(team);
    
    // Auto-end celebration after duration
    setTimeout(() => {
        endGoalCelebration();
    }, celebrationState.duration);
}

function endGoalCelebration() {
    if (!celebrationState.isActive) return;
    
    celebrationState.isActive = false;
    
    // Clear strobe interval
    if (celebrationState.strobeInterval) {
        clearInterval(celebrationState.strobeInterval);
        celebrationState.strobeInterval = null;
    }
    
    // Restore original lighting
    ambientLight.color = new THREE.Color(0xffffff);
    directionalLight.color = new THREE.Color(0xffffff);
    ambientLight.intensity = celebrationState.originalLightIntensity.ambient;
    directionalLight.intensity = celebrationState.originalLightIntensity.directional;
    
    // End screen border flash
    endScreenBorderFlash();
}

// Screen Border Flash System
function startScreenBorderFlash(team) {
    const borderElement = document.createElement('div');
    borderElement.id = 'goal-border-flash';
    borderElement.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 500;
        border: 8px solid ${team === 'blue' ? '#0066ff' : '#ff0066'};
        background: transparent;
        opacity: 0;
        animation: goalBorderFlash 3s ease-out;
    `;
    
    // Add CSS animation keyframes if not already present
    if (!document.getElementById('goal-celebration-styles')) {
        const style = document.createElement('style');
        style.id = 'goal-celebration-styles';
        style.textContent = `
            @keyframes goalBorderFlash {
                0% { opacity: 0; border-width: 8px; }
                10% { opacity: 1; border-width: 12px; }
                20% { opacity: 0.7; border-width: 8px; }
                30% { opacity: 1; border-width: 12px; }
                40% { opacity: 0.7; border-width: 8px; }
                50% { opacity: 1; border-width: 12px; }
                60% { opacity: 0.7; border-width: 8px; }
                70% { opacity: 0.5; border-width: 6px; }
                80% { opacity: 0.3; border-width: 4px; }
                90% { opacity: 0.1; border-width: 2px; }
                100% { opacity: 0; border-width: 0px; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(borderElement);
}

function endScreenBorderFlash() {
    const borderElement = document.getElementById('goal-border-flash');
    if (borderElement) {
        borderElement.remove();
    }
}

// Enhanced Celebration Particle System
function emitCelebrationParticles(team) {
    const teamColors = {
        blue: 0x0066ff,
        red: 0xff0066
    };
    
    const particlesToEmit = 30; // More particles for celebration
    const emissionCenter = new THREE.Vector3(0, 1, 0); // Center of rink, elevated
    
    for (let i = 0; i < particlesToEmit; i++) {
        const particle = particles.find(p => p.life <= 0);
        if (particle) {
            // Position particles in a burst pattern
            const angle = (i / particlesToEmit) * Math.PI * 2;
            const radius = Math.random() * 3;
            
            particle.mesh.position.set(
                emissionCenter.x + Math.cos(angle) * radius,
                emissionCenter.y + Math.random() * 2,
                emissionCenter.z + Math.sin(angle) * radius
            );
            
            particle.mesh.visible = true;
            particle.mesh.material.color.setHex(teamColors[team]);
            
            // Explosive velocity pattern
            particle.velocity.set(
                Math.cos(angle) * (0.2 + Math.random() * 0.3),
                0.3 + Math.random() * 0.5, // Upward explosion
                Math.sin(angle) * (0.2 + Math.random() * 0.3)
            );
            
            particle.life = 2.0 + Math.random() * 1.0; // Longer life for celebration
        }
    }
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
const gameOverlay = document.getElementById('game-overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayMessage = document.getElementById('overlay-message');
const overlayControls = document.getElementById('overlay-controls');

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
    
    // Skip goal celebration with ESC key
    if (event.code === 'Escape' && celebrationState.isActive) {
        endGoalCelebration();
        event.preventDefault();
        return;
    }
    
    // Reset puck position with spacebar (only during active play and not during celebration)
    if (event.code === 'Space' && gameState.gamePhase === 'playing' && !celebrationState.isActive) {
        resetPuck();
        event.preventDefault();
    }
    
    // Game control keys
    if (event.code === 'KeyR') {
        // Restart current level
        restartLevel();
        event.preventDefault();
    }
    
    if (event.code === 'KeyN') {
        // Start new game from Level 1
        startNewGame();
        event.preventDefault();
    }
    
    // Switch game modes (only when not in single player progression)
    if (event.code === 'Digit1') {
        isSinglePlayer = true;
        // If switching to single player, ensure we're at the correct level
        gameState.currentLevel = gameState.levelProgress;
        console.log(`Switched to Single Player mode - Level ${gameState.currentLevel}`);
    }
    if (event.code === 'Digit2') {
        isSinglePlayer = false;
        console.log('Switched to Two Player mode');
    }
    
    // Continue to next level after victory (only in victory state)
    if (event.code === 'Enter' && gameState.gamePhase === 'victory') {
        restartLevel(); // Start the new level
        event.preventDefault();
    }
    
    // Retry after defeat
    if (event.code === 'Enter' && gameState.gamePhase === 'defeat') {
        restartLevel(); // Retry current level
        event.preventDefault();
    }
});

document.addEventListener('keyup', (event) => {
    keys[event.code] = false;
});

// AI opponent logic with difficulty scaling
function updateAI() {
    // AI controls the red paddle (paddle2)
    // Difficulty scaling based on current level
    let aiSpeedMultiplier, aggressiveness, reactionTime;
    
    switch(gameState.currentLevel) {
        case 1: // Level 1: Basic AI (60% speed, defensive)
            aiSpeedMultiplier = 0.6;
            aggressiveness = 0.1; // Very defensive
            reactionTime = 0.8; // Slower reactions
            break;
        case 2: // Level 2: Intermediate AI (80% speed, balanced)
            aiSpeedMultiplier = 0.8;
            aggressiveness = 0.4; // Balanced play
            reactionTime = 0.6; // Moderate reactions
            break;
        case 3: // Level 3: Expert AI (100% speed, aggressive)
            aiSpeedMultiplier = 1.0;
            aggressiveness = 0.8; // Very aggressive
            reactionTime = 0.3; // Fast reactions
            break;
        default:
            aiSpeedMultiplier = 0.6;
            aggressiveness = 0.1;
            reactionTime = 0.8;
    }
    
    const aiSpeed = paddleSpeed * aiSpeedMultiplier;
    const puckPosition = puck.position;
    const paddlePosition = paddle2.position;
    
    // AI strategy based on puck position and difficulty level
    if (puckPosition.x > 0) {
        // Puck is on AI's side - defend (but with varying aggression)
        const targetZ = puckPosition.z;
        let targetX;
        
        if (gameState.currentLevel === 1) {
            // Level 1: Stay back, very defensive
            targetX = Math.max(puckPosition.x - 3, rinkWidth/2 - 5);
        } else if (gameState.currentLevel === 2) {
            // Level 2: Moderate positioning
            targetX = Math.max(puckPosition.x - 2, rinkWidth/2 - 4);
        } else {
            // Level 3: Aggressive positioning, try to intercept
            targetX = Math.max(puckPosition.x - 1, rinkWidth/2 - 3);
        }
        
        // Apply reaction time delay for lower levels
        const tolerance = reactionTime;
        
        // Move towards defensive position
        if (paddlePosition.z < targetZ - tolerance && paddlePosition.z < rinkHeight/2 - 1) {
            paddle2.position.z += aiSpeed;
        } else if (paddlePosition.z > targetZ + tolerance && paddlePosition.z > -rinkHeight/2 + 1) {
            paddle2.position.z -= aiSpeed;
        }
        
        if (paddlePosition.x < targetX - tolerance && paddlePosition.x < rinkWidth/2 - 1) {
            paddle2.position.x += aiSpeed;
        } else if (paddlePosition.x > targetX + tolerance && paddlePosition.x > -rinkWidth/2 + 1) {
            paddle2.position.x -= aiSpeed;
        }
    } else {
        // Puck is on opponent's side - positioning based on aggressiveness
        let centerX, centerZ;
        
        if (gameState.currentLevel === 1) {
            // Level 1: Stay in defensive position
            centerX = 12;
            centerZ = 0;
        } else if (gameState.currentLevel === 2) {
            // Level 2: Move towards center, occasionally offensive
            centerX = 8;
            centerZ = puckPosition.z * 0.3; // Slight anticipation
        } else {
            // Level 3: Aggressive offensive positioning
            centerX = 5;
            centerZ = puckPosition.z * 0.6; // Strong anticipation
        }
        
        const moveSpeed = aiSpeed * (0.3 + aggressiveness * 0.7);
        const tolerance = reactionTime * 0.5;
        
        if (paddlePosition.z < centerZ - tolerance && paddlePosition.z < rinkHeight/2 - 1) {
            paddle2.position.z += moveSpeed;
        } else if (paddlePosition.z > centerZ + tolerance && paddlePosition.z > -rinkHeight/2 + 1) {
            paddle2.position.z -= moveSpeed;
        }
        
        if (paddlePosition.x < centerX - tolerance && paddlePosition.x < rinkWidth/2 - 1) {
            paddle2.position.x += moveSpeed;
        } else if (paddlePosition.x > centerX + tolerance && paddlePosition.x > -rinkWidth/2 + 1) {
            paddle2.position.x -= moveSpeed;
        }
    }
}

// Update paddle positions based on input
function updatePaddles() {
    // Player 1 Controls (Arrow Keys) - Blue Paddle
    const player1Speed = paddleSpeed * 0.9; // 90% speed for player
    if (keys['ArrowUp'] && paddle1.position.z > -rinkHeight/2 + 1) {
        paddle1.position.z -= player1Speed;
    }
    if (keys['ArrowDown'] && paddle1.position.z < rinkHeight/2 - 1) {
        paddle1.position.z += player1Speed;
    }
    if (keys['ArrowLeft'] && paddle1.position.x > -rinkWidth/2 + 1) {
        paddle1.position.x -= player1Speed;
    }
    if (keys['ArrowRight'] && paddle1.position.x < rinkWidth/2 - 1) {
        paddle1.position.x += player1Speed;
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

// Game Period Management
function updateGameTimer() {
    const currentTime = Date.now();
    
    if (gameState.gamePhase === 'playing') {
        // Update period timer
        const elapsed = currentTime - gameState.periodStartTime;
        gameState.periodTimeLeft = Math.max(0, gameState.periodDuration - elapsed);
        
        // Check if period is over
        if (gameState.periodTimeLeft <= 0) {
            endPeriod();
        }
    } else if (gameState.gamePhase === 'intermission') {
        // Update intermission timer
        const elapsed = currentTime - gameState.intermissionStartTime;
        gameState.intermissionTimeLeft = Math.max(0, gameState.intermissionDuration - elapsed);
        
        // Check if intermission is over
        if (gameState.intermissionTimeLeft <= 0) {
            startNextPeriod();
        }
    }
}

function endPeriod() {
    console.log(`Period ${gameState.currentPeriod} ended. Score: Player 1: ${player1Score}, Player 2: ${player2Score}`);
    
    if (gameState.currentPeriod >= gameState.maxPeriods) {
        // Game is over - determine winner
        endGame();
        return;
    }
    
    // Start intermission
    gameState.gamePhase = 'intermission';
    gameState.intermissionStartTime = Date.now();
    gameState.intermissionTimeLeft = gameState.intermissionDuration;
    
    // Reset puck during intermission
    resetPuck();
}

function startNextPeriod() {
    gameState.currentPeriod++;
    gameState.gamePhase = 'playing';
    gameState.periodStartTime = Date.now();
    gameState.periodTimeLeft = gameState.periodDuration;
    
    console.log(`Starting Period ${gameState.currentPeriod}`);
    resetPuck();
}

function endGame() {
    gameState.gamePhase = 'game_over';
    
    // Determine winner and handle level progression
    if (player1Score > player2Score) {
        // Player wins - advance to next level
        if (gameState.currentLevel < gameState.maxLevel) {
            gameState.gamePhase = 'victory';
            gameState.currentLevel++;
            saveLevelProgress(gameState.currentLevel);
            console.log(`Victory! Advanced to Level ${gameState.currentLevel}`);
            showVictoryScreen(gameState.currentLevel - 1, gameState.currentLevel);
        } else {
            // Beat final level
            gameState.gamePhase = 'victory';
            console.log('Congratulations! You beat all levels!');
            showCompleteScreen();
        }
    } else if (player2Score > player1Score) {
        // AI wins - player must retry current level
        gameState.gamePhase = 'defeat';
        console.log(`Defeat! Try Level ${gameState.currentLevel} again.`);
        showDefeatScreen(gameState.currentLevel);
    } else {
        // Tie game - also counts as defeat (must win to advance)
        gameState.gamePhase = 'defeat';
        console.log(`Tie game! You must win to advance from Level ${gameState.currentLevel}.`);
        showDefeatScreen(gameState.currentLevel, true);
    }
}

// Overlay management functions
function hideOverlay() {
    gameOverlay.style.display = 'none';
}

function showVictoryScreen(completedLevel, nextLevel) {
    overlayTitle.textContent = 'VICTORY!';
    overlayTitle.className = 'victory-title';
    overlayMessage.innerHTML = `🏆 You beat Level ${completedLevel}!<br><br>Score: Blue ${player1Score} - ${player2Score} Red<br><br>Ready for Level ${nextLevel}?`;
    overlayControls.innerHTML = 'Press ENTER to continue to next level<br>Press R to replay current level<br>Press N for new game';
    gameOverlay.style.display = 'flex';
}

function showDefeatScreen(currentLevel, wasTie = false) {
    overlayTitle.textContent = 'DEFEAT!';
    overlayTitle.className = 'defeat-title';
    const tieText = wasTie ? 'TIE GAME! ' : '';
    overlayMessage.innerHTML = `${tieText}💀 Level ${currentLevel} Failed<br><br>Score: Blue ${player1Score} - ${player2Score} Red<br><br>You must win to advance!`;
    overlayControls.innerHTML = 'Press ENTER to retry level<br>Press R to restart level<br>Press N for new game';
    gameOverlay.style.display = 'flex';
}

function showCompleteScreen() {
    overlayTitle.textContent = 'CHAMPION!';
    overlayTitle.className = 'complete-title';
    overlayMessage.innerHTML = `🏆🎉 ALL LEVELS COMPLETE! 🎉🏆<br><br>Final Score: Blue ${player1Score} - ${player2Score} Red<br><br>You are the Hockey Master!`;
    overlayControls.innerHTML = 'Press R to replay Level 3<br>Press N to start over from Level 1';
    gameOverlay.style.display = 'flex';
}

function startNewGame() {
    // Hide overlay
    hideOverlay();
    
    // Reset to Level 1
    gameState.currentLevel = 1;
    gameState.currentPeriod = 1;
    gameState.gamePhase = 'playing';
    gameState.periodStartTime = Date.now();
    gameState.periodTimeLeft = gameState.periodDuration;
    
    // Reset scores
    player1Score = 0;
    player2Score = 0;
    
    // Reset level progress
    saveLevelProgress(1);
    
    console.log('Starting new game from Level 1');
    resetPuck();
}

function restartLevel() {
    // Hide overlay
    hideOverlay();
    
    // Restart current level
    gameState.currentPeriod = 1;
    gameState.gamePhase = 'playing';
    gameState.periodStartTime = Date.now();
    gameState.periodTimeLeft = gameState.periodDuration;
    
    // Reset scores
    player1Score = 0;
    player2Score = 0;
    
    console.log(`Restarting Level ${gameState.currentLevel}`);
    resetPuck();
}

// Update UI elements
function updateUI() {
    player1ScoreElement.textContent = player1Score;
    player2ScoreElement.textContent = player2Score;
    
    // Update timer based on game phase
    if (gameState.gamePhase === 'playing') {
        const timeLeft = Math.ceil(gameState.periodTimeLeft / 1000);
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `Period ${gameState.currentPeriod}/3 - ${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else if (gameState.gamePhase === 'intermission') {
        const timeLeft = Math.ceil(gameState.intermissionTimeLeft / 1000);
        timerElement.textContent = `Intermission - ${timeLeft}s`;
    } else if (gameState.gamePhase === 'victory') {
        if (gameState.currentLevel > gameState.maxLevel) {
            timerElement.textContent = 'ALL LEVELS COMPLETE!';
        } else {
            timerElement.textContent = `VICTORY! Now Level ${gameState.currentLevel}`;
        }
    } else if (gameState.gamePhase === 'defeat') {
        timerElement.textContent = 'DEFEAT - Try Again!';
    } else {
        timerElement.textContent = 'Game Over';
    }
    
    // Update game mode to show current level
    if (isSinglePlayer) {
        gameModeElement.textContent = `Single Player - Level ${gameState.currentLevel}/3`;
    } else {
        gameModeElement.textContent = 'Two Player';
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
        
        // Full goal celebration for Red team
        createGoalSound(); // Original goal horn
        playCommentatorVoice('Red'); // New commentator voice
        startGoalCelebration('red'); // New lighting and visual effects
        
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
        
        // Full goal celebration for Blue team
        createGoalSound(); // Original goal horn
        playCommentatorVoice('Blue'); // New commentator voice
        startGoalCelebration('blue'); // New lighting and visual effects
        
        updateUI();
        resetPuck();
        return true;
    }
    
    return false;
}

// Puck Physics Update
function updatePuck() {
    // Check for goals first (but not during celebrations)
    if (!celebrationState.isActive && checkGoal()) {
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
    
    // Update game timer and period management
    updateGameTimer();
    
    // Only update game elements if actively playing and not celebrating
    if (gameState.gamePhase === 'playing' && !celebrationState.isActive) {
        updatePaddles();
        updatePuck();
        
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
    }
    
    // Always update UI and particles
    updateUI();
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
