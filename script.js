/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/JavaScript.js to edit this template
 */
/* ============================================================
 KOLISANG PHATELA — PORTFOLIO JAVASCRIPT
 Handles: reveal animations, navbar scroll state,
 mobile menu, particle canvas, active nav links
 ============================================================ */

/* ============================================================
 1. NAVBAR — scroll state + mobile menu toggle
 ============================================================ */

const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

/* Add .scrolled class to navbar once user scrolls past 50px */
function handleNavScroll() {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}
window.addEventListener('scroll', handleNavScroll, {passive: true});
handleNavScroll(); // run once on load in case page is already scrolled

/* Mobile hamburger toggle */
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
    // Prevent body scroll when menu is open
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

/* Close mobile menu when a link is clicked */
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
    });
});

/* ============================================================
 2. REVEAL ON SCROLL — Intersection Observer
 ============================================================ */

/*
 * All elements with class .reveal start at opacity:0 + translateY(28px).
 * When they enter the viewport, we add .visible which transitions them in.
 * Hero elements are triggered immediately on page load.
 */

const revealObserver = new IntersectionObserver(
        (entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Once revealed, stop observing to save resources
            revealObserver.unobserve(entry.target);
        }
    });
},
        {
            threshold: 0.12, // trigger when 12% of element is visible
            rootMargin: '0px 0px -40px 0px' // slight offset from bottom
        }
);

/* Observe every .reveal element */
document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
});

/*
 * HERO FIX: Hero elements need to animate in immediately on load
 * because they're already in the viewport — the observer fires, but
 * we also trigger manually to guarantee they show on first paint.
 */
function revealHeroElements() {
    document.querySelectorAll('#hero .reveal').forEach((el, i) => {
        // Slight stagger per element using its existing delay class
        setTimeout(() => {
            el.classList.add('visible');
        }, i * 120);
    });
}

/* Run hero reveal as soon as DOM is ready */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', revealHeroElements);
} else {
    revealHeroElements();
}

/* ============================================================
 3. ACTIVE NAV LINK — highlight current section
 ============================================================ */

const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver(
        (entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navAnchors.forEach(a => {
                a.classList.remove('active');
                if (a.getAttribute('href') === `#${id}`) {
                    a.classList.add('active');
                }
            });
        }
    });
},
        {threshold: 0.4}
);

sections.forEach(s => sectionObserver.observe(s));

/* Style the active nav link with amber colour */
const activeNavStyle = document.createElement('style');
activeNavStyle.textContent = `
    .nav-links a.active {
        color: var(--text-primary) !important;
    }
    .nav-links a.active::after {
        width: 100% !important;
    }
`;
document.head.appendChild(activeNavStyle);

/* ============================================================
 4. HERO PARTICLE CANVAS — subtle floating dots
 ============================================================ */

(function initParticles() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas)
        return;

    const ctx = canvas.getContext('2d');
    let W, H, particles = [];
    const COUNT = 55;       // number of particles
    const AMBER = '212, 168, 67'; // RGB for var(--accent)

    /* Resize canvas to fill hero section */
    function resize() {
        const hero = document.getElementById('hero');
        W = canvas.width = hero.offsetWidth;
        H = canvas.height = hero.offsetHeight;
    }

    /* Particle factory */
    function createParticle() {
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 1.5 + 0.3, // radius 0.3–1.8px
            vx: (Math.random() - 0.5) * 0.3, // horizontal drift
            vy: -(Math.random() * 0.25 + 0.08), // slow upward float
            alpha: Math.random() * 0.45 + 0.05, // opacity 0.05–0.5
        };
    }

    /* Build initial particle pool */
    function buildParticles() {
        particles = [];
        for (let i = 0; i < COUNT; i++) {
            const p = createParticle();
            p.y = Math.random() * H; // scatter across full height on init
            particles.push(p);
        }
    }

    /* Draw a single frame */
    function draw() {
        ctx.clearRect(0, 0, W, H);

        particles.forEach(p => {
            // Move
            p.x += p.vx;
            p.y += p.vy;

            // Wrap horizontally
            if (p.x < -5)
                p.x = W + 5;
            if (p.x > W + 5)
                p.x = -5;

            // Recycle when floated off top
            if (p.y < -5) {
                Object.assign(p, createParticle());
                p.y = H + 5;
            }

            // Gentle pulse on alpha
            p.alpha += Math.sin(Date.now() * 0.001 + p.x) * 0.002;
            p.alpha = Math.max(0.02, Math.min(0.55, p.alpha));

            // Draw dot
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${AMBER}, ${p.alpha})`;
            ctx.fill();
        });

        requestAnimationFrame(draw);
    }

    /* Initialise */
    resize();
    buildParticles();
    draw();

    /* Re-size on window resize (debounced) */
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resize();
            buildParticles();
        }, 180);
    });
})();

/* ============================================================
 5. SMOOTH SCROLL — polyfill for browsers that ignore CSS
 ============================================================ */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target)
            return;
        e.preventDefault();
        const offset = navbar ? navbar.offsetHeight : 72;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({top, behavior: 'smooth'});
    });
});

/* ============================================================
 6. SKILL TAG & STAT CARD — subtle stagger on hover entry
 ============================================================ */

/* Stagger skill tags inside each group when the group is hovered */
document.querySelectorAll('.skill-group').forEach(group => {
    group.addEventListener('mouseenter', () => {
        group.querySelectorAll('.skill-tag').forEach((tag, i) => {
            tag.style.transitionDelay = `${i * 35}ms`;
        });
    });
    group.addEventListener('mouseleave', () => {
        group.querySelectorAll('.skill-tag').forEach(tag => {
            tag.style.transitionDelay = '0ms';
        });
    });
});

/* ============================================================
 7. CURSOR GLOW — subtle amber glow follows mouse in hero
 ============================================================ */

(function initCursorGlow() {
    const hero = document.getElementById('hero');
    if (!hero)
        return;

    // Create the glow element
    const glow = document.createElement('div');
    glow.style.cssText = `
        position: absolute;
        width: 320px;
        height: 320px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(212,168,67,0.07) 0%, transparent 70%);
        pointer-events: none;
        transform: translate(-50%, -50%);
        transition: left 0.18s ease, top 0.18s ease;
        z-index: 0;
    `;
    hero.appendChild(glow);

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        glow.style.left = (e.clientX - rect.left) + 'px';
        glow.style.top = (e.clientY - rect.top) + 'px';
    });
})();

/* ============================================================
 8. FOOTER YEAR — keep copyright year current automatically
 ============================================================ */

const footerCopy = document.querySelector('.footer-copy');
if (footerCopy) {
    footerCopy.innerHTML = footerCopy.innerHTML.replace(
            /\d{4}/,
            new Date().getFullYear()
            );
}

/* ============================================================
 9. PAGE LOAD FADE-IN — body fades from black on first load
 ============================================================ */

document.documentElement.style.opacity = '0';
document.documentElement.style.transition = 'opacity 0.5s ease';

window.addEventListener('load', () => {
    document.documentElement.style.opacity = '1';
});

