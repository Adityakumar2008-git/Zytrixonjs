// ==========================================================================
// ZYTRIXON — MASTER INTERACTION & MOTION SYSTEM
// Production-Grade Architectural Motion Engine
// GSAP + ScrollTrigger + Lenis
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Interaction & Smooth Motion Settings ---
    const prefersReducedMotion = false;
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth <= 1024;

    // Register GSAP plugins if present
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    // --- 2. Lenis Smooth Scrolling Engine ---
    let lenis = null;
    if (typeof Lenis !== 'undefined' && !prefersReducedMotion) {
        lenis = new Lenis({
            duration: 1.25,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // pure exponential deceleration
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1.0,
            touchMultiplier: 1.6,
            infinite: false
        });
        window.lenis = lenis;

        // Synchronize Lenis with GSAP ScrollTrigger
        if (typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);

            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        } else {
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        }
    }

    // --- 3. Scroll Progress Indicator (Hairline) ---
    const progressLine = document.querySelector('.scroll-progress-line');
    if (progressLine && !prefersReducedMotion) {
        progressLine.style.transition = 'transform 0.08s linear';
        window.addEventListener('scroll', () => {
            const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (totalScroll > 0) {
                const progress = Math.min(1, Math.max(0, window.scrollY / totalScroll));
                progressLine.style.transform = `scaleX(${progress})`;
            }
        }, { passive: true });
    }

    // --- 4. Architectural Custom Cursor (Desktop Only) ---
    const cursor = document.querySelector('.custom-cursor');
    const cursorLabel = document.querySelector('.custom-cursor .cursor-label');

    if (cursor && !isTouchDevice && !prefersReducedMotion) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let cursorX = mouseX;
        let cursorY = mouseY;
        let isCursorVisible = false;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            if (!isCursorVisible) {
                cursor.style.opacity = '1';
                isCursorVisible = true;
            }
        }, { passive: true });

        // Smooth cursor interpolation loop
        function renderCursor() {
            cursorX += (mouseX - cursorX) * 0.18;
            cursorY += (mouseY - cursorY) * 0.18;
            cursor.style.left = `${cursorX}px`;
            cursor.style.top = `${cursorY}px`;
            requestAnimationFrame(renderCursor);
        }
        requestAnimationFrame(renderCursor);

        // Hover expansions for links & buttons
        const interactiveSelectors = 'a, button, .btn-pill, .btn-arrow-link, .magnetic, .faq-question-bar, .capability-row';
        document.querySelectorAll(interactiveSelectors).forEach((el) => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('cursor-hover');
            });
        });

        // "VIEW" badge mode over Case Study & Insight cards
        const viewCardSelectors = '.case-story-card, .insight-card, .featured-case-card';
        document.querySelectorAll(viewCardSelectors).forEach((card) => {
            card.addEventListener('mouseenter', () => {
                cursor.classList.add('cursor-view');
                if (cursorLabel) cursorLabel.textContent = 'VIEW';
            });
            card.addEventListener('mouseleave', () => {
                cursor.classList.remove('cursor-view');
                if (cursorLabel) cursorLabel.textContent = '';
            });
        });

        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
            isCursorVisible = false;
        });
    }

    // --- 5. Global Navigation Morph on Scroll ---
    const nav = document.querySelector('.global-nav');
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 40) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    // --- 6. Mobile Drawer Choreography ---
    const menuTrigger = document.querySelector('.menu-trigger');
    const mobileDrawer = document.querySelector('.mobile-drawer');
    const drawerLinks = document.querySelectorAll('.mobile-nav-links a');

    if (menuTrigger && mobileDrawer) {
        const toggleMenu = () => {
            const isOpen = mobileDrawer.classList.toggle('open');
            menuTrigger.classList.toggle('open');
            document.body.style.overflow = isOpen ? 'hidden' : '';

            if (isOpen && typeof gsap !== 'undefined' && !prefersReducedMotion) {
                gsap.fromTo(drawerLinks, 
                    { opacity: 0, y: 24 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power3.out' }
                );
            }
        };

        menuTrigger.addEventListener('click', toggleMenu);

        drawerLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileDrawer.classList.remove('open');
                menuTrigger.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // --- 7. Hero Scroll-Reactive Choreography ---
    const heroVisual = document.querySelector('.hero-monolith-frame img');
    const heroContent = document.querySelector('.hero-content');
    const heroSection = document.querySelector('.hero-section');

    if (heroSection && !prefersReducedMotion && typeof ScrollTrigger !== 'undefined') {
        // Initial clean entrance choreography
        const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
        
        heroTimeline
            .fromTo('.hero-headline', 
                { opacity: 0, y: 35 }, 
                { opacity: 1, y: 0, duration: 1.1, delay: 0.1 }
            )
            .fromTo('.hero-description', 
                { opacity: 0, y: 25 }, 
                { opacity: 1, y: 0, duration: 0.9 }, 
                '-=0.7'
            )
            .fromTo('.hero-cta-cluster', 
                { opacity: 0, y: 20 }, 
                { opacity: 1, y: 0, duration: 0.8 }, 
                '-=0.6'
            );

        if (heroVisual) {
            gsap.fromTo(heroVisual,
                { scale: 1.08, opacity: 0.7 },
                { scale: 1.0, opacity: 1, duration: 1.4, ease: 'power2.out' }
            );

            // Scroll reaction: visual scales 1 -> 1.08 gently; copy drifts
            gsap.to(heroVisual, {
                scale: 1.08,
                yPercent: 8,
                ease: 'none',
                scrollTrigger: {
                    trigger: heroSection,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1
                }
            });
        }

        if (heroContent) {
            gsap.to(heroContent, {
                yPercent: -6,
                opacity: 0.55,
                ease: 'none',
                scrollTrigger: {
                    trigger: heroSection,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1
                }
            });
        }
    }

    // --- 8. Framework 4-Step Scroll-Reactive Timeline ---
    const frameworkStack = document.querySelector('.framework-stack');
    const frameworkSteps = document.querySelectorAll('.framework-step');
    const frameworkFill = document.querySelector('.framework-line-fill');

    if (frameworkStack && frameworkSteps.length > 0 && !prefersReducedMotion && typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({
            trigger: frameworkStack,
            start: 'top 75%',
            end: 'bottom 45%',
            scrub: true,
            onUpdate: (self) => {
                const progress = self.progress;
                if (frameworkFill) {
                    frameworkFill.style.transform = `scaleY(${progress})`;
                }

                // Activate steps sequentially
                const stepCount = frameworkSteps.length;
                frameworkSteps.forEach((step, idx) => {
                    const threshold = (idx) / (stepCount);
                    if (progress >= threshold * 0.85) {
                        step.classList.add('active');
                    } else {
                        step.classList.remove('active');
                    }
                });
            }
        });
    }

    // --- 9. Horizontal Scroll Storytelling & Dynamic Motion Blur (Case Studies) ---
    const caseStudiesSection = document.getElementById('case-studies');
    const caseTrack = document.querySelector('.case-studies-h-track');
    const caseCards = document.querySelectorAll('.case-story-card');
    const liveCounter = document.querySelector('.case-counter-live');

    if (caseStudiesSection && caseTrack && caseCards.length > 0 && typeof ScrollTrigger !== 'undefined') {
        const mm = gsap.matchMedia();

        // Active on desktop & laptop screens (min-width: 769px)
        mm.add("(min-width: 769px)", () => {
            function getScrollDistance() {
                // Calculate total horizontal travel so all 4 cards glide directly in front
                const lastCard = caseCards[caseCards.length - 1];
                const firstCard = caseCards[0];
                const travelDistance = lastCard.offsetLeft - firstCard.offsetLeft;
                return -travelDistance;
            }

            let blurTimeout = null;

            const horizontalTween = gsap.to(caseTrack, {
                x: getScrollDistance,
                ease: 'none',
                scrollTrigger: {
                    trigger: caseStudiesSection,
                    start: 'top top',
                    end: () => `+=${Math.abs(getScrollDistance()) + 700}`,
                    pin: true,
                    pinSpacing: true,
                    scrub: 1.25,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        // Velocity-based motion blur during high-speed movement
                        const velocity = Math.abs(self.getVelocity());
                        if (velocity > 500) {
                            caseTrack.classList.add('motion-blur-active');
                            clearTimeout(blurTimeout);
                            blurTimeout = setTimeout(() => {
                                caseTrack.classList.remove('motion-blur-active');
                            }, 120);
                        } else {
                            caseTrack.classList.remove('motion-blur-active');
                        }

                        // Calculate active card and update live counter (01/04 -> 04/04)
                        const progress = self.progress;
                        const activeIndex = Math.min(caseCards.length - 1, Math.floor(progress * caseCards.length));
                        caseCards.forEach((card, i) => {
                            if (i === activeIndex) {
                                card.classList.add('active');
                            } else {
                                card.classList.remove('active');
                            }
                        });

                        if (liveCounter) {
                            liveCounter.textContent = `0${activeIndex + 1} / 0${caseCards.length}`;
                        }
                    }
                }
            });

            return () => {
                horizontalTween.kill();
                gsap.set(caseTrack, { clearProps: 'all' });
            };
        });

        // Mobile screens (<= 768px): native touch-swipe
        mm.add("(max-width: 768px)", () => {
            gsap.set(caseTrack, { clearProps: 'all' });
        });
    }

    // --- 10. Real Magnetic Button System ---
    if (!isTouchDevice && !prefersReducedMotion) {
        const magneticElements = document.querySelectorAll('.magnetic, .btn-pill-champagne, .btn-pill-white');
        
        magneticElements.forEach((el) => {
            const arrow = el.querySelector('.btn-arrow, .arrow');

            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const distanceX = e.clientX - centerX;
                const distanceY = e.clientY - centerY;

                // Restrained 8-12px clamp
                const pullX = Math.max(-10, Math.min(10, distanceX * 0.28));
                const pullY = Math.max(-10, Math.min(10, distanceY * 0.28));

                if (typeof gsap !== 'undefined') {
                    gsap.to(el, {
                        x: pullX,
                        y: pullY,
                        duration: 0.3,
                        ease: 'power2.out'
                    });

                    if (arrow) {
                        gsap.to(arrow, {
                            x: pullX * 0.35 + 3,
                            y: pullY * 0.2,
                            duration: 0.3,
                            ease: 'power2.out'
                        });
                    }
                } else {
                    el.style.transform = `translate(${pullX}px, ${pullY}px)`;
                }
            });

            el.addEventListener('mouseleave', () => {
                if (typeof gsap !== 'undefined') {
                    gsap.to(el, {
                        x: 0,
                        y: 0,
                        duration: 0.7,
                        ease: 'elastic.out(1, 0.4)'
                    });

                    if (arrow) {
                        gsap.to(arrow, {
                            x: 0,
                            y: 0,
                            duration: 0.7,
                            ease: 'elastic.out(1, 0.4)'
                        });
                    }
                } else {
                    el.style.transform = 'translate(0px, 0px)';
                }
            });
        });
    }

    // --- 11. Live Metric Number Counter Animation ---
    const counterElements = document.querySelectorAll('.counter-val');
    if (counterElements.length > 0) {
        const counterObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.getAttribute('data-target'), 10);
                    const prefix = el.getAttribute('data-prefix') || '';
                    const suffix = el.getAttribute('data-suffix') || '';
                    let current = 0;
                    const duration = 1600;
                    const stepMs = 20;
                    const steps = duration / stepMs;
                    const increment = target / steps;

                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            el.textContent = `${prefix}${target}${suffix}`;
                            clearInterval(timer);
                        } else {
                            el.textContent = `${prefix}${Math.floor(current)}${suffix}`;
                        }
                    }, stepMs);

                    obs.unobserve(el);
                }
            });
        }, { threshold: 0.3 });

        counterElements.forEach(counter => counterObserver.observe(counter));
    }

    // --- 12. Approach Video Modal Transitions ---
    const approachTrigger = document.querySelector('.btn-video-approach');
    const videoModal = document.querySelector('.video-modal-backdrop');
    const modalCloseBtn = document.querySelector('.modal-close-btn');

    if (approachTrigger && videoModal) {
        const openModal = () => {
            videoModal.classList.add('open');
            if (lenis) lenis.stop();
            document.body.style.overflow = 'hidden';

            if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
                gsap.fromTo('.video-modal-container',
                    { scale: 0.94, y: 20, opacity: 0 },
                    { scale: 1.0, y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }
                );
            }
        };

        const closeModal = () => {
            if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
                gsap.to('.video-modal-container', {
                    scale: 0.94,
                    y: 15,
                    opacity: 0,
                    duration: 0.3,
                    ease: 'power2.in',
                    onComplete: () => {
                        videoModal.classList.remove('open');
                        if (lenis) lenis.start();
                        document.body.style.overflow = '';
                    }
                });
            } else {
                videoModal.classList.remove('open');
                if (lenis) lenis.start();
                document.body.style.overflow = '';
            }
        };

        approachTrigger.addEventListener('click', openModal);
        if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) closeModal();
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && videoModal.classList.contains('open')) {
                closeModal();
            }
        });
    }

    // --- 13. Testimonials Carousel ---
    const testimonials = [
        {
            quote: "“Zytrixon engineered our complete digital marketing and performance funnel. Our customer acquisition cost dropped 42% while ROAS tripled.”",
            author: "— Aditya Choudhary, CEO, ADOQA Group"
        },
        {
            quote: "“Their business strategy and consulting re-architected our enterprise model. Scaled our inbound pipeline velocity by 3.4x in 6 months.”",
            author: "— Keshav Mishra, Founder & Managing Director, BuddyFIT"
        },
        {
            quote: "“From high-impact social media management to data-driven political campaign design, their voter mobilization and strategic messaging were unmatched.”",
            author: "— Vikash Bhashkar, VP of Strategy & Campaign Director, Zenith"
        }
    ];

    let currentTestimonialIndex = 0;
    const quoteEl = document.querySelector('.testimonial-quote');
    const authorEl = document.querySelector('.testimonial-author');
    const counterEl = document.querySelector('.testimonial-counter');
    const prevBtn = document.querySelector('.testimonial-prev');
    const nextBtn = document.querySelector('.testimonial-next');

    const updateTestimonial = (index, direction = 1) => {
        if (!quoteEl || !authorEl || !counterEl) return;
        
        quoteEl.style.transition = 'opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1), transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)';
        authorEl.style.transition = 'opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1), transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)';
        
        quoteEl.style.opacity = '0';
        quoteEl.style.transform = `translateX(${direction * 18}px)`;
        authorEl.style.opacity = '0';
        authorEl.style.transform = `translateX(${direction * 18}px)`;
        
        setTimeout(() => {
            quoteEl.textContent = testimonials[index].quote;
            authorEl.textContent = testimonials[index].author;
            counterEl.textContent = `0${index + 1} / 0${testimonials.length}`;
            
            quoteEl.style.transform = `translateX(${-direction * 18}px)`;
            authorEl.style.transform = `translateX(${-direction * 18}px)`;
            
            requestAnimationFrame(() => {
                quoteEl.style.opacity = '1';
                quoteEl.style.transform = 'translateX(0)';
                authorEl.style.opacity = '1';
                authorEl.style.transform = 'translateX(0)';
            });
        }, 220);
    };

    if (prevBtn && nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
            updateTestimonial(currentTestimonialIndex, 1);
        });

        prevBtn.addEventListener('click', () => {
            currentTestimonialIndex = (currentTestimonialIndex - 1 + testimonials.length) % testimonials.length;
            updateTestimonial(currentTestimonialIndex, -1);
        });
    }

    // --- 14. FAQ Accordion ---
    const faqRows = document.querySelectorAll('.faq-row');
    faqRows.forEach(row => {
        const questionBar = row.querySelector('.faq-question-bar');
        if (questionBar) {
            questionBar.addEventListener('click', () => {
                const isActive = row.classList.contains('active');
                faqRows.forEach(r => r.classList.remove('active'));
                if (!isActive) row.classList.add('active');
            });
        }
    });

    // --- 15. In-Page Anchor Smooth Scrolling (Zero-Freeze Guarantee) ---
    document.querySelectorAll('a[href*="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href) return;

            const hashIndex = href.indexOf('#');
            if (hashIndex === -1) return;

            const hash = href.substring(hashIndex);
            const path = href.substring(0, hashIndex);

            const isCurrentPage = (path === '' || path === '/' || path === window.location.pathname || (path.endsWith('.html') && window.location.pathname.endsWith(path)));

            if (isCurrentPage && hash.length > 1) {
                const targetEl = document.querySelector(hash);
                if (targetEl) {
                    e.preventDefault();

                    // Close mobile drawer if open
                    if (mobileDrawer && mobileDrawer.classList.contains('open')) {
                        mobileDrawer.classList.remove('open');
                        if (menuTrigger) menuTrigger.classList.remove('open');
                        document.body.style.overflow = '';
                    }

                    if (lenis) {
                        lenis.scrollTo(targetEl, { 
                            offset: -70, 
                            duration: 1.25, 
                            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) 
                        });
                    } else {
                        targetEl.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }
        });
    });

    // --- 16. Bespoke Zytrixon Route / Page Transitions (Cross-Page Only) ---
    const wipe = document.querySelector('.route-transition-wipe');
    
    // Ensure initial load is instant and dissolved
    if (wipe) {
        requestAnimationFrame(() => {
            wipe.classList.remove('active');
        });
    }

    // Protection for browser forward/back navigation
    window.addEventListener('pageshow', () => {
        if (wipe) wipe.classList.remove('active');
    });

    if (wipe && !prefersReducedMotion) {
        const crossPageLinks = document.querySelectorAll('a[href]:not([target="_blank"]):not([href^="mailto:"]):not([href^="tel:"]):not([href^="javascript:"])');

        crossPageLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (!href) return;

                // Skip hash-only or in-page links
                if (href.startsWith('#')) return;

                try {
                    const url = new URL(link.href, window.location.origin);
                    
                    // If same page with hash, let anchor handler process it
                    if (url.pathname === window.location.pathname && url.hash) {
                        return;
                    }

                    // If truly navigating to a separate route
                    if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
                        e.preventDefault();

                        // Execute swift, silky 420ms Zytrixon route transition
                        wipe.classList.add('active');

                        setTimeout(() => {
                            window.location.href = link.href;
                        }, 420);
                    }
                } catch (err) {
                    // Fail gracefully
                }
            });
        });
    }

    // --- 17. Universal Smooth Content Sliding Engine ---
    if (!prefersReducedMotion) {
        const slideSelectors = [
            '.editorial-headline',
            '.case-deep-card',
            '.insight-card',
            '.essay-card',
            '.speciality-card',
            '.service-detail-section',
            '.service-right-card',
            '.pricing-tier-card',
            '.faq-row',
            '.narrative-grid',
            '.about-visual-cluster',
            '.impact-stat-item',
            '.impact-item',
            '.edge-box'
        ];

        const slideElements = document.querySelectorAll(slideSelectors.join(', '));
        if (slideElements.length > 0) {
            const slideObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '0px 0px -40px 0px',
                threshold: 0.08
            });

            slideElements.forEach((el) => {
                el.classList.add('smooth-slide-reveal');
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    el.classList.add('revealed');
                } else {
                    slideObserver.observe(el);
                }
            });
        }
    }

    // --- 18. Universal Near-Footer Strategic Contact Form Dispatch ---
    const footerForms = document.querySelectorAll('.footer-contact-form');
    footerForms.forEach((form) => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const card = form.closest('.footer-contact-card');
            const successState = card ? card.querySelector('.footer-form-success') : null;
            const submitBtn = form.querySelector('.footer-submit-btn span');
            const originalBtnText = submitBtn ? submitBtn.textContent : "Initiate Strategic Consultation";

            if (submitBtn) submitBtn.textContent = "Transmitting Request...";

            try {
                if (typeof window.submitZytrixonLead === 'function') {
                    await window.submitZytrixonLead(form, {
                        form_type: "Footer Strategic Consultation",
                        page_source: window.location.pathname
                    });
                } else {
                    const formData = new FormData(form);
                    const payload = Object.fromEntries(formData.entries());
                    payload.form_type = "Footer Strategic Consultation";
                    payload.page_source = window.location.pathname;
                    payload.submitted_at = new Date().toISOString();

                    await fetch("https://script.google.com/macros/s/AKfycbwYjrGTlq7aIM64p_ratXDxPks0fim2gSZCZn_0Gx4k_h-9EteQKwGG5SHRfGe4ej42/exec", {
                        method: "POST",
                        headers: { "Content-Type": "text/plain;charset=utf-8" },
                        body: JSON.stringify(payload),
                        mode: "no-cors"
                    });
                }

                // Show success state
                form.style.display = 'none';
                if (successState) {
                    successState.classList.add('active');
                } else {
                    alert("Consultation Requested. Our partners will reach out within 24 business hours.");
                }
                form.reset();
            } catch (err) {
                console.error("Footer lead dispatch error:", err);
                form.style.display = 'none';
                if (successState) successState.classList.add('active');
            } finally {
                if (submitBtn) submitBtn.textContent = originalBtnText;
            }
        });
    });

});
