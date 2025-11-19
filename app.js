// Heimdall - Guardian of the Bifröst
// Interactive generative art exploring Norse mythology, sound visualization, and cosmic resonance

const canvas = document.getElementById('heimdallCanvas');
const ctx = canvas.getContext('2d');

// Canvas setup
let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

// Application state
let isPaused = false;
let isBirdsEye = false;
let intensityMultiplier = 1;
let time = 0;

// Audio System
let audioContext = null;
let masterGain = null;
let ambienceGain = null;
let ambienceOscillators = [];
let isAudioInitialized = false;
let isMuted = false;
let masterVolume = 0.6;
let isHornBlasting = false;

// Camera and view
let cameraX = 0;
let cameraY = 0;
let zoomLevel = 1;
let targetZoom = 1;

// Heimdall (the guardian)
const heimdall = {
    x: -150,
    y: 0,
    targetX: -150,
    targetY: 0,
    vx: 0,
    vy: 0,
    size: 50,
    glowIntensity: 1,
    listeningRunes: []
};

// Echo system
const echoRings = [];
const MAX_ECHO_RINGS = 150;
let lastEchoTime = 0;
const ECHO_INTERVAL = 400;

// Echo types
const echoTypes = {
    grassGrowing: {
        name: 'Grass Growing',
        colors: ['#6b8e23', '#8fbc8f', '#d4af37'],
        speed: 1.2,
        interval: 600
    },
    woolOnSheep: {
        name: 'Wool on Sheep',
        colors: ['#f5f5dc', '#fff8dc', '#ffd700'],
        speed: 1.5,
        interval: 500
    },
    distantFootsteps: {
        name: 'Distant Footsteps',
        colors: ['#4682b4', '#b0c4de', '#c0c0c0'],
        speed: 2,
        interval: 400
    },
    cosmicTravelers: {
        name: 'Cosmic Travelers',
        colors: ['#9370db', '#8a2be2', '#e6e6fa'],
        speed: 3,
        interval: 300
    }
};

let currentEchoType = echoTypes.grassGrowing;
const echoTypeKeys = Object.keys(echoTypes);
let currentEchoIndex = 0;

// Runes
const runeSymbols = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛋ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ'];
const runes = [];
let lastRuneTime = 0;

// Bifröst (rainbow bridge)
const bifrost = {
    x: -400,
    y: 0,
    angle: -0.3,
    colors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'],
    pulsePhase: 0,
    segments: []
};

// Constellations
const constellations = [];
const stars = [];

// Spectral travelers
const travelers = [];
let lastTravelerTime = 0;

// Relics from horn blasts
const relics = [];
const MAX_RELICS = 50;

// Sacred geometry
const sacredPatterns = [];

// Particles
const particles = [];

// Keyboard state
const keys = {};

// Initialize Audio System
function initAudioSystem() {
    if (isAudioInitialized) return;
    
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Master gain control
        masterGain = audioContext.createGain();
        masterGain.gain.value = masterVolume;
        masterGain.connect(audioContext.destination);
        
        // Ambience gain control
        ambienceGain = audioContext.createGain();
        ambienceGain.gain.value = 0.08;
        ambienceGain.connect(masterGain);
        
        // Start background ambience
        startAmbience();
        
        isAudioInitialized = true;
        console.log('Audio system initialized');
    } catch (e) {
        console.warn('Web Audio API not supported:', e);
    }
}

// Start background ambience
function startAmbience() {
    if (!audioContext) return;
    // The background ambience has been disabled as requested.
    // The original code for creating drones, bass, and noise has been removed.
}

