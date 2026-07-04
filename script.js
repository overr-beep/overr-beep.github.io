(function () {
    const header = document.querySelector("[data-header]");
    const progress = document.querySelector("[data-scroll-progress]");
    const navToggle = document.querySelector("[data-nav-toggle]");
    const backToTop = document.querySelector("[data-back-to-top]");
    const navLinks = Array.from(document.querySelectorAll("[data-nav-link][href^='#']"));
    const anchorLinks = Array.from(document.querySelectorAll("a[href^='#']"));
    const sections = Array.from(document.querySelectorAll(".hero, .intro-section, main > section[id]"));
    const parallaxItems = Array.from(document.querySelectorAll(".parallax"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let ticking = false;

    function scrollToTarget(hash) {
        const target = hash === "#top" ? document.querySelector("#top") : document.querySelector(hash);
        if (!target) return false;

        const headerHeight = header?.offsetHeight || 0;
        const top = target.getBoundingClientRect().top + window.scrollY - headerHeight + 1;

        window.scrollTo({
            top,
            behavior: reducedMotion.matches ? "auto" : "smooth"
        });
        return true;
    }

    function updateScrollState() {
        const scrollMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const progressValue = Math.min(100, Math.max(0, (window.scrollY / scrollMax) * 100));
        const isScrolled = window.scrollY > 18;
        const anchor = window.scrollY + Math.min(320, window.innerHeight * 0.42);
        let activeId = "";

        header?.classList.toggle("is-scrolled", isScrolled);
        backToTop?.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.72);
        progress?.style.setProperty("--scroll-progress", `${progressValue.toFixed(2)}%`);

        sections.forEach((section, index) => {
            const next = sections[index + 1];
            const top = section.offsetTop - 120;
            const bottom = next ? next.offsetTop - 120 : document.documentElement.scrollHeight;
            if (anchor >= top && anchor < bottom) {
                if (section.classList.contains("intro-section")) {
                    activeId = "work";
                } else if (section.id === "eafc") {
                    activeId = "work";
                } else if (section.id) {
                    activeId = section.id;
                } else {
                    activeId = "";
                }
            }
        });

        navLinks.forEach(link => {
            const isActive = link.getAttribute("href") === `#${activeId}`;
            link.classList.toggle("is-active", isActive);
            if (isActive) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    function updateParallax() {
        if (reducedMotion.matches) return;

        const viewportHeight = window.innerHeight || 1;
        parallaxItems.forEach(item => {
            const rect = item.getBoundingClientRect();
            if (rect.bottom < -120 || rect.top > viewportHeight + 120) return;

            const speed = Number(item.dataset.speed || 0);
            const midpoint = rect.top + rect.height / 2;
            const distance = midpoint - viewportHeight / 2;
            const y = Math.max(-42, Math.min(42, distance * speed));
            item.style.setProperty("--parallax-y", `${y.toFixed(2)}px`);
        });
    }

    function requestScrollUpdate() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            updateScrollState();
            updateParallax();
            ticking = false;
        });
    }

    function initNavigation() {
        if (navToggle) {
            function closeNavigation() {
                document.body.classList.remove("nav-open");
                navToggle.setAttribute("aria-expanded", "false");
                navToggle.setAttribute("aria-label", "Open navigation");
            }

            navToggle.addEventListener("click", () => {
                const isOpen = document.body.classList.toggle("nav-open");
                navToggle.setAttribute("aria-expanded", String(isOpen));
                navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
            });

            window.addEventListener("keydown", event => {
                if (event.key === "Escape") closeNavigation();
            });

            navLinks.forEach(link => {
                link.addEventListener("click", closeNavigation);
            });
        }

        anchorLinks.forEach(link => {
            link.addEventListener("click", event => {
                const hash = link.getAttribute("href");
                if (!hash || hash === "#") return;
                if (!scrollToTarget(hash)) return;
                event.preventDefault();
                document.body.classList.remove("nav-open");
            });
        });
    }

    function initReveal() {
        const targets = Array.from(document.querySelectorAll(".reveal"));

        targets.forEach((target, index) => {
            target.style.setProperty("--delay", `${Math.min(index % 3, 2) * 80}ms`);
        });

        if (!("IntersectionObserver" in window) || reducedMotion.matches) {
            targets.forEach(target => target.classList.add("is-visible"));
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.16,
            rootMargin: "0px 0px -72px 0px"
        });

        targets.forEach(target => observer.observe(target));
    }

    function initHeroPointerParallax() {
        const hero = document.querySelector(".hero");
        const heroBg = document.querySelector("[data-hero-mouse-bg]");
        const heroPerson = document.querySelector("[data-hero-mouse-person]");
        const desktopPointer = window.matchMedia("(min-width: 901px) and (pointer: fine)");
        if (!hero || (!heroBg && !heroPerson) || reducedMotion.matches || !desktopPointer.matches) return;

        let frame = 0;
        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;

        function applyPointerParallax() {
            currentX += (targetX - currentX) * 0.08;
            currentY += (targetY - currentY) * 0.08;

            heroBg?.style.setProperty("--hero-bg-x", `${(-currentX * 7).toFixed(2)}px`);
            heroBg?.style.setProperty("--hero-bg-y", `${(-currentY * 5).toFixed(2)}px`);
            heroPerson?.style.setProperty("--hero-person-x", `${(currentX * 11).toFixed(2)}px`);
            heroPerson?.style.setProperty("--hero-person-y", `${(currentY * 7).toFixed(2)}px`);

            if (Math.abs(targetX - currentX) > 0.002 || Math.abs(targetY - currentY) > 0.002) {
                frame = requestAnimationFrame(applyPointerParallax);
            } else {
                frame = 0;
            }
        }

        function requestPointerParallax() {
            if (frame) return;
            frame = requestAnimationFrame(applyPointerParallax);
        }

        hero.addEventListener("pointermove", event => {
            const rect = hero.getBoundingClientRect();
            targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
            targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
            requestPointerParallax();
        }, { passive: true });

        hero.addEventListener("pointerleave", () => {
            targetX = 0;
            targetY = 0;
            requestPointerParallax();
        });
    }

    function initMatchaInteraction() {
        const matchaSection = document.querySelector("[data-matcha-section]");
        const cans = Array.from(document.querySelectorAll("[data-matcha-variant]"));
        const labelPreview = document.querySelector("[data-matcha-label-preview]");
        const labelFull = document.querySelector("[data-matcha-label-full]");
        const labelOpen = document.querySelector("[data-matcha-label-open]");
        const labelModal = document.querySelector("[data-matcha-label-modal]");
        const labelCloseItems = Array.from(document.querySelectorAll("[data-matcha-label-close]"));
        if (!matchaSection || !cans.length) return;
        if (labelOpen && labelOpen.parentElement !== document.body) document.body.appendChild(labelOpen);

        let waveTimer = 0;
        let shakeTimer = 0;
        let previousIndex = -1;
        let activeLabelVariant = "yuzu";
        const labels = {
            yuzu: "assets/portfolio/source/matcha-label-yuzu.png",
            pink: "assets/portfolio/source/matcha-label-pink.png",
            blue: "assets/portfolio/source/matcha-label-blue.png"
        };

        function setLabelVariant(variant = "yuzu") {
            const src = labels[variant] || labels.yuzu;
            activeLabelVariant = variant;
            if (labelPreview) labelPreview.src = src;
            if (labelFull) labelFull.src = src;
            if (labelOpen) {
                const accent = variant === "pink" ? "#d82f8a" : variant === "blue" ? "#2b579f" : "#d2bb00";
                const accentRgb = variant === "pink" ? "216, 47, 138" : variant === "blue" ? "43, 87, 159" : "210, 187, 0";
                labelOpen.style.setProperty("--matcha-accent", accent);
                labelOpen.style.setProperty("--matcha-accent-rgb", accentRgb);
            }
        }

        function showLabelPreview() {
            labelOpen?.classList.add("is-visible");
        }

        function hideLabelPreview() {
            labelOpen?.classList.remove("is-visible");
        }

        function moveLabelPreview(event) {
            if (!labelOpen || !event) return;
            const gap = 12;
            const previewRect = labelOpen.getBoundingClientRect();
            let x = event.clientX + gap;
            let y = event.clientY + gap;

            if (x + previewRect.width > window.innerWidth - 10) x = event.clientX - previewRect.width - gap;
            if (y + previewRect.height > window.innerHeight - 10) y = event.clientY - previewRect.height - gap;

            x = Math.max(10, x);
            y = Math.max(10, y);
            labelOpen.style.setProperty("--label-x", `${x}px`);
            labelOpen.style.setProperty("--label-y", `${y}px`);
        }

        function moveLabelPreviewToCan(can) {
            if (!labelOpen) return;
            const rect = can.getBoundingClientRect();
            labelOpen.style.setProperty("--label-x", `${rect.left + rect.width * 0.66}px`);
            labelOpen.style.setProperty("--label-y", `${rect.top + rect.height * 0.18}px`);
        }

        function triggerVariant(can) {
            const variant = can.dataset.matchaVariant;
            const sectionRect = matchaSection.getBoundingClientRect();
            const canRect = can.getBoundingClientRect();
            const x = canRect.left + canRect.width * 0.5 - sectionRect.left;
            const y = canRect.top + canRect.height * 0.5 - sectionRect.top;

            matchaSection.dataset.matchaVariant = variant;
            setLabelVariant(variant);
            showLabelPreview();
            matchaSection.style.setProperty("--matcha-glow-x", `${x.toFixed(1)}px`);
            matchaSection.style.setProperty("--matcha-glow-y", `${y.toFixed(1)}px`);

            matchaSection.classList.remove("is-wave-active");
            window.clearTimeout(waveTimer);
            requestAnimationFrame(() => {
                matchaSection.classList.add("is-wave-active");
                waveTimer = window.setTimeout(() => {
                    matchaSection.classList.remove("is-wave-active");
                }, 840);
            });
        }

        function openLabelModal() {
            if (!labelModal) return;
            setLabelVariant(activeLabelVariant);
            labelModal.classList.add("is-open");
            labelModal.setAttribute("aria-hidden", "false");
            document.body.classList.add("modal-open");
        }

        function closeLabelModal() {
            if (!labelModal) return;
            labelModal.classList.remove("is-open");
            labelModal.setAttribute("aria-hidden", "true");
            document.body.classList.remove("modal-open");
        }

        function clearShake() {
            cans.forEach(can => can.classList.remove("is-idle-shaking"));
        }

        function scheduleShake(delay = 2400) {
            window.clearTimeout(shakeTimer);
            if (reducedMotion.matches) return;

            shakeTimer = window.setTimeout(() => {
                const sectionRect = matchaSection.getBoundingClientRect();
                const isNearby = sectionRect.bottom > 0 && sectionRect.top < window.innerHeight;
                if (!isNearby || document.hidden) {
                    scheduleShake(2400);
                    return;
                }

                let index = Math.floor(Math.random() * cans.length);
                if (cans.length > 1 && index === previousIndex) index = (index + 1) % cans.length;
                previousIndex = index;

                const can = cans[index];
                clearShake();
                can.classList.add("is-idle-shaking");
                window.setTimeout(() => {
                    can.classList.remove("is-idle-shaking");
                    scheduleShake(3600 + Math.random() * 2600);
                }, 920);
            }, delay);
        }

        cans.forEach(can => {
            can.setAttribute("role", "button");
            can.setAttribute("tabindex", "0");
            can.setAttribute("aria-label", "Open full Matcha label preview");

            can.addEventListener("pointerenter", event => {
                window.clearTimeout(shakeTimer);
                clearShake();
                moveLabelPreview(event);
                triggerVariant(can);
            });

            can.addEventListener("pointermove", moveLabelPreview);

            can.addEventListener("pointerleave", hideLabelPreview);

            can.addEventListener("focus", () => {
                moveLabelPreviewToCan(can);
                triggerVariant(can);
            });

            can.addEventListener("blur", hideLabelPreview);

            can.addEventListener("click", () => {
                triggerVariant(can);
                openLabelModal();
            });

            can.addEventListener("keydown", event => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                triggerVariant(can);
                openLabelModal();
            });
        });

        matchaSection.addEventListener("pointerleave", () => {
            delete matchaSection.dataset.matchaVariant;
            hideLabelPreview();
            scheduleShake(2200);
        });

        labelCloseItems.forEach(item => {
            item.addEventListener("click", closeLabelModal);
        });

        window.addEventListener("keydown", event => {
            if (event.key === "Escape") closeLabelModal();
        });

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                window.clearTimeout(shakeTimer);
                clearShake();
            } else {
                scheduleShake(2400);
            }
        });

        setLabelVariant(activeLabelVariant);
        scheduleShake(1800);
    }

    window.addEventListener("scroll", requestScrollUpdate, { passive: true });
    window.addEventListener("resize", requestScrollUpdate);
    window.addEventListener("load", requestScrollUpdate);

    initNavigation();
    initReveal();
    initHeroPointerParallax();
    initMatchaInteraction();
    updateScrollState();
    updateParallax();
})();
