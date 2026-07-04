(function () {
const { SELECTORS, qs, qsa } = window.OverrDom;

let isPerformanceMode = false;
let qualityEffectsStarted = false;
const qualityEffectCleanups = [];
let globalRevealObserver = null;
const prefersReducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointerQuery = window.matchMedia("(pointer: fine)");
let scrollytellingCleanup = null;
let cursorCleanup = null;

function isPerformanceModeEnabled() {
    return isPerformanceMode;
}

function isExplicitQualityAllowed() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('quality') === 'true' || urlParams.get('perf') === 'false';
}

function initSmartMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const forcePerformance = urlParams.get('perf') === 'true' || urlParams.get('performance') === 'true';
    const forceQuality = isExplicitQualityAllowed();
    const savedVisualMode = localStorage.getItem('overr_visual_mode');
    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4;
    const hasCoarsePointer = !finePointerQuery.matches;
    const prefersReducedMotion = prefersReducedMotionQuery.matches;
    const prefersReducedData = navigator.connection?.saveData === true;

    let shouldUsePerformanceMode = true;
    if (savedVisualMode && !hasCoarsePointer && !prefersReducedMotion && !prefersReducedData) {
        shouldUsePerformanceMode = savedVisualMode === 'performance';
    } else if (!prefersReducedMotion && !prefersReducedData && !hasCoarsePointer && cores >= 8 && memory >= 8) {
        shouldUsePerformanceMode = false;
    }
    if (forcePerformance) shouldUsePerformanceMode = true;
    if (forceQuality) shouldUsePerformanceMode = false;

    setPerformanceMode(shouldUsePerformanceMode);
}

function setPerformanceMode(enabled) {
    const wasPerformanceMode = isPerformanceMode;
    isPerformanceMode = enabled;
    document.body.classList.toggle('mode-performance', enabled);
    syncModeButtons();

    if (enabled) {
        stopQualityMode();
        console.warn("SYSTEM: Performance mode enabled.");
    } else {
        startQualityMode();
        if (wasPerformanceMode) console.warn("SYSTEM: Quality mode enabled.");
    }
}

function syncModeButtons() {
    qsa(SELECTORS.modeButton).forEach(btn => {
        const active = isPerformanceMode
            ? btn.dataset.mode === 'performance'
            : btn.dataset.mode === 'quality';
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', String(active));
    });
}

function startQualityMode() {
    if (isPerformanceMode) return;
    resetPerformanceInlineStyles();
    initScrollytelling();
    initCursor();
    if (qs('#dynamic-content')?.children.length) startQualityEffects();
}

function stopQualityMode() {
    stopQualityEffects();
    stopScrollytelling();
    stopCursor();
    resetPerformanceInlineStyles();
    document.body.classList.remove('portfolio-mode');
}

function resetPerformanceInlineStyles() {
    const heroMain = qs('.hero-main');
    const heroWidgets = qs('.hero-widgets');
    const scrollIndicator = qs('.scroll-indicator');
    [heroMain, heroWidgets].forEach(el => {
        if (!el) return;
        el.style.transform = '';
        el.style.opacity = '';
        el.style.filter = '';
    });
    if (scrollIndicator) {
        scrollIndicator.style.transform = 'translateX(-50%)';
        scrollIndicator.style.opacity = '';
        scrollIndicator.style.filter = '';
    }
}

function initSmartHeader() {
    const topNav = qs('.top-nav');
    const scrollLayer = qs(SELECTORS.scrollLayer);
    let lastScrollY = scrollLayer.scrollTop;
    let frameId = null;
    const getAbsoluteTop = (el) => {
        let top = el.offsetTop;
        if (el.closest('#dynamic-content')) top += document.getElementById('dynamic-content').offsetTop;
        return top;
    };

    const update = () => {
        frameId = null;
        if (scrollLayer.scrollTop > lastScrollY && scrollLayer.scrollTop > 100) topNav.classList.add('nav-hidden');
        else topNav.classList.remove('nav-hidden');
        lastScrollY = scrollLayer.scrollTop;
        const viewportAnchor = scrollLayer.scrollTop + Math.min(window.innerHeight * 0.42, 360);
        let activeSection = null;
        qsa('.content-section').forEach(sec => {
            const top = getAbsoluteTop(sec);
            const bottom = top + sec.offsetHeight;
            if (sec.id && viewportAnchor >= top && viewportAnchor < bottom) activeSection = sec;
        });
        if (!activeSection) return;
        qsa(`${SELECTORS.desktopLinks}, ${SELECTORS.mobileLinks}`).forEach(a => a.classList.remove('active'));
        qsa(`${SELECTORS.desktopLinks}[href="#${activeSection.id}"], ${SELECTORS.mobileLinks}[href="#${activeSection.id}"]`).forEach(a => a.classList.add('active'));
    };

    scrollLayer.addEventListener('scroll', () => {
        if (frameId) return;
        frameId = requestAnimationFrame(update);
    }, { passive: true });

    qsa(`${SELECTORS.desktopLinks}, ${SELECTORS.mobileLinks}, .hero-jump`).forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = qs(link.getAttribute('href'));
            if (target) scrollLayer.scrollTo({ top: getAbsoluteTop(target) - 80, behavior: 'smooth' });
        });
    });
}