// Play horn blast with echo/reverb
function playHornBlast() {
    if (!audioContext || isMuted || isHornBlasting) return;
    
    isHornBlasting = true;
    const now = audioContext.currentTime;
    
    // Create horn sound using multiple oscillators for rich timbre
    const frequencies = [150, 225, 300, 450]; // Fundamental and harmonics
    const gains = [0.4, 0.3, 0.2, 0.15];
    
    frequencies.forEach((freq, index) => {
        // Main horn blast
        const osc = audioContext.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        
        const oscGain = audioContext.createGain();
        oscGain.gain.setValueAtTime(0, now);
        oscGain.gain.linearRampToValueAtTime(gains[index] * 0.6, now + 0.05); // Quick attack
        oscGain.gain.setValueAtTime(gains[index] * 0.6, now + 0.3); // Sustain
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5); // Release
        
        // Filter for warmth
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        filter.Q.value = 2;
        
        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(masterGain);
        
        osc.start(now);
        osc.stop(now + 1.5);
    });
    
    // Create echo layers
    const echoDelays = [0.2, 0.4, 0.8];
    const echoVolumes = [0.5, 0.35, 0.2];
    
    echoDelays.forEach((delayTime, index) => {
        frequencies.forEach((freq, freqIndex) => {
            const echoOsc = audioContext.createOscillator();
            echoOsc.type = 'sawtooth';
            echoOsc.frequency.value = freq * (1 - index * 0.02); // Slight pitch variation
            
            const echoGain = audioContext.createGain();
            const startTime = now + delayTime;
            echoGain.gain.setValueAtTime(0, startTime);
            echoGain.gain.linearRampToValueAtTime(gains[freqIndex] * echoVolumes[index] * 0.4, startTime + 0.05);
            echoGain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);
            
            const echoFilter = audioContext.createBiquadFilter();
            echoFilter.type = 'lowpass';
            echoFilter.frequency.value = 700 - index * 100;
            echoFilter.Q.value = 1.5;
            
            echoOsc.connect(echoFilter);
            echoFilter.connect(echoGain);
            echoGain.connect(masterGain);
            
            echoOsc.start(startTime);
            echoOsc.stop(startTime + 1.2);
        });
    });
    
    // Add reverb tail with filtered noise
    const reverbStart = now + 0.8;
    const reverbDuration = 2.5;
    
    const bufferSize = audioContext.sampleRate * 0.1;
    const reverbBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const reverbData = reverbBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        reverbData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    
    const reverbNoise = audioContext.createBufferSource();
    reverbNoise.buffer = reverbBuffer;
    
    const reverbFilter = audioContext.createBiquadFilter();
    reverbFilter.type = 'bandpass';
    reverbFilter.frequency.value = 400;
    reverbFilter.Q.value = 2;
    
    const reverbGain = audioContext.createGain();
    reverbGain.gain.setValueAtTime(0.3, reverbStart);
    reverbGain.gain.exponentialRampToValueAtTime(0.001, reverbStart + reverbDuration);
    
    reverbNoise.connect(reverbFilter);
    reverbFilter.connect(reverbGain);
    reverbGain.connect(masterGain);
    
    reverbNoise.start(reverbStart);
    reverbNoise.stop(reverbStart + reverbDuration);
    
    // Reset horn blasting flag
    setTimeout(() => {
        isHornBlasting = false;
    }, 500);
}

// Play subtle echo type sound
function playEchoTypeSound(echoType) {
    if (!audioContext || isMuted) return;
    
    const now = audioContext.currentTime;
    const duration = 0.3;
    
    let frequency = 200;
    let filterFreq = 400;
    
    switch(echoType.name) {
        case 'Grass Growing':
            frequency = 180;
            filterFreq = 300;
            break;
        case 'Wool on Sheep':
            frequency = 350;
            filterFreq = 500;
            break;
        case 'Distant Footsteps':
            frequency = 250;
            filterFreq = 400;
            break;
        case 'Cosmic Travelers':
            frequency = 900;
            filterFreq = 1200;
            break;
    }
    
    const osc = audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = frequency;
    
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08 * intensityMultiplier, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    
    osc.start(now);
    osc.stop(now + duration);
}

// Update master volume
function setVolume(value) {
    masterVolume = value;
    if (audioContext && masterGain) {
        masterGain.gain.setValueAtTime(isMuted ? 0 : masterVolume, audioContext.currentTime);
    }
}

// Toggle mute
function toggleMute() {
    isMuted = !isMuted;
    if (audioContext && masterGain) {
        masterGain.gain.setValueAtTime(isMuted ? 0 : masterVolume, audioContext.currentTime);
    }
    const muteBtn = document.getElementById('muteBtn');
    if (muteBtn) {
        muteBtn.textContent = isMuted ? '🔇 Unmute' : '🔊 Mute';
    }
}

