/**
 * MOHAMMAD FAYAZ — PREMIUM EDITORIAL 3D PORTFOLIO
 * Core Engine: Lenis Smooth Scroll + GSAP ScrollTrigger + 3D Spatial Transforms
 */

(function () {
    'use strict';

    // -------------------------------------------------------------------------
    // 1. ENVIRONMENT & FEATURE DETECTION
    // -------------------------------------------------------------------------
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hasGSAP = typeof gsap !== 'undefined';
    const hasScrollTrigger = typeof ScrollTrigger !== 'undefined';
    const hasLenis = typeof Lenis !== 'undefined';

    // -------------------------------------------------------------------------
    // 2. LENIS SMOOTH SCROLL & GSAP TICKER SYNCHRONIZATION
    // -------------------------------------------------------------------------
    let lenis = null;

    if (hasGSAP && hasScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
    }

    if (hasLenis && !prefersReducedMotion) {
        try {
            lenis = new Lenis({
                duration: 1.15,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true,
                wheelMultiplier: 0.95,
                touchMultiplier: 1.5,
                infinite: false,
            });

            // Synchronize Lenis scroll position with GSAP ScrollTrigger
            lenis.on('scroll', ScrollTrigger.update);

            // Connect Lenis RAF to GSAP's internal ticker loop
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });

            // Turn off GSAP lag smoothing to maintain fluid synchronization
            gsap.ticker.lagSmoothing(0);
        } catch (e) {
            console.warn('[Portfolio] Lenis initialization skipped:', e);
        }
    }

    // -------------------------------------------------------------------------
    // 3. SEAMLESS ANCHOR NAVIGATION (Lenis Synchronized)
    // -------------------------------------------------------------------------
    function initAnchorNavigation() {
        const navAnchors = document.querySelectorAll('a[href^="#"]');

        navAnchors.forEach((anchor) => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href');
                if (!targetId || targetId === '#') return;

                const targetElement = document.querySelector(targetId);
                if (!targetElement) return;

                e.preventDefault();

                // Close mobile menu if open
                closeMobileMenu();

                // Scroll to target smoothly with offset for sticky header
                const headerOffset = 76;
                if (lenis) {
                    lenis.scrollTo(targetElement, {
                        offset: -headerOffset,
                        duration: 1.25,
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                    });
                } else {
                    const elemTop = targetElement.getBoundingClientRect().top + window.pageYOffset - headerOffset;
                    window.scrollTo({
                        top: elemTop,
                        behavior: 'smooth',
                    });
                }
            });
        });
    }

    // -------------------------------------------------------------------------
    // 4. HEADER DYNAMICS & BACK-TO-TOP BUTTON
    // -------------------------------------------------------------------------
    const header = document.getElementById('header');
    const floatingBackTop = document.getElementById('floatingBackTop');
    const footerBackTop = document.getElementById('backToTop');

    function handleScrollState() {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;

        // Sticky Header styling on scroll
        if (header) {
            if (scrollY > 30) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Floating Back-to-Top Button visibility
        if (floatingBackTop) {
            if (scrollY > 380) {
                floatingBackTop.classList.add('visible');
            } else {
                floatingBackTop.classList.remove('visible');
            }
        }
    }

    window.addEventListener('scroll', handleScrollState, { passive: true });

    function scrollToTop() {
        if (lenis) {
            lenis.scrollTo(0, {
                duration: 1.4,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            });
        } else {
            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        }
    }

    if (floatingBackTop) {
        floatingBackTop.addEventListener('click', scrollToTop);
    }
    if (footerBackTop) {
        footerBackTop.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToTop();
        });
    }

    // -------------------------------------------------------------------------
    // 5. ACTIVE NAVIGATION SPY (Intersection Observer)
    // -------------------------------------------------------------------------
    function initActiveNavSpy() {
        const sections = document.querySelectorAll('section[id]');
        const desktopLinks = document.querySelectorAll('.nav-links .nav-link');

        if (!sections.length || !desktopLinks.length) return;

        const observerOptions = {
            root: null,
            rootMargin: '-30% 0px -50% 0px',
            threshold: 0,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const activeId = entry.target.getAttribute('id');
                    desktopLinks.forEach((link) => {
                        if (link.getAttribute('href') === `#${activeId}`) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach((section) => observer.observe(section));
    }

    // -------------------------------------------------------------------------
    // 6. MOBILE NAVIGATION DRAWER
    // -------------------------------------------------------------------------
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    function openMobileMenu() {
        if (!mobileMenu || !mobileToggle) return;
        mobileToggle.setAttribute('aria-expanded', 'true');
        mobileMenu.setAttribute('aria-hidden', 'false');
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        if (!mobileMenu || !mobileToggle) return;
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
            if (isExpanded) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) {
            closeMobileMenu();
        }
    });

    // -------------------------------------------------------------------------
    // 7. AMBIENT CURSOR GLOW (Desktop Fine Pointer Only)
    // -------------------------------------------------------------------------
    function initCursorGlow() {
        const cursorGlow = document.getElementById('cursorGlow');
        if (!cursorGlow || hasTouch || prefersReducedMotion) return;

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let currentX = mouseX;
        let currentY = mouseY;
        let isMoving = false;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!isMoving) {
                isMoving = true;
                cursorGlow.classList.add('active');
            }
        }, { passive: true });

        // Smooth Lerp animation frame
        function animateCursor() {
            currentX += (mouseX - currentX) * 0.12;
            currentY += (mouseY - currentY) * 0.12;
            cursorGlow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
            requestAnimationFrame(animateCursor);
        }

        requestAnimationFrame(animateCursor);
    }

    // -------------------------------------------------------------------------
    // 8. HERO 3D SPATIAL STAGE (Interactive Mouse Reactive Parallax)
    // -------------------------------------------------------------------------
    function initHero3DParallax() {
        const visualWrapper = document.getElementById('heroVisualWrapper');
        const spatialStage = document.getElementById('spatialStage');
        const monogram = document.getElementById('monogramSculpture');
        const card1 = document.getElementById('floatCard1');
        const card2 = document.getElementById('floatCard2');
        const card3 = document.getElementById('floatCard3');

        if (!visualWrapper || !spatialStage || prefersReducedMotion || hasTouch) return;

        let targetRotateX = 0;
        let targetRotateY = 0;
        let currentRotateX = 0;
        let currentRotateY = 0;

        visualWrapper.addEventListener('mousemove', (e) => {
            const rect = visualWrapper.getBoundingClientRect();
            const relX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
            const relY = (e.clientY - rect.top) / rect.height - 0.5;

            targetRotateY = relX * 22; // max ±11 degrees
            targetRotateX = -relY * 18; // max ±9 degrees
        }, { passive: true });

        visualWrapper.addEventListener('mouseleave', () => {
            targetRotateX = 0;
            targetRotateY = 0;
        });

        function render3DStage() {
            currentRotateX += (targetRotateX - currentRotateX) * 0.08;
            currentRotateY += (targetRotateY - currentRotateY) * 0.08;

            spatialStage.style.transform = `rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg)`;

            if (monogram) {
                monogram.style.transform = `translateZ(35px) rotateX(${(-currentRotateX * 0.4).toFixed(2)}deg) rotateY(${(-currentRotateY * 0.4).toFixed(2)}deg)`;
            }

            if (card1) {
                card1.style.transform = `translateZ(70px) translateX(${(currentRotateY * 1.2).toFixed(1)}px) translateY(${(-currentRotateX * 1.2).toFixed(1)}px)`;
            }
            if (card2) {
                card2.style.transform = `translateZ(85px) translateX(${(-currentRotateY * 1.4).toFixed(1)}px) translateY(${(currentRotateX * 1.4).toFixed(1)}px)`;
            }
            if (card3) {
                card3.style.transform = `translateZ(50px) translateX(${(currentRotateY * 0.8).toFixed(1)}px)`;
            }

            requestAnimationFrame(render3DStage);
        }

        requestAnimationFrame(render3DStage);
    }

    // -------------------------------------------------------------------------
    // 9. PROJECT CARDS 3D TILT EFFECT
    // -------------------------------------------------------------------------
    function initProjectCard3DTilt() {
        const tiltCards = document.querySelectorAll('.project-card-tilt');
        if (!tiltCards.length || prefersReducedMotion || hasTouch) return;

        tiltCards.forEach((card) => {
            let rafId = null;

            card.addEventListener('mousemove', (e) => {
                if (rafId) cancelAnimationFrame(rafId);

                rafId = requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    // Calculate subtle tilt angle (-8deg to +8deg)
                    const rotateX = ((y - centerY) / centerY) * -7;
                    const rotateY = ((x - centerX) / centerX) * 7;

                    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;

                    // Dynamic glow highlight position
                    const cardGlow = card.querySelector('.card-glow');
                    if (cardGlow) {
                        cardGlow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(215, 108, 69, 0.08) 0%, transparent 60%)`;
                    }
                });
            }, { passive: true });

            card.addEventListener('mouseleave', () => {
                if (rafId) cancelAnimationFrame(rafId);
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            });
        });
    }

    // -------------------------------------------------------------------------
    // 10. GSAP SCROLL ANIMATIONS & SCROLLTRIGGER
    // -------------------------------------------------------------------------
    function initGSAPAnimations() {
        if (!hasGSAP || prefersReducedMotion) return;

        // --- A. HERO ENTRANCE TIMELINE ---
        const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

        heroTimeline
            .from('.site-header', {
                y: -40,
                opacity: 0,
                duration: 0.9,
                delay: 0.1,
            })
            .from('.gsap-hero-el', {
                y: 35,
                opacity: 0,
                duration: 0.9,
                stagger: 0.12,
            }, '-=0.5')
            .from('.gsap-hero-visual', {
                scale: 0.88,
                opacity: 0,
                duration: 1.2,
                ease: 'expo.out',
            }, '-=0.8')
            .from('.hero-scroll-indicator', {
                y: 15,
                opacity: 0,
                duration: 0.6,
            }, '-=0.4');

        if (!hasScrollTrigger) return;

        // --- B. ABOUT SECTION ANIMATIONS ---
        gsap.from('.about-lead', {
            scrollTrigger: {
                trigger: '.about-section',
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
            y: 40,
            opacity: 0,
            duration: 1,
            ease: 'power3.out',
        });

        gsap.from('.narrative-paragraph', {
            scrollTrigger: {
                trigger: '.about-narrative',
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
            y: 25,
            opacity: 0,
            duration: 0.85,
            stagger: 0.15,
            ease: 'power2.out',
        });

        gsap.from('.stat-card', {
            scrollTrigger: {
                trigger: '.about-stats-grid',
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
        });

        // --- C. EDUCATION TIMELINE DRAW & ITEM REVEALS ---
        // Animate the vertical timeline line progress down
        gsap.to('#timelineProgress', {
            scrollTrigger: {
                trigger: '.timeline-wrapper',
                start: 'top 70%',
                end: 'bottom 85%',
                scrub: 0.4,
            },
            height: '100%',
            ease: 'none',
        });

        // Sequential reveals of timeline cards
        gsap.utils.toArray('.gsap-timeline-item').forEach((item, index) => {
            gsap.from(item, {
                scrollTrigger: {
                    trigger: item,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
                x: 35,
                opacity: 0,
                duration: 0.85,
                delay: index * 0.1,
                ease: 'power3.out',
            });
        });

        // --- D. PROJECTS SECTION CARDS REVEAL ---
        gsap.utils.toArray('.gsap-project-card').forEach((card) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
                y: 50,
                opacity: 0,
                duration: 0.95,
                ease: 'power3.out',
            });
        });

        // --- E. SKILLS ROWS STAGGER REVEAL ---
        gsap.from('.gsap-skill-row', {
            scrollTrigger: {
                trigger: '.skills-list',
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
            y: 30,
            opacity: 0,
            duration: 0.75,
            stagger: 0.1,
            ease: 'power2.out',
        });

        // --- F. CERTIFICATIONS STAGGER REVEAL ---
        gsap.from('.gsap-cert-item', {
            scrollTrigger: {
                trigger: '.certifications-list',
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
            y: 25,
            opacity: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: 'power2.out',
        });

        // --- G. CONTACT SECTION REVEAL ---
        gsap.from('.contact-lead-content', {
            scrollTrigger: {
                trigger: '.contact-section',
                start: 'top 75%',
                toggleActions: 'play none none none',
            },
            y: 40,
            opacity: 0,
            duration: 1,
            ease: 'power3.out',
        });

        gsap.from('.coord-item', {
            scrollTrigger: {
                trigger: '.contact-coordinates',
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
            x: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
        });
    }

    // -------------------------------------------------------------------------
    // 11. LIFECYCLE REFRESH & INITIALIZATION
    // -------------------------------------------------------------------------
    function init() {
        document.body.classList.remove('loading');

        initAnchorNavigation();
        initActiveNavSpy();
        initCursorGlow();
        initHero3DParallax();
        initProjectCard3DTilt();
        initGSAPAnimations();

        // Refresh ScrollTrigger after fonts and layout settle
        if (hasGSAP && hasScrollTrigger) {
            ScrollTrigger.refresh();
        }
    }

    // When DOM is fully parsed
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // When all images, fonts, and assets have loaded
    window.addEventListener('load', () => {
        if (hasGSAP && hasScrollTrigger) {
            ScrollTrigger.refresh();
        }
    });

    // Also refresh on font readiness
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            if (hasGSAP && hasScrollTrigger) {
                ScrollTrigger.refresh();
            }
        });
    }

})();

