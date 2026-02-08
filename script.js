import * as THREE from "three";

/* ================================================================
script.js
   ================================================================ */

/* ===== Custom Cursor ===== */
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
let cursorX = 0,
    cursorY = 0;
let ringX = 0,
    ringY = 0;

if (cursorDot && cursorRing) {
    document.addEventListener("mousemove", (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        cursorDot.style.transform = `translate(${cursorX - 4}px, ${cursorY - 4}px)`;
    });

    function animateCursor() {
        ringX += (cursorX - ringX) * 0.12;
        ringY += (cursorY - ringY) * 0.12;
        cursorRing.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover state for interactive elements
    const hoverTargets = document.querySelectorAll(
        "a, button, .card, .connect-link, .btn-primary, .btn-outline, .btn-sm, .nav-cta",
    );
    hoverTargets.forEach((el) => {
        el.addEventListener("mouseenter", () =>
            cursorRing.classList.add("hover"),
        );
        el.addEventListener("mouseleave", () =>
            cursorRing.classList.remove("hover"),
        );
    });
}

/* ===== Film Grain ===== */
function initGrain() {
    const canvas = document.getElementById("grain-overlay");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function renderGrain() {
        const w = canvas.width;
        const h = canvas.height;
        const imageData = ctx.createImageData(w, h);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const v = Math.random() * 255;
            data[i] = v;
            data[i + 1] = v;
            data[i + 2] = v;
            data[i + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
        requestAnimationFrame(renderGrain);
    }
    renderGrain();
}
initGrain();

/* ===== Navigation & Scroll Logic ===== */
const navLinks = document.querySelectorAll(".nav-link");
const headerLinks = document.querySelectorAll(
    '.nav-link-header, a[href="#projects"], a[href="#contact"]',
);
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const mobileMenu = document.getElementById("mobile-menu");
const sections = document.querySelectorAll("section[id]");
const headerOffset = 80;
const homeSection = document.getElementById("home");
const threeCanvas = document.getElementById("pagoda-canvas");
const header = document.querySelector("header");

function updateActiveLink(targetId) {
    navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === targetId) {
            link.classList.add("active");
        }
    });
}

// Navigation clicks
[...navLinks, ...headerLinks].forEach((link) => {
    link.addEventListener("click", () => {
        if (mobileMenu) mobileMenu.classList.add("hidden");
    });
});

// Scroll listener
let lastScrollY = 0;
let ticking = false;

function onScroll() {
    const scrollY = window.scrollY;
    let current = "";

    // Header state
    if (header) {
        if (scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    }

    // Active section detection
    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (scrollY >= sectionTop - headerOffset - 100) {
            current = "#" + section.getAttribute("id");
        }
    });

    // Parallax for 3D canvas
    if (homeSection && threeCanvas && scrollY < homeSection.offsetHeight) {
        const progress = scrollY / homeSection.offsetHeight;
        threeCanvas.style.transform = `translateY(${scrollY * 0.3}px) scale(${1 + progress * 0.05})`;
        threeCanvas.style.opacity = Math.max(0, 0.6 - progress * 0.8);
    }

    if (current) {
        updateActiveLink(current);
    }

    ticking = false;
}

window.addEventListener("scroll", () => {
    lastScrollY = window.scrollY;
    if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
    }
});

// Mobile menu toggle
if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
    });
}

// Copyright year
const yearEl = document.getElementById("copyright-year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ===== Scroll Reveal Animations (IntersectionObserver) ===== */
function initScrollReveal() {
    const reveals = document.querySelectorAll(
        ".reveal, .reveal-scale, .fade-in-section, .flip-in-card",
    );

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                }
            });
        },
        {
            root: null,
            rootMargin: "0px 0px -60px 0px",
            threshold: 0.1,
        },
    );

    reveals.forEach((el) => observer.observe(el));
}
initScrollReveal();

/* ===== Card Mouse Tracking (Spotlight Effect) ===== */
function initCardSpotlight() {
    const cards = document.querySelectorAll(".card");

    cards.forEach((card) => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty("--mouse-x", x + "%");
            card.style.setProperty("--mouse-y", y + "%");
        });
    });
}
initCardSpotlight();

/* ===== Stagger Index Assignment ===== */
function initStagger() {
    const staggerContainers = document.querySelectorAll("[data-stagger]");
    staggerContainers.forEach((container) => {
        const children = container.querySelectorAll(
            ".reveal, .flip-in-card, .fade-in-section",
        );
        children.forEach((child, i) => {
            child.style.setProperty("--i", i);
        });
    });
}
initStagger();

/* ===== Magnetic Button Effect ===== */
function initMagneticButtons() {
    const magnetics = document.querySelectorAll(".magnetic-wrap");

    magnetics.forEach((el) => {
        el.addEventListener("mousemove", (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });

        el.addEventListener("mouseleave", () => {
            el.style.transform = "translate(0, 0)";
        });
    });
}
initMagneticButtons();

/* ===== Hero Entrance Sequence ===== */
function initHeroEntrance() {
    const hero = document.getElementById("home");
    if (!hero) return;

    // Trigger after preloader
    setTimeout(() => {
        hero.classList.add("hero-loaded");
    }, 2200);
}
initHeroEntrance();

/* ===== Smooth Counter Animation ===== */
function animateCounters() {
    const counters = document.querySelectorAll("[data-count]");

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.getAttribute("data-count"));
                    const duration = 2000;
                    const start = performance.now();

                    function update(now) {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        // Ease out expo
                        const eased = 1 - Math.pow(1 - progress, 3);
                        el.textContent = Math.round(target * eased);

                        if (progress < 1) {
                            requestAnimationFrame(update);
                        } else {
                            el.textContent = target;
                        }
                    }
                    requestAnimationFrame(update);
                    observer.unobserve(el);
                }
            });
        },
        { threshold: 0.5 },
    );

    counters.forEach((c) => observer.observe(c));
}
animateCounters();