// Initialize the scene
function initScene() {
    // Initialize Bifröst segments
    for (let i = 0; i < 100; i++) {
        bifrost.segments.push({
            distance: i * 15,
            width: 200 - i * 1.5,
            alpha: 1 - i * 0.008
        });
    }
    
    // Create constellations
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 400 + Math.random() * 300;
        constellations.push({
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance - 100,
            stars: [],
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.02 + Math.random() * 0.02
        });
        
        // Add stars to constellation
        const numStars = 5 + Math.floor(Math.random() * 4);
        for (let j = 0; j < numStars; j++) {
            constellations[i].stars.push({
                x: (Math.random() - 0.5) * 80,
                y: (Math.random() - 0.5) * 80,
                size: 1 + Math.random() * 2,
                brightness: 0.5 + Math.random() * 0.5
            });
        }
    }
    
    // Create background stars
    for (let i = 0; i < 200; i++) {
        stars.push({
            x: (Math.random() - 0.5) * width * 3,
            y: (Math.random() - 0.5) * height * 3,
            size: Math.random() * 1.5,
            brightness: Math.random(),
            twinkleSpeed: 0.01 + Math.random() * 0.02,
            twinklePhase: Math.random() * Math.PI * 2
        });
    }
    
    // Sacred geometry patterns
    for (let i = 0; i < 4; i++) {
        sacredPatterns.push({
            x: (Math.random() - 0.5) * 600,
            y: (Math.random() - 0.5) * 400,
            radius: 80 + i * 60,
            sides: 6,
            rotation: Math.random() * Math.PI,
            rotationSpeed: 0.0002 + Math.random() * 0.0003,
            alpha: 0.03 + Math.random() * 0.03
        });
    }
}