function initScrollytelling() {
    if (isPerformanceMode || scrollytellingCleanup) return;
    const scrollLayer = qs(SELECTORS.scrollLayer);
    if (!scrollLayer) return;
    const heroMain = qs('.hero-main');
    const heroWidgets = qs('.hero-widgets');
    const scrollIndicator = qs('.scroll-indicator');
    let frameId = null;

    const update = () => {
        frameId = null;
        if (isPerformanceMode) return;
        const scrollY = scrollLayer.scrollTop;
        const wh = window.innerHeight;
        if (scrollY > wh * 0.15) document.body.classList.add('portfolio-mode');
        else document.body.classList.remove('portfolio-mode');
        if (heroMain && window.innerWidth > 768) {
            const progress = scrollY / wh;
            if (progress < 1.2) {
                heroMain.style.transform = `scale(${1 - progress * 0.06})`;
                heroMain.style.opacity = Math.max(0, 1 - (progress * 1.4));
                heroMain.style.filter = `blur(${progress * 4}px)`;
                if (heroWidgets) {
                    heroWidgets.style.opacity = Math.max(0, 1 - (progress * 2));
                    heroWidgets.style.transform = `translateY(${scrollY * -0.12}px)`;
                }
                if (scrollIndicator) scrollIndicator.style.opacity = Math.max(0, 1 - (progress * 3));
            } else {
                heroMain.style.transform = 'scale(0.93)';
                heroMain.style.opacity = '0';
                heroMain.style.filter = 'blur(5px)';
                if (heroWidgets) {
                    heroWidgets.style.opacity = '0';
                    heroWidgets.style.transform = `translateY(${wh * -0.14}px)`;
                }
                if (scrollIndicator) scrollIndicator.style.opacity = '0';
            }
        }
    };

    const onScroll = () => {
        if (frameId) return;
        frameId = requestAnimationFrame(update);
    };

    scrollLayer.addEventListener('scroll', onScroll, { passive: true });
    update();

    scrollytellingCleanup = () => {
        scrollLayer.removeEventListener('scroll', onScroll);
        if (frameId) cancelAnimationFrame(frameId);
        frameId = null;
        scrollytellingCleanup = null;
    };
}

function stopScrollytelling() {
    scrollytellingCleanup?.();
    scrollytellingCleanup = null;
}

function initIntersectionObserver() {
    if (globalRevealObserver) globalRevealObserver.disconnect();
    globalRevealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                globalRevealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05, rootMargin: "0px 0px -50px 0px" });
    qsa(SELECTORS.revealTargets).forEach(el => globalRevealObserver.observe(el));
}

function initCursor() {
    const cursor = qs('#customCursor');
    if (
        isPerformanceMode ||
        cursorCleanup ||
        !cursor ||
        !finePointerQuery.matches
    ) return;

    const handleMouseMove = e => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        if (cursor.classList.contains('hidden')) cursor.classList.remove('hidden');
    };
    const handleMouseLeave = () => cursor.classList.add('hidden');
    const handleMouseEnter = () => cursor.classList.remove('hidden');

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    const hoverTargets = 'a, button, input, textarea, .hover-target, .bento-card, .pipeline-step, .tool-badge, .service-item, .contact-icon';

    const handleMouseOver = e => {
        if (e.target.closest(hoverTargets)) cursor.classList.add('hover');
    };

    const handleMouseOut = e => {
        if (e.target.closest(hoverTargets)) cursor.classList.remove('hover');
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    cursorCleanup = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseleave', handleMouseLeave);
        document.removeEventListener('mouseenter', handleMouseEnter);
        document.removeEventListener('mouseover', handleMouseOver);
        document.removeEventListener('mouseout', handleMouseOut);
        cursor.classList.remove('hover');
        cursor.classList.add('hidden');
        cursor.style.left = '';
        cursor.style.top = '';
        cursorCleanup = null;
    };
}

function stopCursor() {
    cursorCleanup?.();
    cursorCleanup = null;
}

