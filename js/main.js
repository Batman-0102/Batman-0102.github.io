/* Portfolio Website Main JavaScript */

import * as THREE from 'three';

/* ===== Navigation & Scroll Logic ===== */
const navLinks = document.querySelectorAll('.nav-link');
const headerLinks = document.querySelectorAll('.nav-link-header, a[href="#experience"], a[href="#contact"]');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const sections = document.querySelectorAll('section[id]'); 
const headerOffset = 70;
const homeSection = document.getElementById('home');
const canvas = document.getElementById('pagoda-canvas');

function updateActiveLink(targetId) {
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === targetId) {
            link.classList.add('active');
        }
    });
}

// Handle navigation clicks
[...navLinks, ...headerLinks].forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
});

// Scroll listener to update active link and parallax
window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.scrollY;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= sectionTop - headerOffset) {
            current = '#' + section.getAttribute('id');
        }
    });

    // Parallax Effect for 3D canvas (vertical position)
    if (scrollY < homeSection.offsetHeight) {
        if (canvas) {
            canvas.style.transform = `translateY(${scrollY * 0.4}px)`;
            canvas.style.opacity = 0.7 - (scrollY / (homeSection.offsetHeight * 0.8));
        }
    }

    if (current) {
         updateActiveLink(current);
    }
});

// Mobile menu toggle
mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Set current year in footer
document.getElementById('copyright-year').textContent = new Date().getFullYear();

/* ===== Scroll Fade-In/Flip-In Animation ===== */
const sectionsToAnimate = document.querySelectorAll('.fade-in-section, .flip-in-card');

const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // observer.unobserve(entry.target); // Uncomment to run animation only once
        }
    });
}, observerOptions);

sectionsToAnimate.forEach(section => {
    observer.observe(section);
});


/* ===== Three.js Scene (Crystal & Petals) ===== */
let scene, camera, renderer, crystal, petals;
const canvasContainer = document.getElementById('pagoda-canvas');

// --- New Variables for Mouse Follow ---
let targetRotationX = 0;
let targetRotationY = 0;
const rotationSpeed = 0.005; 
const followDamping = 0.05; // How quickly the object follows the mouse

function initThreeJS() {
    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    if (canvasContainer) {
        canvasContainer.appendChild(renderer.domElement);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const hemisphereLight = new THREE.HemisphereLight(0xfbcfe8, 0x330011, 1);
    scene.add(hemisphereLight);

    // Create Crystal (Wireframe Icosahedron)
    const crystalGeo = new THREE.IcosahedronGeometry(2, 0);
    const crystalMat = new THREE.MeshStandardMaterial({ 
        color: 0xf472b6,
        emissive: 0xec4899,
        emissiveIntensity: 1,
        wireframe: true,
        transparent: true,
        opacity: 0.8
    });
    crystal = new THREE.Mesh(crystalGeo, crystalMat);
    scene.add(crystal);

    // Create Sakura Petals (Particle System)
    createPetals();

    // Event Listeners for Parallax Rotation
    window.addEventListener('mousemove', onMouseMoveParallax, false);
    window.addEventListener('touchmove', onTouchMoveParallax, false);
    window.addEventListener('resize', onWindowResize);
    
    // Start animation
    animate();
}

function createPetals() {
    const petalCount = 500;
    const vertices = [];
    for (let i = 0; i < petalCount; i++) {
        const x = (Math.random() - 0.5) * 20; 
        const y = Math.random() * 20 - 10; 
        const z = (Math.random() - 0.5) * 20; 
        vertices.push(x, y, z);
    }
    
    const geometry = new THREE.BufferGeometry();
    // Corrected Buffer Attribute
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0xfbcfe8,
        size: 0.03,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    petals = new THREE.Points(geometry, material);
    scene.add(petals);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Calculates target rotation based on normalized mouse position.
 */
function onMouseMoveParallax(event) {
    // Normalize mouse position (-1 to 1)
    const normalizedX = (event.clientX / window.innerWidth) * 2 - 1;
    const normalizedY = (event.clientY / window.innerHeight) * 2 - 1;

    // X mouse movement controls Y rotation, Y mouse movement controls X rotation
    // The scaling factor (0.5) determines the maximum rotation offset.
    targetRotationY = normalizedX * -0.5; 
    targetRotationX = normalizedY * -0.5; 
}

/**
 * Calculates target rotation based on normalized touch position.
 */
function onTouchMoveParallax(event) {
    if (event.touches.length === 1) {
        const touch = event.touches[0];
        const normalizedX = (touch.clientX / window.innerWidth) * 2 - 1;
        const normalizedY = (touch.clientY / window.innerHeight) * 2 - 1;

        targetRotationY = normalizedX * -0.5;
        targetRotationX = normalizedY * -0.5;
        event.preventDefault(); // Prevent scrolling while interacting
    }
}


function animate() {
    requestAnimationFrame(animate);
    
    if (crystal) {
        // 1. Passive continuous rotation (slow)
        crystal.rotation.x += rotationSpeed * 0.05;
        crystal.rotation.y += rotationSpeed * 0.1;
        
        // 2. Mouse Parallax/Follow Effect: Interpolate towards target
        // This creates a smooth, dampened rotation as the mouse moves.
        crystal.rotation.x += (targetRotationX - crystal.rotation.x) * followDamping;
        crystal.rotation.y += (targetRotationY - crystal.rotation.y) * followDamping;
    }

    // Animate petals (falling and swirling)
    if (petals) {
        const positions = petals.geometry.attributes.position.array;
        const time = Date.now() * 0.0001;
        
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] -= 0.01; 
            
            positions[i] += Math.sin(positions[i + 1] * 0.5 + time) * 0.002;
            positions[i + 2] += Math.cos(positions[i + 1] * 0.4 + time) * 0.002;
            
            // Reset at bottom
            if (positions[i + 1] < -10) { 
                positions[i + 1] = 10;
                positions[i] = (Math.random() - 0.5) * 20;
                positions[i + 2] = (Math.random() - 0.5) * 20;
            }
        }
        petals.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
}

// Initialize Three.js on load
if (canvasContainer) {
    initThreeJS();
}

/* ===== Preloader Logic ===== */
window.onload = () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('loaded');
        
        setTimeout(() => {
            if (preloader) {
                preloader.remove();
            }
        }, 600);
    }
};