// Draw cosmic background
function drawCosmos() {
    // Night sky gradient
    const gradient = ctx.createRadialGradient(width / 2, height / 3, 0, width / 2, height / 2, Math.max(width, height));
    gradient.addColorStop(0, '#1a1a3e');
    gradient.addColorStop(0.5, '#0f0f2a');
    gradient.addColorStop(1, '#0d0d1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Ethereal glow at horizon
    const horizonGlow = ctx.createRadialGradient(width / 2, height * 0.6, 0, width / 2, height * 0.6, 500);
    horizonGlow.addColorStop(0, 'rgba(138, 43, 226, 0.08)');
    horizonGlow.addColorStop(0.5, 'rgba(100, 100, 200, 0.04)');
    horizonGlow.addColorStop(1, 'rgba(80, 80, 180, 0)');
    ctx.fillStyle = horizonGlow;
    ctx.fillRect(0, 0, width, height);
}

// Draw background stars
function drawStars() {
    stars.forEach(star => {
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
        const brightness = star.brightness * twinkle;
        
        const screenX = width / 2 + (star.x - cameraX * 0.3) * zoomLevel;
        const screenY = height / 2 + (star.y - cameraY * 0.3) * zoomLevel;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.6})`;
        ctx.beginPath();
        ctx.arc(screenX, screenY, star.size * zoomLevel, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Draw the Bifröst (rainbow bridge)
function drawBifrost() {
    ctx.save();
    ctx.translate(width / 2 - cameraX * zoomLevel, height / 2 - cameraY * zoomLevel);
    ctx.scale(zoomLevel, zoomLevel);
    
    bifrost.pulsePhase += 0.01;
    const pulse = Math.sin(bifrost.pulsePhase) * 0.15 + 0.85;
    
    ctx.save();
    ctx.translate(bifrost.x, bifrost.y);
    ctx.rotate(bifrost.angle);
    
    // Draw bridge segments receding into distance
    bifrost.segments.forEach((segment, i) => {
        const colorShift = (i / bifrost.segments.length) * bifrost.colors.length;
        const colorIndex = Math.floor(colorShift) % bifrost.colors.length;
        const nextColorIndex = (colorIndex + 1) % bifrost.colors.length;
        const colorMix = colorShift - Math.floor(colorShift);
        
        // Interpolate between rainbow colors
        const color1 = bifrost.colors[colorIndex];
        const color2 = bifrost.colors[nextColorIndex];
        
        ctx.globalAlpha = segment.alpha * pulse * intensityMultiplier;
        
        // Draw prismatic band
        const gradient = ctx.createLinearGradient(0, -segment.width / 2, 0, segment.width / 2);
        gradient.addColorStop(0, `${color1}00`);
        gradient.addColorStop(0.2, `${color1}88`);
        gradient.addColorStop(0.5, `${color2}cc`);
        gradient.addColorStop(0.8, `${color1}88`);
        gradient.addColorStop(1, `${color1}00`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(segment.distance - 8, -segment.width / 2, 16, segment.width);
        
        // Luminous edges
        ctx.strokeStyle = `${color2}99`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(segment.distance, -segment.width / 2);
        ctx.lineTo(segment.distance, segment.width / 2);
        ctx.stroke();
    });
    
    ctx.restore();
    ctx.restore();
}

// Draw sacred geometry
function drawSacredGeometry() {
    ctx.save();
    ctx.translate(width / 2 - cameraX * zoomLevel, height / 2 - cameraY * zoomLevel);
    ctx.scale(zoomLevel, zoomLevel);
    
    sacredPatterns.forEach(pattern => {
        pattern.rotation += pattern.rotationSpeed;
        
        ctx.save();
        ctx.translate(pattern.x, pattern.y);
        ctx.rotate(pattern.rotation);
        ctx.globalAlpha = pattern.alpha * intensityMultiplier;
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
        ctx.lineWidth = 1;
        
        // Hexagonal pattern
        ctx.beginPath();
        for (let i = 0; i <= pattern.sides; i++) {
            const angle = (i / pattern.sides) * Math.PI * 2;
            const x = Math.cos(angle) * pattern.radius;
            const y = Math.sin(angle) * pattern.radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Inner circle
        ctx.beginPath();
        ctx.arc(0, 0, pattern.radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();
        
        // Radial lines
        for (let i = 0; i < pattern.sides; i++) {
            const angle = (i / pattern.sides) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * pattern.radius * 0.6, Math.sin(angle) * pattern.radius * 0.6);
            ctx.stroke();
        }
        
        ctx.restore();
    });
    
    ctx.restore();
}

// Draw constellations
function drawConstellations() {
    ctx.save();
    ctx.translate(width / 2 - cameraX * zoomLevel * 0.7, height / 2 - cameraY * zoomLevel * 0.7);
    ctx.scale(zoomLevel, zoomLevel);
    
    constellations.forEach(constellation => {
        constellation.pulsePhase += constellation.pulseSpeed;
        
        // Calculate pulse based on echo activity
        const baseIntensity = 0.5;
        const echoInfluence = Math.min(echoRings.length / 30, 1) * 0.5;
        const pulse = Math.sin(constellation.pulsePhase) * 0.3 + 0.7;
        const intensity = (baseIntensity + echoInfluence) * pulse * intensityMultiplier;
        
        ctx.save();
        ctx.translate(constellation.x, constellation.y);
        
        // Draw constellation lines
        ctx.strokeStyle = `rgba(212, 175, 55, ${intensity * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        constellation.stars.forEach((star, i) => {
            if (i === 0) ctx.moveTo(star.x, star.y);
            else ctx.lineTo(star.x, star.y);
        });
        ctx.stroke();
        
        // Draw stars
        constellation.stars.forEach(star => {
            const brightness = star.brightness * intensity;
            
            // Star glow
            const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 4);
            glow.addColorStop(0, `rgba(255, 255, 200, ${brightness * 0.8})`);
            glow.addColorStop(0.5, `rgba(212, 175, 55, ${brightness * 0.4})`);
            glow.addColorStop(1, 'rgba(212, 175, 55, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Star core
            ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    });
    
    ctx.restore();
}

// Draw Heimdall
function drawHeimdall() {
    ctx.save();
    ctx.translate(width / 2 - cameraX * zoomLevel, height / 2 - cameraY * zoomLevel);
    ctx.scale(zoomLevel, zoomLevel);
    
    const glowPulse = Math.sin(time * 0.002) * 0.2 + 0.8;
    heimdall.glowIntensity = glowPulse;
    
    // Golden radiant aura
    const auraGradient = ctx.createRadialGradient(heimdall.x, heimdall.y, 0, heimdall.x, heimdall.y, heimdall.size * 3);
    auraGradient.addColorStop(0, `rgba(212, 175, 55, ${0.4 * glowPulse * intensityMultiplier})`);
    auraGradient.addColorStop(0.5, `rgba(255, 215, 100, ${0.2 * glowPulse * intensityMultiplier})`);
    auraGradient.addColorStop(1, 'rgba(212, 175, 55, 0)');
    ctx.fillStyle = auraGradient;
    ctx.beginPath();
    ctx.arc(heimdall.x, heimdall.y, heimdall.size * 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Heimdall's body (sentinel figure)
    ctx.globalAlpha = 0.9;
    
    // Body glow
    const bodyGradient = ctx.createRadialGradient(heimdall.x, heimdall.y, 0, heimdall.x, heimdall.y, heimdall.size);
    bodyGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    bodyGradient.addColorStop(0.5, 'rgba(212, 175, 55, 0.7)');
    bodyGradient.addColorStop(1, 'rgba(150, 120, 200, 0.5)');
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.ellipse(heimdall.x, heimdall.y + 10, heimdall.size * 0.6, heimdall.size * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Head
    ctx.fillStyle = 'rgba(255, 240, 200, 0.8)';
    ctx.beginPath();
    ctx.arc(heimdall.x, heimdall.y - heimdall.size * 0.7, heimdall.size * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    // Luminous outline
    ctx.strokeStyle = `rgba(212, 175, 55, ${0.8 * glowPulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(heimdall.x, heimdall.y + 10, heimdall.size * 0.6, heimdall.size * 0.9, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Listening rune glyphs around head
    const numGlyphs = 6;
    const glyphRadius = heimdall.size * 0.8;
    for (let i = 0; i < numGlyphs; i++) {
        const angle = (i / numGlyphs) * Math.PI * 2 + time * 0.001;
        const x = heimdall.x + Math.cos(angle) * glyphRadius;
        const y = heimdall.y - heimdall.size * 0.7 + Math.sin(angle) * glyphRadius;
        
        ctx.font = '16px serif';
        ctx.fillStyle = `rgba(212, 175, 55, ${0.6 * glowPulse})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(runeSymbols[i % runeSymbols.length], x, y);
    }
    
    ctx.restore();
}

// Create echo ring
function createEchoRing() {
    if (echoRings.length >= MAX_ECHO_RINGS) {
        echoRings.shift();
    }
    
    const colors = currentEchoType.colors;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    echoRings.push({
        x: heimdall.x,
        y: heimdall.y,
        radius: 5,
        alpha: 0.8,
        speed: currentEchoType.speed,
        color: color,
        type: currentEchoType.name
    });
    
    // Play subtle echo sound occasionally
    if (Math.random() < 0.15) {
        playEchoTypeSound(currentEchoType);
    }
    
    // Create rune on the ring
    if (Math.random() < 0.3) {
        createRune(heimdall.x, heimdall.y, color);
    }
}

// Create rune
function createRune(x, y, color) {
    runes.push({
        x: x,
        y: y,
        symbol: runeSymbols[Math.floor(Math.random() * runeSymbols.length)],
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        alpha: 1,
        size: 16 + Math.random() * 8,
        color: color,
        shimmerPhase: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02
    });
}

// Draw echo rings
function drawEchoRings() {
    ctx.save();
    ctx.translate(width / 2 - cameraX * zoomLevel, height / 2 - cameraY * zoomLevel);
    ctx.scale(zoomLevel, zoomLevel);
    
    echoRings.forEach(ring => {
        ring.radius += ring.speed;
        ring.alpha -= 0.006;
        
        if (ring.alpha > 0) {
            // Main ring
            ctx.strokeStyle = `${ring.color}${Math.floor(ring.alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = 2 * intensityMultiplier;
            ctx.beginPath();
            ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Inner glow
            ctx.strokeStyle = `rgba(255, 255, 255, ${ring.alpha * 0.4 * intensityMultiplier})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(ring.x, ring.y, ring.radius * 0.9, 0, Math.PI * 2);
            ctx.stroke();
        }
    });
    
    // Remove faded rings
    while (echoRings.length > 0 && echoRings[0].alpha <= 0) {
        echoRings.shift();
    }
    
    ctx.restore();
}

// Draw runes
function drawRunes() {
    ctx.save();
    ctx.translate(width / 2 - cameraX * zoomLevel, height / 2 - cameraY * zoomLevel);
    ctx.scale(zoomLevel, zoomLevel);
    
    runes.forEach((rune, index) => {
        rune.x += rune.vx;
        rune.y += rune.vy;
        rune.alpha -= 0.008;
        rune.shimmerPhase += 0.05;
        rune.rotation += rune.rotationSpeed;
        
        const shimmer = Math.sin(rune.shimmerPhase) * 0.3 + 0.7;
        const alpha = rune.alpha * shimmer * intensityMultiplier;
        
        if (alpha > 0) {
            ctx.save();
            ctx.translate(rune.x, rune.y);
            ctx.rotate(rune.rotation);
            
            // Rune glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = rune.color;
            
            ctx.font = `${rune.size}px serif`;
            ctx.fillStyle = `${rune.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(rune.symbol, 0, 0);
            
            ctx.shadowBlur = 0;
            ctx.restore();
        }
    });
    
    // Remove faded runes
    for (let i = runes.length - 1; i >= 0; i--) {
        if (runes[i].alpha <= 0) {
            runes.splice(i, 1);
        }
    }
    
    ctx.restore();
}

// Create spectral traveler
function createTraveler() {
    if (Math.random() < 0.3) {
        travelers.push({
            x: bifrost.x - 300,
            y: bifrost.y + (Math.random() - 0.5) * 100,
            vx: 2 + Math.random() * 1,
            vy: (Math.random() - 0.5) * 0.5,
            alpha: 0,
            fadeIn: true,
            size: 20 + Math.random() * 15,
            shimmerPhase: Math.random() * Math.PI * 2
        });
    }
}

// Draw spectral travelers
function drawTravelers() {
    ctx.save();
    ctx.translate(width / 2 - cameraX * zoomLevel, height / 2 - cameraY * zoomLevel);
    ctx.scale(zoomLevel, zoomLevel);
    
    travelers.forEach((traveler, index) => {
        traveler.x += traveler.vx;
        traveler.y += traveler.vy;
        traveler.shimmerPhase += 0.05;
        
        // Fade in/out
        if (traveler.fadeIn) {
            traveler.alpha += 0.02;
            if (traveler.alpha >= 0.6) traveler.fadeIn = false;
        } else {
            traveler.alpha -= 0.005;
        }
        
        const shimmer = Math.sin(traveler.shimmerPhase) * 0.2 + 0.8;
        const alpha = traveler.alpha * shimmer * intensityMultiplier;
        
        if (alpha > 0 && traveler.x < 500) {
            // Traveler glow
            const glow = ctx.createRadialGradient(traveler.x, traveler.y, 0, traveler.x, traveler.y, traveler.size);
            glow.addColorStop(0, `rgba(220, 220, 255, ${alpha})`);
            glow.addColorStop(0.5, `rgba(180, 180, 240, ${alpha * 0.5})`);
            glow.addColorStop(1, 'rgba(150, 150, 220, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(traveler.x, traveler.y, traveler.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Traveler silhouette
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
            ctx.beginPath();
            ctx.ellipse(traveler.x, traveler.y, traveler.size * 0.4, traveler.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    // Remove faded travelers
    for (let i = travelers.length - 1; i >= 0; i--) {
        if (travelers[i].alpha <= 0 || travelers[i].x > 500) {
            travelers.splice(i, 1);
        }
    }
    
    ctx.restore();
}

// Create horn blast and relic
function createHornBlast() {
    // Play horn blast sound with echo
    playHornBlast();
    
    // Create powerful echo burst
    for (let i = 0; i < 8; i++) {
        echoRings.push({
            x: heimdall.x,
            y: heimdall.y,
            radius: 10 + i * 5,
            alpha: 1,
            speed: 3 + i * 0.3,
            color: '#ffd700',
            type: 'horn'
        });
    }
    
    // Create relic
    createRelic();
    
    // Create particle burst
    for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2;
        particles.push({
            x: heimdall.x,
            y: heimdall.y,
            vx: Math.cos(angle) * (2 + Math.random() * 3),
            vy: Math.sin(angle) * (2 + Math.random() * 3),
            alpha: 1,
            size: 3 + Math.random() * 4,
            color: '#ffd700'
        });
    }
}

// Create relic
function createRelic() {
    if (relics.length >= MAX_RELICS) {
        relics.shift();
    }
    
    const relicTypes = ['gjallarhorn', 'runeCircle', 'vigilSigil'];
    const type = relicTypes[Math.floor(Math.random() * relicTypes.length)];
    
    relics.push({
        x: heimdall.x,
        y: heimdall.y,
        type: type,
        creationTime: time,
        intensity: 1.0,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.001,
        pulsePhase: Math.random() * Math.PI * 2,
        size: 30 + Math.random() * 20
    });
}

// Draw relics
function drawRelics() {
    ctx.save();
    ctx.translate(width / 2 - cameraX * zoomLevel, height / 2 - cameraY * zoomLevel);
    ctx.scale(zoomLevel, zoomLevel);
    
    relics.forEach((relic, index) => {
        const age = time - relic.creationTime;
        const ageSeconds = age / 1000;
        const ageFade = Math.max(0.3, 1 - (ageSeconds / 120));
        const pulse = Math.sin(time * 0.002 + relic.pulsePhase) * 0.2 + 0.8;
        const alpha = relic.intensity * ageFade * pulse * intensityMultiplier;
        
        relic.rotation += relic.rotationSpeed;
        
        ctx.save();
        ctx.translate(relic.x, relic.y);
        ctx.rotate(relic.rotation);
        ctx.globalAlpha = alpha;
        
        if (relic.type === 'gjallarhorn') {
            // Horn symbol
            ctx.strokeStyle = 'rgba(212, 175, 55, 0.8)';
            ctx.fillStyle = 'rgba(255, 215, 100, 0.2)';
            ctx.lineWidth = 2;
            
            // Horn spiral
            ctx.beginPath();
            for (let i = 0; i <= 20; i++) {
                const t = i / 20;
                const spiralAngle = t * Math.PI * 3;
                const spiralRadius = t * relic.size;
                const x = Math.cos(spiralAngle) * spiralRadius;
                const y = Math.sin(spiralAngle) * spiralRadius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            
            // Central glow
            const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, relic.size * 0.5);
            glow.addColorStop(0, 'rgba(255, 215, 100, 0.6)');
            glow.addColorStop(1, 'rgba(212, 175, 55, 0)');
            ctx.fillStyle = glow;
            ctx.fillRect(-relic.size * 0.5, -relic.size * 0.5, relic.size, relic.size);
            
        } else if (relic.type === 'runeCircle') {
            // Circle of runes
            ctx.strokeStyle = 'rgba(147, 112, 219, 0.7)';
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.arc(0, 0, relic.size, 0, Math.PI * 2);
            ctx.stroke();
            
            // Runes around circle
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const x = Math.cos(angle) * relic.size;
                const y = Math.sin(angle) * relic.size;
                
                ctx.font = '14px serif';
                ctx.fillStyle = 'rgba(212, 175, 55, 0.8)';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(runeSymbols[i % runeSymbols.length], x, y);
            }
            
            // Inner pattern
            ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(angle) * relic.size, Math.sin(angle) * relic.size);
                ctx.stroke();
            }
            
        } else if (relic.type === 'vigilSigil') {
            // Eye of vigilance
            ctx.strokeStyle = 'rgba(212, 175, 55, 0.8)';
            ctx.fillStyle = 'rgba(255, 215, 100, 0.15)';
            ctx.lineWidth = 2;
            
            // Outer diamond
            ctx.beginPath();
            ctx.moveTo(0, -relic.size);
            ctx.lineTo(relic.size * 0.7, 0);
            ctx.lineTo(0, relic.size);
            ctx.lineTo(-relic.size * 0.7, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Eye
            ctx.beginPath();
            ctx.ellipse(0, 0, relic.size * 0.4, relic.size * 0.25, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Pupil
            ctx.fillStyle = 'rgba(212, 175, 55, 0.9)';
            ctx.beginPath();
            ctx.arc(0, 0, relic.size * 0.15, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    });
    
    ctx.restore();
}

// Draw particles
function drawParticles() {
    ctx.save();
    ctx.translate(width / 2 - cameraX * zoomLevel, height / 2 - cameraY * zoomLevel);
    ctx.scale(zoomLevel, zoomLevel);
    
    particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.98;
        particle.vy *= 0.98;
        particle.alpha -= 0.015;
        
        if (particle.alpha > 0) {
            ctx.fillStyle = `${particle.color}${Math.floor(particle.alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    // Remove faded particles
    for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
        }
    }
    
    ctx.restore();
}

// Update Heimdall movement
function updateHeimdall(deltaTime) {
    const dx = heimdall.targetX - heimdall.x;
    const dy = heimdall.targetY - heimdall.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 2) {
        const moveSpeed = 0.08;
        heimdall.vx += (dx / dist) * moveSpeed;
        heimdall.vy += (dy / dist) * moveSpeed;
    }
    
    heimdall.vx *= 0.88;
    heimdall.vy *= 0.88;
    
    heimdall.x += heimdall.vx;
    heimdall.y += heimdall.vy;
    
    // Keep Heimdall near Bifröst
    heimdall.x = Math.max(-250, Math.min(50, heimdall.x));
    heimdall.y = Math.max(-150, Math.min(150, heimdall.y));
    
    // Camera follows
    cameraX += (heimdall.x - cameraX) * 0.03;
    cameraY += (heimdall.y - cameraY) * 0.03;
}

// Handle keyboard input
function handleInput() {
    const moveSpeed = 4;
    
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        heimdall.targetY -= moveSpeed;
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        heimdall.targetY += moveSpeed;
    }
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        heimdall.targetX -= moveSpeed;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        heimdall.targetX += moveSpeed;
    }
}

// Cycle echo type
function cycleEchoType(direction) {
    currentEchoIndex = (currentEchoIndex + direction + echoTypeKeys.length) % echoTypeKeys.length;
    currentEchoType = echoTypes[echoTypeKeys[currentEchoIndex]];
    
    // Update UI
    const indicator = document.getElementById('echoIndicator');
    if (indicator) {
        indicator.innerHTML = `Current Echo: <strong>${currentEchoType.name}</strong>`;
    }
}

// Animation loop
let lastTime = Date.now();
function animate() {
    if (!isPaused) {
        const currentTime = Date.now();
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        time = currentTime;
        
        zoomLevel += (targetZoom - zoomLevel) * 0.05;
        
        ctx.clearRect(0, 0, width, height);
        
        drawCosmos();
        drawStars();
        drawSacredGeometry();
        drawBifrost();
        drawConstellations();
        
        handleInput();
        updateHeimdall(deltaTime);
        
        // Auto-create echoes
        if (time - lastEchoTime > currentEchoType.interval) {
            createEchoRing();
            lastEchoTime = time;
        }
        
        // Occasionally spawn travelers
        if (time - lastTravelerTime > 3000 && Math.random() < 0.3) {
            createTraveler();
            lastTravelerTime = time;
        }
        
        drawEchoRings();
        drawRunes();
        drawTravelers();
        drawRelics();
        drawParticles();
        drawHeimdall();
    }
    
    requestAnimationFrame(animate);
}

// Event listeners
document.getElementById('intensitySlider').addEventListener('input', (e) => {
    intensityMultiplier = parseFloat(e.target.value);
});

document.getElementById('volumeSlider').addEventListener('input', (e) => {
    setVolume(parseFloat(e.target.value));
});

document.getElementById('muteBtn').addEventListener('click', () => {
    toggleMute();
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    isPaused = !isPaused;
    document.getElementById('pauseBtn').textContent = isPaused ? 'Play' : 'Pause';
    if (!isPaused) lastTime = Date.now();
});

document.getElementById('viewBtn').addEventListener('click', () => {
    toggleBirdsEye();
});

document.getElementById('resetBtn').addEventListener('click', () => {
    heimdall.x = -150;
    heimdall.y = 0;
    heimdall.targetX = -150;
    heimdall.targetY = 0;
    heimdall.vx = 0;
    heimdall.vy = 0;
    echoRings.length = 0;
    runes.length = 0;
    travelers.length = 0;
    relics.length = 0;
    particles.length = 0;
    cameraX = 0;
    cameraY = 0;
});

document.getElementById('infoBtn').addEventListener('click', () => {
    openArtistModal();
});

function toggleBirdsEye() {
    isBirdsEye = !isBirdsEye;
    if (isBirdsEye) {
        targetZoom = 0.35;
        document.getElementById('viewBtn').textContent = 'Normal View';
    } else {
        targetZoom = 1;
        document.getElementById('viewBtn').textContent = "Bird's Eye (V)";
    }
}

// Keyboard events
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        createHornBlast();
    }
    
    if (e.key === 'v' || e.key === 'V') {
        toggleBirdsEye();
    }
    
    if (e.key === 'p' || e.key === 'P') {
        document.getElementById('pauseBtn').click();
    }
    
    if (e.key === 'i' || e.key === 'I') {
        openArtistModal();
    }
    
    // Number keys for echo types
    if (e.key >= '1' && e.key <= '4') {
        const index = parseInt(e.key) - 1;
        if (index < echoTypeKeys.length) {
            currentEchoIndex = index;
            currentEchoType = echoTypes[echoTypeKeys[currentEchoIndex]];
            const indicator = document.getElementById('echoIndicator');
            if (indicator) {
                indicator.innerHTML = `Current Echo: <strong>${currentEchoType.name}</strong>`;
            }
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse click
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const worldX = ((mouseX - width / 2) / zoomLevel) + cameraX;
    const worldY = ((mouseY - height / 2) / zoomLevel) + cameraY;
    
    // Keep within bounds
    heimdall.targetX = Math.max(-250, Math.min(50, worldX));
    heimdall.targetY = Math.max(-150, Math.min(150, worldY));
});

// Window resize
window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
});

// Start experience
function startExperience() {
    document.getElementById('introOverlay').classList.add('hidden');
    document.getElementById('infoPanel').style.display = 'block';
    document.getElementById('instructions').style.display = 'block';
    document.getElementById('controlsContainer').style.display = 'flex';
    
    // Initialize audio system on user interaction
    initAudioSystem();
}

// Artist modal controls
function openArtistModal() {
    document.getElementById('artistModal').classList.add('active');
}

function closeArtistModal() {
    document.getElementById('artistModal').classList.remove('active');
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeArtistModal();
    }
});

document.getElementById('artistModal').addEventListener('click', (e) => {
    if (e.target.id === 'artistModal') {
        closeArtistModal();
    }
});

window.startExperience = startExperience;
window.openArtistModal = openArtistModal;
window.closeArtistModal = closeArtistModal;

// Initialize and start
initScene();
animate();