function startQualityEffects() {
    if (isPerformanceMode || qualityEffectsStarted) return;

    qualityEffectsStarted = true;
    let idleId = null;
    let timeoutId = null;
    const start = () => {
        if (isPerformanceMode || !qualityEffectsStarted) return;
        if (document.hidden) {
            document.addEventListener('visibilitychange', start, { once: true });
            return;
        }
        initParallax();
        initParticles();
    };

    if ('requestIdleCallback' in window) idleId = window.requestIdleCallback(start, { timeout: 1200 });
    else timeoutId = setTimeout(start, 300);

    qualityEffectCleanups.push(() => {
        document.removeEventListener('visibilitychange', start);
        if (idleId && 'cancelIdleCallback' in window) window.cancelIdleCallback(idleId);
        if (timeoutId) clearTimeout(timeoutId);
    });
}

function stopQualityEffects() {
    qualityEffectsStarted = false;
    while (qualityEffectCleanups.length) {
        const cleanup = qualityEffectCleanups.pop();
        cleanup();
    }
}

function initParallax() {
    if (isPerformanceMode || !finePointerQuery.matches || window.innerWidth < 900) return;
    const bgWrapper = qs('.bg-3d-wrapper');
    const interactiveGrid = qs('.bg-grid-interactive');
    if (!bgWrapper) return;
    let currentX = 0, currentY = 0, targetX = 0, targetY = 0;
    let frameId = null;
    let isRunning = true;

    const handleMouseMove = (e) => {
        targetX = ((e.clientY / window.innerHeight - 0.5) * 1.2);
        targetY = ((e.clientX / window.innerWidth - 0.5) * -1.2);
        if (interactiveGrid) {
            const rect = interactiveGrid.getBoundingClientRect();
            interactiveGrid.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            interactiveGrid.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        }
    };

    document.addEventListener('mousemove', handleMouseMove);
    qualityEffectCleanups.push(() => {
        isRunning = false;
        document.removeEventListener('mousemove', handleMouseMove);
        if (frameId) cancelAnimationFrame(frameId);
        bgWrapper.style.transform = '';
    });

    const anim = () => {
        if (!isRunning || isPerformanceMode) return;
        currentX += (targetX - currentX) * 0.05;
        currentY += (targetY - currentY) * 0.05;
        bgWrapper.style.transform = `rotateX(${currentX}deg) rotateY(${currentY}deg)`;
        frameId = requestAnimationFrame(anim);
    };
    frameId = requestAnimationFrame(anim);
}

function initParticles() {
    const pCanvas = qs('#particle-canvas');
    if (!pCanvas || prefersReducedMotionQuery.matches || document.hidden) return;
    const pCtx = pCanvas.getContext('2d');
    const particles = [];
    const particleCount = window.innerWidth < 768 ? 0 : 28;
    if (!particleCount) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let frameId = null;
    let isRunning = true;
    let lastDraw = 0;
    const resize = () => {
        pCanvas.width = Math.floor(window.innerWidth * dpr);
        pCanvas.height = Math.floor(window.innerHeight * dpr);
        pCanvas.style.width = `${window.innerWidth}px`;
        pCanvas.style.height = `${window.innerHeight}px`;
        pCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    resize();
    qualityEffectCleanups.push(() => {
        isRunning = false;
        window.removeEventListener('resize', resize);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (frameId) cancelAnimationFrame(frameId);
        pCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    });

    function handleVisibilityChange() {
        if (document.hidden && frameId) {
            cancelAnimationFrame(frameId);
            frameId = null;
        } else if (!document.hidden && isRunning && !frameId) {
            frameId = requestAnimationFrame(draw);
        }
    }

    class Particle {
        constructor() {
            this.x = Math.random() * window.innerWidth;
            this.y = Math.random() * window.innerHeight;
            this.vx = (Math.random() - 0.5) * 0.24;
            this.vy = (Math.random() - 0.5) * 0.24;
            this.r = Math.random() * 1.2;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
            if (this.y < 0 || this.y > window.innerHeight) this.vy *= -1;
        }
        draw() {
            pCtx.beginPath();
            pCtx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            pCtx.fillStyle = 'rgba(59, 130, 246, 0.4)';
            pCtx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());
    function draw(timestamp = 0) {
        if (!isRunning || isPerformanceMode) return;
        if (!document.hidden && timestamp - lastDraw > 33) {
            lastDraw = timestamp;
            pCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            particles.forEach(p => { p.update(); p.draw(); });
        }
        frameId = requestAnimationFrame(draw);
    }
    frameId = requestAnimationFrame(draw);
}

window.OverrEffects = {
    isPerformanceModeEnabled,
    initSmartMode,
    setPerformanceMode,
    initSmartHeader,
    initScrollytelling,
    initIntersectionObserver,
    initCursor,
    startQualityEffects,
    startQualityMode
};
})();