/* ===== Three.js Scene (Crystal & Petals) ===== */
let scene, camera, renderer, crystal, petals, innerCrystal;
const canvasContainer = document.getElementById("pagoda-canvas");

let targetRotationX = 0;
let targetRotationY = 0;
const rotationSpeed = 0.003;
const followDamping = 0.04;

function initThreeJS() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
    );
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    if (canvasContainer) {
        canvasContainer.appendChild(renderer.domElement);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(0xfbcfe8, 0x1a0011, 0.8);
    scene.add(hemisphereLight);

    const pointLight = new THREE.PointLight(0xf472b6, 1.5, 15);
    pointLight.position.set(3, 3, 3);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xec4899, 1, 12);
    pointLight2.position.set(-3, -2, 2);
    scene.add(pointLight2);

    // Crystal (Wireframe Icosahedron) — outer
    const crystalGeo = new THREE.IcosahedronGeometry(2, 1);
    const crystalMat = new THREE.MeshStandardMaterial({
        color: 0xf472b6,
        emissive: 0xec4899,
        emissiveIntensity: 0.4,
        wireframe: true,
        transparent: true,
        opacity: 0.5,
    });
    crystal = new THREE.Mesh(crystalGeo, crystalMat);
    scene.add(crystal);

    // Inner crystal — solid with low opacity for depth
    const innerGeo = new THREE.IcosahedronGeometry(1.2, 0);
    const innerMat = new THREE.MeshStandardMaterial({
        color: 0xf472b6,
        emissive: 0xec4899,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.15,
        roughness: 0.2,
        metalness: 0.8,
    });
    innerCrystal = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerCrystal);

    // Create Sakura Petals
    createPetals();

    // Event Listeners
    window.addEventListener("mousemove", onMouseMoveParallax, false);
    window.addEventListener("resize", onWindowResize);

    animate();
}

function createPetals() {
    const petalCount = 600;
    const vertices = [];
    const sizes = [];

    for (let i = 0; i < petalCount; i++) {
        const x = (Math.random() - 0.5) * 25;
        const y = Math.random() * 25 - 12.5;
        const z = (Math.random() - 0.5) * 25;
        vertices.push(x, y, z);
        sizes.push(Math.random() * 0.03 + 0.01);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3),
    );

    const material = new THREE.PointsMaterial({
        color: 0xfbcfe8,
        size: 0.025,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
    });

    petals = new THREE.Points(geometry, material);
    scene.add(petals);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMoveParallax(event) {
    const normalizedX = (event.clientX / window.innerWidth) * 2 - 1;
    const normalizedY = (event.clientY / window.innerHeight) * 2 - 1;
    targetRotationY = normalizedX * -0.4;
    targetRotationX = normalizedY * -0.4;
}

// Touch parallax disabled — conflicts with native scroll on mobile.
// Crystal uses device orientation or stays in its default rotation on touch devices.

function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.0001;

    if (crystal) {
        // Slow passive rotation
        crystal.rotation.x += rotationSpeed * 0.08;
        crystal.rotation.y += rotationSpeed * 0.12;

        // Mouse follow with damping
        crystal.rotation.x +=
            (targetRotationX - crystal.rotation.x) * followDamping;
        crystal.rotation.y +=
            (targetRotationY - crystal.rotation.y) * followDamping;

        // Gentle breathing scale
        const breathe = Math.sin(time * 8) * 0.02 + 1;
        crystal.scale.set(breathe, breathe, breathe);
    }

    if (innerCrystal) {
        // Counter-rotate for depth
        innerCrystal.rotation.x -= rotationSpeed * 0.05;
        innerCrystal.rotation.y -= rotationSpeed * 0.08;
        innerCrystal.rotation.x +=
            (targetRotationX * 0.6 - innerCrystal.rotation.x) *
            followDamping *
            0.5;
        innerCrystal.rotation.y +=
            (targetRotationY * 0.6 - innerCrystal.rotation.y) *
            followDamping *
            0.5;

        const breathe2 = Math.sin(time * 10 + 1) * 0.03 + 1;
        innerCrystal.scale.set(breathe2, breathe2, breathe2);
    }

    // Animate petals
    if (petals) {
        const positions = petals.geometry.attributes.position.array;

        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] -= 0.008;
            positions[i] +=
                Math.sin(positions[i + 1] * 0.4 + time * 5) * 0.0015;
            positions[i + 2] +=
                Math.cos(positions[i + 1] * 0.3 + time * 5) * 0.0015;

            if (positions[i + 1] < -12.5) {
                positions[i + 1] = 12.5;
                positions[i] = (Math.random() - 0.5) * 25;
                positions[i + 2] = (Math.random() - 0.5) * 25;
            }
        }
        petals.geometry.attributes.position.needsUpdate = true;

        // Slow rotation of entire particle system
        petals.rotation.y += 0.0002;
    }

    renderer.render(scene, camera);
}

// Initialize Three.js
if (canvasContainer) {
    initThreeJS();
}

/* ===== Preloader Logic ===== */
window.addEventListener("load", () => {
    const preloader = document.getElementById("preloader");
    if (preloader) {
        // Wait for preloader bar animation
        setTimeout(() => {
            preloader.classList.add("loaded");
            setTimeout(() => {
                preloader.remove();
            }, 800);
        }, 2000);
    }
});

/* ===== Smooth Scroll for anchor links ===== */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            const top =
                target.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({
                top: top,
                behavior: "smooth",
            });
        }
    });
});
