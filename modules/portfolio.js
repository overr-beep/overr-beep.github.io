(function () {
const { getProjects } = window.OverrData;
const { getTranslations } = window.OverrI18n;
const { contact: contactConfig, assets } = window.OverrConfig;
const { SELECTORS, qs, qsa } = window.OverrDom;
const { initTerminal } = window.OverrTerminal;
const { initIntersectionObserver } = window.OverrEffects;

let activeCaseStudyId = null;
let lastFocused = null;
let activeLang = 'en';
let renderState = null;
let renderAbortController = null;

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
].join(',');
const CONTACT_DRAFT_KEY = 'overr_contact_draft';

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function addRenderListener(target, type, handler, options = {}) {
    if (!target || !renderAbortController) return;
    target.addEventListener(type, handler, { ...options, signal: renderAbortController.signal });
}

function cssUrl(value) {
    return String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function renderDynamicContent({ lang, isPerformanceMode, setPerformanceMode }) {
    renderAbortController?.abort();
    renderAbortController = new AbortController();
    activeLang = lang;
    renderState = { isPerformanceMode, setPerformanceMode };
    const wrapper = qs('#dynamic-content');
    const d = getTranslations(lang);
    const projects = getProjects(lang);
    const featured = projects[0];
    if (!wrapper || !d || !featured) return;

    renderVisualModeControl(d, isPerformanceMode);

    wrapper.innerHTML = `
        <section id="projects" class="content-section">
            ${renderPortfolioLead(d)}
            ${renderFeaturedProject(featured, d)}
            ${renderAvailabilityStrip(d)}
            ${renderSelectedWork(projects.slice(1), d)}
            ${renderStatsStrip(d)}
            ${renderProjectSlots(d)}
            ${renderLogoWall(d)}
        </section>

        <section id="about" class="content-section">
            <div class="about-layout">
                <div class="about-text-col">
                    <h2 class="page-title text-accent">${d.aboutTitle}</h2>
                    <p class="page-text">${escapeHtml(d.aboutContent)}</p>
                    <div class="about-signature">
                        <span>${escapeHtml(d.aboutRole || 'Graphic designer')}</span>
                        <strong>${escapeHtml(d.aboutLocation || 'Remote / worldwide')}</strong>
                    </div>
                </div>
                <div class="about-profile-card">
                    <div class="about-visual-col"><div class="about-glitch-image is-loading" data-bg="${escapeHtml(assets.aboutImage)}" data-placeholder="${escapeHtml(d.imageSlotAbout)}" data-format="${escapeHtml(d.imageSlotAboutFormat || '')}"></div></div>
                    <div class="about-profile-copy">
                        <span>${escapeHtml(d.aboutPortraitLabel || 'Portrait slot')}</span>
                        <p>${escapeHtml(d.aboutPortraitNote || '')}</p>
                    </div>
                </div>
            </div>
            <div class="services-grid">
                ${d.services.map(s => `<div class="service-item hover-target"><div class="service-num">[ ${escapeHtml(s.id)} ]</div><h4 class="service-title">${escapeHtml(s.title)}</h4><p class="service-desc">${escapeHtml(s.desc)}</p></div>`).join('')}
            </div>
            ${renderBrandMockups(d)}
            ${renderPackages(d)}
            ${renderDeliverables(d)}
            ${renderTestimonials(d)}
            ${renderClients(d)}
        </section>

        <section id="process" class="content-section">
            <span class="section-subtitle">${escapeHtml(d.processTitle)}</span>
            <div class="pipeline-container">
                ${d.process.map(s => `<div class="pipeline-step hover-target glitch-reveal"><div class="step-num">${escapeHtml(s.id)}</div><h4 class="step-title">${escapeHtml(s.name)}</h4><p class="step-desc">${escapeHtml(s.desc)}</p></div>`).join('')}
            </div>
            ${renderTimeline(d)}
            ${renderFaq(d)}
            <div class="tools-section">
                <span class="section-subtitle">${escapeHtml(d.toolsTitle)}</span>
                <div class="tools-grid">${d.tools.map(t => `<div class="tool-badge hover-target glitch-reveal"><span class="tool-name">${escapeHtml(t)}</span></div>`).join('')}</div>
            </div>
        </section>

        <section id="contact" class="content-section contact-layout">
            <div class="contact-bg-text">${escapeHtml(d.navContact)}</div>
            ${renderContactLead(d)}
            <div class="contact-status glitch-reveal">
                <span class="pulse"></span>
                <span>${escapeHtml(d.availability)}</span>
            </div>
            <div class="contact-meta-row glitch-reveal">
                <span>${escapeHtml(d.contactSlots)}</span>
                <span>${escapeHtml(d.contactResponse)}</span>
            </div>
            ${renderContactModeSwitch(d)}
            ${renderContactForm(d)}
            ${renderContactActions(d)}
            ${renderTerminalPanel(d)}
            ${renderContactIcons(d)}
        </section>

        <button id="backTopBtn" class="back-top-btn hover-target" type="button">${escapeHtml(d.backTop)}</button>
        <a class="mobile-sticky-contact hover-target" href="#contact">${escapeHtml(d.stickyContact)}</a>
        <a class="sticky-brief-cta hover-target" href="#contact">${escapeHtml(d.stickyBrief || d.heroSecondaryCta)}</a>
        ${renderSiteGuide(d)}

        <footer class="system-footer">
            <div class="footer-massive">OVERR_</div>
            <div class="footer-content">
                <div class="footer-links">
                    <a href="${escapeHtml(contactConfig.social.behance)}" class="hover-target" target="_blank" rel="noopener">BEHANCE</a>
                    <a href="${escapeHtml(contactConfig.social.dribbble)}" class="hover-target" target="_blank" rel="noopener">DRIBBBLE</a>
                    <a href="${escapeHtml(contactConfig.social.instagram)}" class="hover-target" target="_blank" rel="noopener">INSTAGRAM</a>
                </div>
                <button class="btn-disconnect hover-target" id="disconnect-btn">${escapeHtml(d.disconnect)}</button>
                <button class="motion-toggle hover-target" id="motionToggle" type="button" aria-pressed="false">${escapeHtml(d.reduceMotion || 'REDUCE MOTION')}</button>
            </div>
        </footer>`;

    initModal();
    initIntersectionObserver();
    initTerminal();
    initContactModeSwitch();
    initDisconnect();
    initModeSwitch(setPerformanceMode);
    initPackagePrefill();
    initBriefTypeChips();
    initTextareaQualityOfLife(lang);
    initScanlineDefault();
    initCopyEmail(lang);
    initFallbackForm(lang);
    initUtilityNav();
    initImageLoading(lang);
    initProjectPrefetch(lang);
    initMotionToggle(lang);
    initSiteGuide(lang);
}

function updateDynamicLanguage({ lang, isPerformanceMode }) {
    const setPerformanceMode = renderState?.setPerformanceMode || (() => {});
    renderDynamicContent({ lang, isPerformanceMode, setPerformanceMode });
}

function renderVisualModeControl(d, isPerformanceMode) {
    const navControls = qs('.nav-controls');
    if (!navControls) return;

    qs('#visual-settings-panel')?.remove();
    qs('#visual-mode-control')?.remove();

    const control = document.createElement('div');
    control.id = 'visual-mode-control';
    control.className = 'nav-mode-control';
    control.innerHTML = renderModeSwitch(d, isPerformanceMode);

    const status = qs('.status-indicator', navControls);
    navControls.insertBefore(control, status || null);
}

function renderModeSwitch(d, isPerformanceMode) {
    return `<div class="mode-switch" role="group" aria-label="Visual mode">
        <button class="mode-btn hover-target ${!isPerformanceMode ? 'active' : ''}" type="button" data-mode="quality" aria-pressed="${String(!isPerformanceMode)}">${escapeHtml(d.modeQuality)}</button>
        <button class="mode-btn hover-target ${isPerformanceMode ? 'active' : ''}" type="button" data-mode="performance" aria-pressed="${String(isPerformanceMode)}">${escapeHtml(d.modePerformance)}</button>
    </div>`;
}

function renderPortfolioLead(d) {
    return `<header class="portfolio-lead glitch-reveal">
        <span class="section-kicker">[ ${escapeHtml(d.portfolioEyebrow || d.availability)} ]</span>
        <h2>${escapeHtml(d.portfolioTitle || 'Selected work')}</h2>
        <p>${escapeHtml(d.portfolioLead || '')}</p>
    </header>`;
}

function initMobileNav() {
    const btn = qs('#mobile-menu-btn');
    const menu = qs('#mobile-menu');
    if (!btn || !menu) return;

    const setOpen = (isOpen) => {
        document.body.classList.toggle('mobile-nav-open', isOpen);
        document.body.classList.toggle('nav-scroll-lock', isOpen);
        btn.setAttribute('aria-expanded', String(isOpen));
        btn.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
        menu.setAttribute('aria-hidden', String(!isOpen));
    };

    btn.addEventListener('click', () => setOpen(!document.body.classList.contains('mobile-nav-open')));
    menu.addEventListener('click', (e) => {
        if (e.target.closest('a')) setOpen(false);
    });
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setOpen(false);
    });
}

function renderStatsStrip(d) {
    return `<div class="stats-strip glitch-reveal">
        ${d.statsStrip.map(item => `<div><strong>${escapeHtml(item.value)}</strong><span>${escapeHtml(item.label)}</span></div>`).join('')}
    </div>`;
}

function renderAvailabilityStrip(d) {
    const items = d.availableFor || [];
    if (!items.length) return '';
    return `<div class="available-strip glitch-reveal" aria-label="${escapeHtml(d.availableForTitle || 'Available for')}">
        <span>${escapeHtml(d.availableForTitle || 'Available for')}</span>
        <div>${items.map(item => `<strong>${escapeHtml(item)}</strong>`).join('')}</div>
    </div>`;
}

function renderFeaturedProject(project, d) {
    return `<article class="featured-project glitch-reveal hover-target" data-id="${escapeHtml(project.id)}" role="button" tabindex="0" aria-label="Open case study: ${escapeHtml(project.title)}">
        <div class="featured-copy">
            <span class="section-subtitle">${escapeHtml(d.featuredLabel)}</span>
            <h2>${escapeHtml(project.title)}</h2>
            <p>${escapeHtml(d.featuredTitle)}</p>
            <p class="featured-meta">${escapeHtml(project.status || d.featuredMeta)} / ${escapeHtml(project.year)}</p>
            <div class="tag-row">${project.tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
            <button class="feature-cta hover-target" type="button">${escapeHtml(d.featuredCta)}</button>
        </div>
        <div class="featured-preview is-loading" data-bg="${escapeHtml(project.img)}" data-placeholder="${escapeHtml(d.imageSlot)}" data-format="${escapeHtml(d.imageSlotFormat || '')}"></div>
    </article>`;
}

function renderProjectCard(p, d) {
    return `<article class="bento-card ${escapeHtml(p.size)} interactive-card glitch-reveal is-loading" data-cat="${escapeHtml(p.type)}" data-id="${escapeHtml(p.id)}" role="button" tabindex="0" aria-label="Open case study: ${escapeHtml(p.title)}">
        <div class="card-info-top"><span>${escapeHtml(p.status || d.projectStatusDefault || 'SELECTED WORK')}</span><span>${escapeHtml(p.year)}</span></div>
        <div class="card-content">
            <span class="card-category">// ${escapeHtml(p.category)}</span>
            <h3 class="card-title">${escapeHtml(p.title)}</h3>
            <p class="card-description-static">${escapeHtml(p.desc)}</p>
            <div class="tag-row card-tags">${p.tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
            <span class="card-cta">${escapeHtml(d.cardCta)}</span>
        </div>
        <div class="card-bg" data-bg="${escapeHtml(p.img)}" data-placeholder="${escapeHtml(d.imageSlot)}" data-format="${escapeHtml(d.imageSlotFormat || '')}"></div>
    </article>`;
}

function renderSelectedWork(projects, d) {
    return `<div class="selected-work-section">
        <div class="selected-work-head">
            <span class="section-subtitle">${escapeHtml(d.selectedWorkTitle || 'Selected work')}</span>
            <p>${escapeHtml(d.selectedWorkLead || '')}</p>
        </div>
        <div class="selected-work-list">
            ${projects.map((project, index) => renderSelectedWorkCard(project, d, index)).join('')}
        </div>
    </div>`;
}

function renderSelectedWorkCard(project, d, index) {
    return `<article class="selected-work-card bento-card interactive-card glitch-reveal is-loading" data-cat="${escapeHtml(project.type)}" data-id="${escapeHtml(project.id)}" role="button" tabindex="0" aria-label="Open case study: ${escapeHtml(project.title)}">
        <div class="selected-work-media card-bg" data-bg="${escapeHtml(project.img)}" data-placeholder="${escapeHtml(d.imageSlot)}" data-format="${escapeHtml(d.imageSlotFormat || '')}"></div>
        <div class="selected-work-copy">
            <span class="selected-work-index">${String(index + 1).padStart(2, '0')}</span>
            <span class="card-category">// ${escapeHtml(project.category)}</span>
            <h3>${escapeHtml(project.title)}</h3>
            <p>${escapeHtml(project.desc)}</p>
            <div class="tag-row card-tags">${project.tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
            <span class="card-cta">${escapeHtml(d.cardCta)}</span>
        </div>
        <div class="selected-work-meta">
            <span>${escapeHtml(project.status || d.projectStatusDefault || 'Selected work')}</span>
            <strong>${escapeHtml(project.year)}</strong>
        </div>
    </article>`;
}

function renderProjectSlots(d) {
    const slots = d.projectSlots || [];
    if (!slots.length) return '';

    return `<div class="project-slots content-band">
        <div class="project-slots-head">
            <span class="section-subtitle">${escapeHtml(d.projectSlotsTitle || 'Next projects')}</span>
            <p>${escapeHtml(d.projectSlotsLead || '')}</p>
        </div>
        <div class="project-slot-grid">
            ${slots.map((slot, index) => `<article class="project-slot glitch-reveal">
                <div class="project-slot-media" data-placeholder="${escapeHtml(slot.placeholder || d.imageSlot)}" data-format="${escapeHtml(d.imageSlotFormat || '')}"></div>
                <div>
                    <span>0${index + 1} / ${escapeHtml(slot.type)}</span>
                    <h3>${escapeHtml(slot.title)}</h3>
                    <p>${escapeHtml(slot.note)}</p>
                </div>
            </article>`).join('')}
        </div>
    </div>`;
}

function renderLogoWall(d) {
    const items = d.logoWall || [];
    if (!items.length) return '';

    return `<div class="logo-wall content-band">
        <div class="project-slots-head">
            <span class="section-subtitle">${escapeHtml(d.logoWallTitle || 'Logo wall')}</span>
            <p>${escapeHtml(d.logoWallLead || '')}</p>
        </div>
        <div class="logo-wall-grid">
            ${items.map(item => `<div class="logo-wall-item glitch-reveal"><span>${escapeHtml(item)}</span></div>`).join('')}
        </div>
    </div>`;
}

function renderBrandMockups(d) {
    const items = d.brandMockups || [];
    if (!items.length) return '';

    return `<div class="brand-mockup-section content-band">
        <div class="project-slots-head">
            <span class="section-subtitle">${escapeHtml(d.brandMockupsTitle || 'Brand system slots')}</span>
            <p>${escapeHtml(d.brandMockupsLead || '')}</p>
        </div>
        <div class="brand-mockup-grid">
            ${items.map(item => `<article class="brand-mockup-slot glitch-reveal">
                <div class="brand-mockup-media" data-placeholder="${escapeHtml(item.placeholder)}" data-format="${escapeHtml(d.imageSlotFormat || '')}"></div>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.note)}</p>
            </article>`).join('')}
        </div>
    </div>`;
}

function renderDeliverables(d) {
    return `<div class="content-band">
        <span class="section-subtitle">${escapeHtml(d.deliverablesTitle)}</span>
        <div class="deliverables-grid">
            ${d.deliverables.map(item => `<div class="deliverable-card glitch-reveal"><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.desc)}</p></div>`).join('')}
        </div>
    </div>`;
}

function renderTestimonials(d) {
    return `<div class="content-band">
        <span class="section-subtitle">${escapeHtml(d.testimonialsTitle)}</span>
        <div class="testimonial-grid">
            ${d.testimonials.map((item, index) => `<blockquote class="testimonial-card glitch-reveal">
                <div class="testimonial-head">
                    <div class="testimonial-avatar image-missing" data-bg="${escapeHtml(item.avatar || '')}" data-placeholder="${escapeHtml(item.initials || `0${index + 1}`)}"></div>
                    <cite>${escapeHtml(item.author)}</cite>
                </div>
                <p>"${escapeHtml(item.quote)}"</p>
            </blockquote>`).join('')}
        </div>
    </div>`;
}

function renderClients(d) {
    return `<div class="client-strip glitch-reveal">
        <span>${escapeHtml(d.clientsTitle)}</span>
        <div>${d.clientLogos.map(name => `<strong>${escapeHtml(name)}</strong>`).join('')}</div>
    </div>`;
}

function renderPackages(d) {
    return `<div class="offer-section content-band">
        <div class="offer-heading">
            <span class="section-subtitle">${escapeHtml(d.packagesTitle)}</span>
            <h3>${escapeHtml(d.packagesLead)}</h3>
        </div>
        <div class="package-grid">
            ${d.packages.map((item, index) => `
                <article class="package-card glitch-reveal hover-target ${item.featured ? 'package-featured' : ''}" role="button" tabindex="0" data-package-message="${escapeHtml(buildPackageMessage(d, item))}">
                    <div class="package-visual" style="--level: ${escapeHtml(item.level)}">
                        <span class="package-index">0${index + 1}</span>
                        <span class="package-badge">${escapeHtml(item.featured ? d.packageRecommended : item.badge)}</span>
                        <div class="package-ring"></div>
                    </div>
                    <div class="package-body">
                        <span class="package-meta">${escapeHtml(item.meta)}</span>
                        <h4>${escapeHtml(item.name)}</h4>
                        <div class="package-result">
                            <span>${escapeHtml(d.packageResult)}</span>
                            <strong>${escapeHtml(item.result)}</strong>
                        </div>
                        <div class="package-fit">
                            <span>${escapeHtml(d.packageBestFor)}</span>
                            <strong>${escapeHtml(item.bestFor)}</strong>
                        </div>
                        <div class="package-fit">
                            <span>${escapeHtml(d.packageStarting || 'Pricing')}</span>
                            <strong>${escapeHtml(d.packageQuote || 'Custom quote')}</strong>
                        </div>
                        <div class="package-includes">
                            <span>${escapeHtml(d.packageIncludes)}</span>
                            <ul>${item.includes.map(include => `<li>${escapeHtml(include)}</li>`).join('')}</ul>
                        </div>
                        <span class="package-select-btn">${escapeHtml(d.packageCta || 'Select type')}</span>
                    </div>
                </article>`).join('')}
        </div>
    </div>`;
}

function buildPackageMessage(d, item) {
    return `${d.packageMessageIntro || 'Hi, I want to ask about this project type:'}

${item.name}
${d.packageResult}: ${item.result}
${d.packageBestFor}: ${item.bestFor}
${d.packageIncludes}: ${item.includes.join(', ')}

${d.packageMessageOutro || 'My project / deadline / references:'}`;
}

function renderTimeline(d) {
    return `<div class="content-band">
        <span class="section-subtitle">${escapeHtml(d.timelineTitle)}</span>
        <div class="timeline-grid">
            ${d.timeline.map(item => `<div class="timeline-item glitch-reveal"><span>${escapeHtml(item.step)}</span><h4>${escapeHtml(item.name)}</h4><strong>${escapeHtml(item.meta)}</strong><p>${escapeHtml(item.desc)}</p></div>`).join('')}
        </div>
    </div>`;
}

function renderFaq(d) {
    return `<div class="content-band">
        <span class="section-subtitle">${escapeHtml(d.faqTitle)}</span>
        <div class="faq-list">
            ${d.faqs.map(item => `<details class="faq-item glitch-reveal"><summary>${escapeHtml(item.q)}</summary><p>${escapeHtml(item.a)}</p></details>`).join('')}
        </div>
    </div>`;
}

function renderTerminal(d) {
    return `<div class="terminal-window glitch-reveal">
        <div class="terminal-header">
            <span class="terminal-title">${escapeHtml(d.termTitle)}</span>
            <div class="terminal-dots"><span></span><span></span><span></span></div>
        </div>
        <div class="terminal-body" id="terminal-body">
            <div class="terminal-line" data-terminal-static="termLogInit">${escapeHtml(d.termLogInit)}</div>
            <div class="terminal-line terminal-success" data-terminal-static="termLogSecure">${escapeHtml(d.termLogSecure)}</div>
            <div class="terminal-line terminal-info" data-terminal-static="termClientNode">${escapeHtml(d.termClientNode)}</div>
            <div class="terminal-line terminal-info" data-terminal-static="termInputMode">${escapeHtml(d.termInputMode)}</div>
            <div class="terminal-line terminal-info" data-terminal-static="termHelpHint">${escapeHtml(d.termHelpHint)}</div>
            <div class="terminal-line active-line" id="email-input-line">
                <span class="prompt">C:\\OVERR\\CONTACT> ${escapeHtml(d.termPromptEmail)}</span>
                <input type="text" id="terminal-input" class="hover-target" spellcheck="false" autocomplete="off">
            </div>
            <div class="terminal-editor" id="message-editor" style="display: none;">
                <div class="editor-header">${escapeHtml(d.termEditorHeader)}</div>
                <textarea id="terminal-textarea" class="hover-target" placeholder="${escapeHtml(d.termPlaceholder)}" spellcheck="false"></textarea>
                <button id="terminal-send-btn" class="hover-target">${escapeHtml(d.termBtn)}</button>
            </div>
        </div>
        <div class="terminal-command-chips" aria-label="${escapeHtml(d.commandChipLabel)}">
            <span>${escapeHtml(d.commandChipLabel)}</span>
            <button class="hover-target" type="button" data-terminal-command="HELP">HELP</button>
            <button class="hover-target" type="button" data-terminal-command="QUICK">QUICK</button>
        </div>
    </div>`;
}

function renderContactModeSwitch(d) {
    return `<div class="contact-mode-switch glitch-reveal" role="tablist" aria-label="Contact mode">
        <button id="contact-form-tab" class="contact-mode-btn active hover-target" type="button" data-contact-mode="form" role="tab" aria-selected="true" aria-controls="fallback-contact-form">${escapeHtml(d.contactFormMode || d.fallbackTitle)}</button>
        <button id="contact-terminal-tab" class="contact-mode-btn hover-target" type="button" data-contact-mode="terminal" role="tab" aria-selected="false" aria-controls="contact-terminal-panel">${escapeHtml(d.contactTerminalMode || d.terminalOptional)}</button>
    </div>`;
}

function renderTerminalPanel(d) {
    return `<div class="contact-panel contact-terminal-panel glitch-reveal" id="contact-terminal-panel" data-contact-panel="terminal" role="tabpanel" hidden>
        ${renderTerminal(d)}
    </div>`;
}

function renderContactForm(d) {
    return `<form class="fallback-contact-form contact-panel glitch-reveal is-active" id="fallback-contact-form" data-contact-panel="form" role="tabpanel" aria-labelledby="contact-form-tab">
        <div>
            <span class="section-subtitle">${escapeHtml(d.fallbackTitle)}</span>
            <p>${escapeHtml(d.fallbackDesc)}</p>
        </div>
        ${renderBriefTypeChips(d)}
        <label><span>${escapeHtml(d.formName)}</span><input class="hover-target" name="name" autocomplete="name"></label>
        <label><span>${escapeHtml(d.formEmail)}</span><input class="hover-target" name="email" type="email" required autocomplete="email" inputmode="email"></label>
        <label><span>${escapeHtml(d.formMessage)}</span><textarea class="hover-target" name="message" required rows="5"></textarea></label>
        <button class="feature-cta hover-target" type="submit">${escapeHtml(d.formSend)}</button>
        <p class="form-status" aria-live="polite"></p>
    </form>`;
}

function renderBriefTypeChips(d) {
    const types = d.briefTypes || [];
    if (!types.length) return '';

    return `<div class="brief-type-picker">
        <div>
            <span>${escapeHtml(d.briefTypeLabel || 'Project type')}</span>
            <p>${escapeHtml(d.briefTypeHint || '')}</p>
        </div>
        <div class="brief-type-chips">
            ${types.map(type => `<button class="brief-chip hover-target" type="button" data-brief-message="${escapeHtml(type.message)}">${escapeHtml(type.label)}</button>`).join('')}
        </div>
    </div>`;
}

function renderContactLead(d) {
    return `<header class="contact-lead glitch-reveal">
        <span class="section-subtitle">${escapeHtml(d.contactLeadKicker || d.navContact)}</span>
        <h2>${escapeHtml(d.contactLeadTitle || d.fallbackTitle)}</h2>
        <p>${escapeHtml(d.contactLeadText || d.fallbackDesc)}</p>
    </header>`;
}

function renderContactActions(d) {
    return `<div class="contact-actions glitch-reveal">
        <a class="contact-primary-link hover-target" href="mailto:${escapeHtml(contactConfig.email)}">${escapeHtml(d.contactEmailCta)}</a>
        <button class="contact-secondary-link hover-target" type="button" data-copy-email>${escapeHtml(d.copyEmail)}</button>
        <a class="contact-secondary-link hover-target" href="assets/OVERR-portfolio.pdf" download>${escapeHtml(d.downloadPdf || 'DOWNLOAD PDF')}</a>
    </div>`;
}

function renderContactIcons(d) {
    return `<div class="contact-icons glitch-reveal">
        <a href="mailto:${escapeHtml(contactConfig.email)}" class="contact-icon hover-target" title="E-mail" aria-label="Send email">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        </a>
        <a href="${escapeHtml(contactConfig.social.discord)}" class="contact-icon hover-target" title="Discord" aria-label="Open Discord" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12A2 2 0 0 0 7 14A2 2 0 0 0 9 16A2 2 0 0 0 11 14A2 2 0 0 0 9 12Z"/><path d="M15 12A2 2 0 0 0 13 14A2 2 0 0 0 15 16A2 2 0 0 0 17 14A2 2 0 0 0 15 12Z"/><path d="M7.4 4A10.8 10.8 0 0 0 3 6.2C1.7 9.8 1.4 13.6 2 17.5A11 11 0 0 0 8.2 21L9.6 18.6C6.6 17.7 5.2 16.1 5.2 16.1C5.2 16.1 5.6 16.4 6 16.6C7.9 17.6 10 18 12 18C14 18 16.1 17.6 18 16.6C18.4 16.4 18.8 16.1 18.8 16.1C18.8 16.1 17.4 17.7 14.4 18.6L15.8 21A11 11 0 0 0 22 17.5C22.6 13.6 22.3 9.8 21 6.2A10.8 10.8 0 0 0 16.6 4L15.5 5.5C13.2 5.1 10.8 5.1 8.5 5.5L7.4 4Z"/></svg>
        </a>
        <a href="${escapeHtml(contactConfig.social.x)}" class="contact-icon hover-target" title="Twitter / X" aria-label="Open Twitter X" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>
        </a>
    </div>`;
}

function renderSiteGuide(d) {
    const intro = d.guideMessages?.home || '';
    return `<aside class="site-guide" id="siteGuide" style="--guide-y: 0px" aria-live="polite">
        <button class="guide-toggle hover-target" id="guideToggle" type="button" aria-expanded="true">
            <span>${escapeHtml(d.guideShow || 'GUIDE')}</span>
        </button>
        <div class="guide-panel">
            <div class="guide-character" aria-hidden="true">
                <div class="guide-shadow"></div>
                <div class="guide-body">
                    <div class="guide-badge">O</div>
                    <div class="guide-arm guide-arm-left"></div>
                    <div class="guide-arm guide-arm-right"></div>
                </div>
                <div class="guide-head">
                    <div class="guide-hair"></div>
                    <div class="guide-eye guide-eye-left"></div>
                    <div class="guide-eye guide-eye-right"></div>
                    <div class="guide-smile"></div>
                </div>
            </div>
            <div class="guide-bubble">
                <span><strong>${escapeHtml(d.guideTitle || 'OVERR GUIDE')}</strong> / ${escapeHtml(d.guideBeta || 'BETA')}</span>
                <p id="guideText">${escapeHtml(intro)}</p>
                <div class="guide-actions">
                    <button class="hover-target" type="button" data-guide-next>${escapeHtml(d.guideNext || 'NEXT')}</button>
                    <button class="hover-target" type="button" data-guide-hide>${escapeHtml(d.guideHide || 'HIDE')}</button>
                </div>
            </div>
        </div>
    </aside>`;
}

function initModeSwitch(setPerformanceMode) {
    qsa(SELECTORS.modeButton).forEach(btn => {
        addRenderListener(btn, 'click', () => {
            const usePerformance = btn.dataset.mode === 'performance';
            if (usePerformance === renderState?.isPerformanceMode) return;
            localStorage.setItem('overr_visual_mode', usePerformance ? 'performance' : 'quality');
            if (renderState) renderState.isPerformanceMode = usePerformance;
            setPerformanceMode(usePerformance);
        });
    });
}

function setContactMode(mode) {
    qsa('[data-contact-panel]').forEach(panel => {
        const active = panel.dataset.contactPanel === mode;
        panel.hidden = !active;
        panel.classList.toggle('is-active', active);
    });

    qsa('[data-contact-mode]').forEach(btn => {
        const active = btn.dataset.contactMode === mode;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-selected', String(active));
    });
}

function initContactModeSwitch() {
    qsa('[data-contact-mode]').forEach(btn => {
        addRenderListener(btn, 'click', () => {
            setContactMode(btn.dataset.contactMode || 'form');
        });
    });
}

function initPackagePrefill() {
    const about = qs('#about');
    if (!about) return;

    const applyPackage = card => {
        const message = card?.dataset.packageMessage;
        if (message) applyContactMessage(message);
    };

    addRenderListener(about, 'click', event => {
        const card = event.target.closest('.package-card');
        if (card) applyPackage(card);
    });

    addRenderListener(about, 'keydown', event => {
        const card = event.target.closest('.package-card');
        if (!card || (event.key !== 'Enter' && event.key !== ' ')) return;
        event.preventDefault();
        applyPackage(card);
    });
}

function applyContactMessage(message, { append = false } = {}) {
    const contact = qs('#contact');
    const textarea = qs('#fallback-contact-form textarea[name="message"]');
    if (!message || !textarea || !contact) return;

    setContactMode('form');
    textarea.value = append && textarea.value.trim()
        ? `${textarea.value.trim()}\n\n${message}`
        : message;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    contact.scrollIntoView({ behavior: 'smooth' });
    window.setTimeout(() => textarea.focus(), 450);
}

function initBriefTypeChips() {
    const form = qs('#fallback-contact-form');
    if (!form) return;

    addRenderListener(form, 'click', event => {
        const chip = event.target.closest('[data-brief-message]');
        if (!chip) return;
        applyContactMessage(chip.dataset.briefMessage, { append: true });
    });
}

function initTextareaQualityOfLife(lang) {
    qsa('textarea').forEach(textarea => {
        const resize = () => {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.max(textarea.scrollHeight, 160)}px`;
        };
        addRenderListener(textarea, 'input', resize);
        resize();
    });

    initContactDraft(lang);
}

function initContactDraft(lang) {
    const form = qs('#fallback-contact-form');
    if (!form) return;
    const d = getTranslations(activeLang || lang);
    const status = qs('.form-status', form);
    const fields = ['name', 'email', 'message'];
    const getField = name => qs(`[name="${name}"]`, form);

    try {
        const saved = JSON.parse(localStorage.getItem(CONTACT_DRAFT_KEY) || '{}');
        let restored = false;
        fields.forEach(name => {
            const field = getField(name);
            if (field && saved[name] && !field.value) {
                field.value = saved[name];
                field.dispatchEvent(new Event('input', { bubbles: true }));
                restored = true;
            }
        });
        if (restored && status) status.textContent = d.formDraftRestored || '';
    } catch {
        localStorage.removeItem(CONTACT_DRAFT_KEY);
    }

    let saveTimer = null;
    const saveDraft = () => {
        window.clearTimeout(saveTimer);
        saveTimer = window.setTimeout(() => {
            const draft = fields.reduce((acc, name) => {
                acc[name] = getField(name)?.value || '';
                return acc;
            }, {});
            const hasDraft = Object.values(draft).some(value => String(value).trim());
            if (hasDraft) localStorage.setItem(CONTACT_DRAFT_KEY, JSON.stringify({ ...draft, savedAt: new Date().toISOString() }));
            else localStorage.removeItem(CONTACT_DRAFT_KEY);
            if (hasDraft && status && !status.classList.contains('is-error')) status.textContent = d.formDraftSaved || '';
        }, 500);
    };

    fields.forEach(name => {
        const field = getField(name);
        if (field) addRenderListener(field, 'input', saveDraft);
    });
}

function initScanlineDefault() {
    localStorage.removeItem('overr_scanline');
    setScanline('med');
}

function setScanline(level) {
    document.body.classList.remove('scanline-low', 'scanline-med', 'scanline-high');
    document.body.classList.add(`scanline-${level}`);
}

function initCopyEmail(lang) {
    const buttons = qsa('[data-copy-email]');
    buttons.forEach(btn => {
        btn.dataset.defaultText = btn.textContent.trim();
        addRenderListener(btn, 'click', async () => {
            const d = getTranslations(activeLang || lang);
            try {
                await navigator.clipboard.writeText(contactConfig.email);
                buttons.forEach(item => {
                    item.classList.add('copied');
                    item.setAttribute('title', d.copiedEmail);
                    item.setAttribute('aria-label', d.copiedEmail);
                    item.textContent = d.copiedEmail;
                });
                setTimeout(() => {
                    buttons.forEach(item => {
                        item.classList.remove('copied');
                        item.setAttribute('title', d.copyEmail);
                        item.setAttribute('aria-label', d.copyEmail);
                        item.textContent = item.dataset.defaultText || d.copyEmail;
                    });
                }, 2000);
            } catch {
                window.location.href = `mailto:${contactConfig.email}`;
            }
        });
    });
}

function initFallbackForm(lang) {
    const form = qs('#fallback-contact-form');
    if (!form) return;
    addRenderListener(form, 'submit', async (event) => {
        event.preventDefault();
        const d = getTranslations(activeLang || lang);
        const status = qs('.form-status', form);
        const submit = qs('button[type="submit"]', form);
        const data = new FormData(form);
        const payload = {
            name: data.get('name') || '',
            email: data.get('email') || '',
            message: data.get('message') || '',
            source: 'overr-portfolio-fallback-form'
        };

        status.classList.remove('is-error');
        if (!String(payload.email).trim()) {
            status.classList.add('is-error');
            status.textContent = d.formNeedEmail || 'Add an email so I can reply.';
            qs('[name="email"]', form)?.focus();
            return;
        }
        if (!String(payload.message).trim()) {
            status.classList.add('is-error');
            status.textContent = d.formNeedMessage || 'Write a few words about the project.';
            qs('[name="message"]', form)?.focus();
            return;
        }

        status.textContent = d.formSending || 'Sending...';
        submit.disabled = true;

        try {
            localStorage.setItem('overr_last_message', JSON.stringify({ ...payload, savedAt: new Date().toISOString() }));

            if (contactConfig.formEndpoint) {
                const response = await fetch(contactConfig.formEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) throw new Error('Contact endpoint rejected the message.');
                form.reset();
                localStorage.removeItem(CONTACT_DRAFT_KEY);
            } else {
                const subject = encodeURIComponent(`Portfolio contact from ${payload.email}`);
                const body = encodeURIComponent(`${payload.message}\n\nName: ${payload.name}\nReply to: ${payload.email}`);
                window.location.href = `mailto:${contactConfig.email}?subject=${subject}&body=${body}`;
            }

            status.textContent = d.formSuccess;
        } catch {
            status.classList.add('is-error');
            status.textContent = d.formError || 'Message failed. Please use email directly.';
        } finally {
            submit.disabled = false;
        }
    });
}

function initImageLoading(lang) {
    const imageUrls = new Set();
    qsa(`${SELECTORS.cardBg}, .featured-preview[data-bg], .about-glitch-image[data-bg], .testimonial-avatar[data-bg]`).forEach(bg => {
        const url = bg.dataset.bg;
        if (!url) {
            bg.classList.remove('is-loading');
            bg.classList.add('image-missing');
            return;
        }
        imageUrls.add(url);
        const img = new Image();
        img.onload = () => {
            bg.style.backgroundImage = `url("${cssUrl(url)}")`;
            bg.closest(SELECTORS.card)?.classList.remove('is-loading');
            bg.closest(SELECTORS.card)?.classList.remove('image-missing');
            bg.classList.remove('is-loading');
            bg.classList.remove('image-missing');
        };
        img.onerror = () => {
            if (assets.fallbackImage) bg.style.backgroundImage = `url("${cssUrl(assets.fallbackImage)}")`;
            else bg.style.backgroundImage = '';
            bg.closest(SELECTORS.card)?.classList.remove('is-loading');
            bg.closest(SELECTORS.card)?.classList.add('image-missing');
            bg.classList.remove('is-loading');
            bg.classList.add('image-missing');
        };
        img.src = url;
    });

    getProjects(lang).forEach(project => {
        imageUrls.add(project.img);
        project.details?.gallery?.forEach(url => imageUrls.add(url));
        if (project.details?.beforeAfter) {
            imageUrls.add(project.details.beforeAfter.before);
            imageUrls.add(project.details.beforeAfter.after);
        }
    });
    if (assets.aboutImage) imageUrls.add(assets.aboutImage);
    if (assets.fallbackImage) imageUrls.add(assets.fallbackImage);
    scheduleImagePreload([...imageUrls]);
}

function initProjectPrefetch(lang) {
    const dynamicContent = qs('#dynamic-content');
    if (!dynamicContent) return;
    const prefetched = new Set();

    const prefetchProject = card => {
        const id = card?.dataset.id;
        if (!id || prefetched.has(id)) return;
        prefetched.add(id);
        const project = getProjects(activeLang || lang).find(item => item.id === id);
        collectProjectImages(project).forEach(url => {
            const img = new Image();
            img.decoding = 'async';
            img.src = url;
        });
    };

    addRenderListener(dynamicContent, 'pointerover', event => {
        prefetchProject(event.target.closest(`${SELECTORS.card}, .featured-project`));
    });
    addRenderListener(dynamicContent, 'focusin', event => {
        prefetchProject(event.target.closest(`${SELECTORS.card}, .featured-project`));
    });
}

function collectProjectImages(project) {
    if (!project) return [];
    const images = [project.img];
    project.details?.gallery?.forEach(url => images.push(url));
    if (project.details?.beforeAfter) {
        images.push(project.details.beforeAfter.before, project.details.beforeAfter.after);
    }
    return images.filter(Boolean);
}

function scheduleImagePreload(urls) {
    const preload = () => urls.filter(Boolean).forEach(url => {
        const img = new Image();
        img.decoding = 'async';
        img.src = url;
    });

    if ('requestIdleCallback' in window) window.requestIdleCallback(preload, { timeout: 1500 });
    else setTimeout(preload, 400);
}

function loadBackgroundImage(target, url) {
    if (!target || !url) {
        target?.classList.remove('is-loading');
        target?.classList.add('image-missing');
        return;
    }

    const img = new Image();
    img.onload = () => {
        target.style.backgroundImage = `url("${cssUrl(url)}")`;
        target.classList.remove('is-loading', 'image-missing');
    };
    img.onerror = () => {
        target.style.backgroundImage = '';
        target.classList.remove('is-loading');
        target.classList.add('image-missing');
    };
    img.src = url;
}

function initModal() {
    const closeBtn = qs('.cs-close-btn');
    const prevBtn = qs('#casePrevBtn');
    const nextBtn = qs('#caseNextBtn');
    const progress = ensureCaseProgress();
    const caseStudy = qs('#case-study-view');
    const dynamicContent = qs('#dynamic-content');

    const closeModals = () => {
        const focusTarget = lastFocused instanceof HTMLElement ? lastFocused : null;
        qs('#projectModal')?.classList.remove('active');
        caseStudy?.classList.remove('active');
        caseStudy?.classList.remove('is-case-loading');
        qs('#projectModal')?.setAttribute('aria-hidden', 'true');
        caseStudy?.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('dialog-open');
        activeCaseStudyId = null;
        if (progress) progress.style.transform = 'scaleX(0)';
        if (focusTarget) {
            focusTarget.scrollIntoView({ block: 'center', behavior: 'smooth' });
            focusTarget.focus({ preventScroll: true });
            focusTarget.classList.add('return-highlight');
            window.setTimeout(() => focusTarget.classList.remove('return-highlight'), 900);
        }
    };

    addRenderListener(closeBtn, 'click', closeModals);
    addRenderListener(qs('#modalCloseBg'), 'click', closeModals);
    addRenderListener(qs('#modalCloseBtn'), 'click', closeModals);
    addRenderListener(prevBtn, 'click', () => openAdjacentCaseStudy(-1, activeLang));
    addRenderListener(nextBtn, 'click', () => openAdjacentCaseStudy(1, activeLang));

    addRenderListener(dynamicContent, 'click', event => {
        const card = event.target.closest(`${SELECTORS.card}, .featured-project`);
        if (!card || card.hidden) return;
        event.preventDefault();
        openProject(card, activeLang);
    });

    addRenderListener(dynamicContent, 'keydown', event => {
        const card = event.target.closest(`${SELECTORS.card}, .featured-project`);
        if (!card || card.hidden || (event.key !== 'Enter' && event.key !== ' ')) return;
        event.preventDefault();
        openProject(card, activeLang);
    });

    addRenderListener(caseStudy, 'click', event => {
        const copyBrief = event.target.closest('[data-copy-case-brief]');
        if (copyBrief) {
            event.preventDefault();
            copyCaseBrief(copyBrief, activeLang);
            return;
        }
        const similar = event.target.closest('.similar-card');
        if (similar) openCaseStudyById(similar.dataset.id, activeLang, false);
        const cta = event.target.closest('[data-case-brief]');
        if (cta) {
            event.preventDefault();
            const d = getTranslations(activeLang);
            const title = cta.dataset.caseBrief;
            closeModals();
            applyContactMessage(buildCaseBriefMessage(d, title));
            return;
        }
        const caseJump = event.target.closest('[data-case-step]');
        if (caseJump) {
            const sections = qsa('.cs-section', caseStudy);
            const target = sections[Number(caseJump.dataset.caseStep)] || sections[0];
            if (target) caseStudy.scrollTo({ top: target.offsetTop - 24, behavior: 'smooth' });
        }
    });

    addRenderListener(window, 'keydown', event => {
        if (!caseStudy?.classList.contains('active')) {
            const projectModalOpen = qs('#projectModal')?.classList.contains('active');
            if (event.key === 'Escape' && projectModalOpen) closeModals();
            return;
        }

        if (event.key === 'Escape') closeModals();
        if (event.key === 'Tab') trapDialogFocus(event, caseStudy);
        if (!activeCaseStudyId) return;
        if (event.key === 'ArrowLeft') openAdjacentCaseStudy(-1, activeLang);
        if (event.key === 'ArrowRight') openAdjacentCaseStudy(1, activeLang);
    });

    addRenderListener(caseStudy, 'scroll', event => {
        const overlay = event.currentTarget;
        const max = overlay.scrollHeight - overlay.clientHeight;
        const pct = max > 0 ? overlay.scrollTop / max : 0;
        progress.style.transform = `scaleX(${pct})`;
        updateCaseProgressStep(pct);
    }, { passive: true });
}

async function copyCaseBrief(button, lang) {
    const d = getTranslations(activeLang || lang);
    const original = button.textContent;
    try {
        await navigator.clipboard.writeText(button.dataset.copyCaseBrief || '');
        button.textContent = d.copiedBrief || 'BRIEF COPIED';
        button.classList.add('copied');
        window.setTimeout(() => {
            button.textContent = original;
            button.classList.remove('copied');
        }, 2000);
    } catch {
        applyContactMessage(button.dataset.copyCaseBrief || '');
    }
}

function trapDialogFocus(event, dialog) {
    const focusable = qsa(FOCUSABLE_SELECTOR, dialog).filter(el => el.getClientRects().length > 0);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

function ensureCaseProgress() {
    let progress = qs('#caseProgressBar');
    if (progress) return progress;
    const bar = document.createElement('div');
    bar.className = 'cs-progress';
    progress = document.createElement('span');
    progress.id = 'caseProgressBar';
    const steps = document.createElement('div');
    steps.id = 'caseProgressSteps';
    steps.className = 'cs-progress-steps';
    bar.appendChild(progress);
    bar.appendChild(steps);
    qs('#case-study-view')?.appendChild(bar);
    return progress;
}

function updateCaseProgressLabels(d) {
    const steps = qs('#caseProgressSteps');
    if (!steps) return;
    const labels = [
        d.caseProgressChallenge || d.csChallenge,
        d.caseProgressProcess || d.csProcess,
        d.caseProgressResult || d.csResult
    ];
    steps.innerHTML = labels.map((label, index) => `<button class="hover-target ${index === 0 ? 'active' : ''}" type="button" data-case-step="${index}">${escapeHtml(label)}</button>`).join('');
}

function updateCaseProgressStep(progress) {
    const activeIndex = progress < 0.34 ? 0 : progress < 0.68 ? 1 : 2;
    qsa('#caseProgressSteps button').forEach((button, index) => {
        button.classList.toggle('active', index === activeIndex);
    });
}

function openProject(card, lang) {
    lastFocused = document.activeElement;
    openCaseStudyById(card.dataset.id, lang);
}

function openAdjacentCaseStudy(direction, lang) {
    const projects = getProjects(lang);
    const currentIndex = projects.findIndex(project => project.id === activeCaseStudyId);
    const baseIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (baseIndex + direction + projects.length) % projects.length;
    openCaseStudyById(projects[nextIndex].id, lang, false);
}

function openCaseStudyById(id, lang, shouldFocus = true) {
    const projects = getProjects(lang);
    const data = projects.find(project => project.id === id);
    if (!data) return;

    activeCaseStudyId = data.id;
    const d = getTranslations(lang);
    const details = data.details;
    const overlay = qs('#case-study-view');
    if (!overlay || !details) return;
    overlay.classList.add('is-case-loading');
    qs('.cs-title', overlay).innerText = data.title;
    const heroImage = qs('.cs-hero-image', overlay);
    heroImage.style.backgroundImage = '';
    heroImage.classList.add('is-loading');
    heroImage.classList.remove('image-missing');
    heroImage.dataset.placeholder = d.imageSlot;
    loadBackgroundImage(heroImage, data.img);
    qs('#cs-challenge').innerHTML = renderCaseIntro(data, details, d);
    qs('#cs-process').innerHTML = renderCaseProcess(details, d);
    qs('#cs-stats').innerHTML = renderCaseOutcome(projects, data, d);
    qs('#casePrevBtn').textContent = d.csPrev;
    qs('#caseNextBtn').textContent = d.csNext;
    updateCaseProgressLabels(d);
    initGalleryFallbacks();
    initBeforeAfterSliders();
    overlay.scrollTop = 0;
    qs('#caseProgressBar').style.transform = 'scaleX(0)';
    updateCaseProgressStep(0);
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('dialog-open');
    window.setTimeout(() => overlay.classList.remove('is-case-loading'), 220);
    if (shouldFocus) qs('.cs-close-btn')?.focus();
}

function renderCaseIntro(data, details, d) {
    return `<p class="cs-lead">${escapeHtml(details.challenge)}</p>
        <div class="cs-quick-meta">
            <div><span>${escapeHtml(d.csClient)}</span><strong>${escapeHtml(details.client || data.category)}</strong></div>
            <div><span>${escapeHtml(d.csTimeline)}</span><strong>${escapeHtml(details.timeline || data.year)}</strong></div>
            <div><span>${escapeHtml(d.csRole)}</span><strong>${escapeHtml(details.role)}</strong></div>
        </div>
        <div class="cs-scope-row">
            <span>${escapeHtml(d.csScope)}</span>
            <div>${details.scope.map(item => `<strong>${escapeHtml(item)}</strong>`).join('')}</div>
        </div>`;
}

function renderCaseProcess(details, d) {
    return `<div class="cs-process-snapshots">
        ${details.process.map((item, index) => `<article>
            <div class="cs-process-media" data-placeholder="${String(index + 1).padStart(2, '0')}" data-format="${escapeHtml(d.imageSlotCaseFormat || '')}"></div>
            <p>${escapeHtml(item)}</p>
        </article>`).join('')}
    </div>
    <div class="cs-decision-grid">
        ${(details.decisions || []).map(item => `
            <div>
                <span>${escapeHtml(item.label)}</span>
                <strong>${escapeHtml(item.value)}</strong>
            </div>`).join('')}
    </div>`;
}

function renderCaseOutcome(projects, data, d) {
    const details = data.details;
    return `
        <div class="cs-story-intro">
            <span>${escapeHtml(data.status || data.category)}</span>
            <p>${escapeHtml(details.outcome || details.stats)}</p>
        </div>
        <div class="cs-outcome-layout">
            <div class="cs-outcome-media">
                ${renderBeforeAfter(details.beforeAfter, d)}
                <div class="cs-gallery-label">${escapeHtml(d.csGallery)}</div>
                <div class="cs-gallery">${details.gallery.map((img, index) => `<div class="gallery-shell is-loading" data-placeholder="${escapeHtml(d.imageSlot)}" data-format="${escapeHtml(d.imageSlotFormat || '')}"><img src="${escapeHtml(img)}" alt="${escapeHtml(data.title)} asset ${index + 1}" loading="lazy"></div>`).join('')}</div>
            </div>
            <aside class="cs-outcome-summary">
                <div class="cs-result-grid">
                    <div>
                        <span>${escapeHtml(d.csSolution)}</span>
                        <p>${escapeHtml(details.solution)}</p>
                    </div>
                    <div>
                        <span>${escapeHtml(d.csOutcome)}</span>
                        <strong>${escapeHtml(details.outcome || details.stats)}</strong>
                    </div>
                </div>
                <div class="cs-meta-row">
                    <div><span>${escapeHtml(d.csTools)}</span><strong>${escapeHtml(details.tools.join(' / '))}</strong></div>
                </div>
                <div class="cs-stats-highlight">[ ${escapeHtml(details.stats)} ]</div>
                ${renderCaseDeliverables(details, d)}
            </aside>
        </div>
        ${renderCaseCta(d, data)}
        ${renderSimilarProjects(projects, data, d)}`;
}

function renderCaseCta(d, data) {
    const brief = buildCaseBriefMessage(d, data.title);
    return `<div class="case-study-cta">
        <div>
            <span>${escapeHtml(d.caseCtaKicker || 'Start a project')}</span>
            <h3>${escapeHtml(d.caseCtaTitle || 'Want something similar?')}</h3>
            <p>${escapeHtml(d.caseCtaText || '')}</p>
        </div>
        <div class="case-study-actions">
            <button class="feature-cta feature-cta-secondary hover-target" type="button" data-copy-case-brief="${escapeHtml(brief)}">${escapeHtml(d.copyBrief || 'COPY BRIEF')}</button>
            <a class="feature-cta hover-target" href="#contact" data-case-brief="${escapeHtml(data.title)}">${escapeHtml(d.caseCtaButton || d.heroSecondaryCta)}</a>
        </div>
    </div>`;
}

function buildCaseBriefMessage(d, title) {
    return `${d.caseBriefIntro || 'Hi, I want to create something similar to:'} ${title}

${d.packageMessageOutro || 'My project / deadline / references:'}`;
}

function renderCaseDeliverables(details, d) {
    if (!details.deliverables?.length) return '';
    return `<div class="cs-deliverables">
        <div class="cs-gallery-label">${escapeHtml(d.csDeliverables)}</div>
        <ul>${details.deliverables.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
    </div>`;
}

function renderBeforeAfter(beforeAfter, d) {
    if (!beforeAfter) return '';
    return `<div class="before-after-block">
        <div class="cs-gallery-label">${escapeHtml(d.compareLabel)}</div>
        <div class="before-after-slider" style="--split: 50%" data-placeholder="${escapeHtml(d.imageSlot)}" data-format="${escapeHtml(d.imageSlotFormat || '')}">
            <img src="${escapeHtml(beforeAfter.before)}" alt="${escapeHtml(d.beforeLabel)}">
            <div class="after-layer"><img src="${escapeHtml(beforeAfter.after)}" alt="${escapeHtml(d.afterLabel)}"></div>
            <span class="ba-label ba-before">${escapeHtml(d.beforeLabel)}</span>
            <span class="ba-label ba-after">${escapeHtml(d.afterLabel)}</span>
            <input class="ba-range hover-target" type="range" min="0" max="100" value="50" aria-label="${escapeHtml(d.compareLabel)}">
        </div>
    </div>`;
}

function renderSimilarProjects(projects, current, d) {
    return `<div class="similar-projects">
        <div class="cs-gallery-label">${escapeHtml(d.csSimilar)}</div>
        <div class="similar-grid">
            ${projects.filter(project => project.id !== current.id).slice(0, 3).map(project => `
                <button class="similar-card hover-target" type="button" data-id="${escapeHtml(project.id)}">
                    <span>${escapeHtml(project.category)}</span>
                    <strong>${escapeHtml(project.title)}</strong>
                </button>`).join('')}
        </div>
    </div>`;
}

function initGalleryFallbacks() {
    qsa('.cs-gallery img').forEach(img => {
        const shell = img.closest('.gallery-shell');
        const markLoaded = () => shell?.classList.remove('is-loading', 'image-missing');
        img.onload = markLoaded;
        img.onerror = () => {
            img.remove();
            shell?.classList.remove('is-loading');
            shell?.classList.add('image-missing');
        };
        if (img.complete) markLoaded();
    });
}

function initBeforeAfterSliders() {
    qsa('.before-after-slider').forEach(slider => {
        const range = qs('.ba-range', slider);
        qsa('img', slider).forEach(img => {
            img.onerror = () => {
                slider.classList.add('image-missing');
                qsa('img', slider).forEach(item => item.remove());
            };
        });
        range?.addEventListener('input', () => {
            slider.style.setProperty('--split', `${range.value}%`);
        });
    });
}

function initUtilityNav() {
    const scrollLayer = qs(SELECTORS.scrollLayer);
    const backTop = qs('#backTopBtn');
    const stickyContact = qs('.mobile-sticky-contact');
    const stickyBrief = qs('.sticky-brief-cta');
    if (!scrollLayer || !backTop) return;
    let lastTop = scrollLayer.scrollTop;
    let fastTimer = null;

    const update = () => {
        const delta = Math.abs(scrollLayer.scrollTop - lastTop);
        document.body.classList.toggle('is-fast-scrolling', delta > 38);
        window.clearTimeout(fastTimer);
        fastTimer = window.setTimeout(() => document.body.classList.remove('is-fast-scrolling'), 180);
        lastTop = scrollLayer.scrollTop;
        const isScrolled = scrollLayer.scrollTop > 700;
        backTop.classList.toggle('is-visible', isScrolled);
        stickyContact?.classList.toggle('is-visible', scrollLayer.scrollTop > 320);
        stickyBrief?.classList.toggle('is-visible', scrollLayer.scrollTop > 520);
    };

    addRenderListener(backTop, 'click', () => scrollLayer.scrollTo({ top: 0, behavior: 'smooth' }));
    addRenderListener(stickyContact, 'click', event => {
        event.preventDefault();
        qs('#contact')?.scrollIntoView({ behavior: 'smooth' });
    });
    addRenderListener(stickyBrief, 'click', event => {
        event.preventDefault();
        setContactMode('form');
        qs('#contact')?.scrollIntoView({ behavior: 'smooth' });
        window.setTimeout(() => qs('#fallback-contact-form textarea[name="message"]')?.focus(), 450);
    });
    addRenderListener(scrollLayer, 'scroll', update, { passive: true });
    update();
}

function initMotionToggle(lang) {
    const button = qs('#motionToggle');
    if (!button) return;
    const d = getTranslations(activeLang || lang);
    const saved = localStorage.getItem('overr_reduce_motion') === 'true';
    const setReduced = enabled => {
        document.body.classList.toggle('reduce-motion', enabled);
        button.setAttribute('aria-pressed', String(enabled));
        button.textContent = enabled ? (d.motionReduced || d.reduceMotion) : (d.reduceMotion || 'REDUCE MOTION');
        localStorage.setItem('overr_reduce_motion', String(enabled));
    };

    setReduced(saved);
    addRenderListener(button, 'click', () => setReduced(!document.body.classList.contains('reduce-motion')));
}

function initSiteGuide(lang) {
    const guide = qs('#siteGuide');
    const scrollLayer = qs(SELECTORS.scrollLayer);
    if (!guide || !scrollLayer) return;

    const d = getTranslations(activeLang || lang);
    const text = qs('#guideText', guide);
    const toggle = qs('#guideToggle', guide);
    const next = qs('[data-guide-next]', guide);
    const hide = qs('[data-guide-hide]', guide);
    const steps = [
        { id: 'home', selector: '#home', message: d.guideMessages?.home },
        { id: 'projects', selector: '#projects', message: d.guideMessages?.projects },
        { id: 'about', selector: '#about', message: d.guideMessages?.about },
        { id: 'process', selector: '#process', message: d.guideMessages?.process },
        { id: 'contact', selector: '#contact', message: d.guideMessages?.contact }
    ];
    let activeId = '';
    let frameId = null;
    const savedCollapsed = localStorage.getItem('overr_guide_collapsed') === 'true';
    const shouldStartCollapsed = savedCollapsed || window.matchMedia('(max-width: 760px)').matches;

    const getAbsoluteTop = el => {
        let top = el.offsetTop;
        if (el.closest('#dynamic-content')) top += qs('#dynamic-content')?.offsetTop || 0;
        return top;
    };

    const setCollapsed = collapsed => {
        guide.classList.toggle('is-collapsed', collapsed);
        toggle?.setAttribute('aria-expanded', String(!collapsed));
        localStorage.setItem('overr_guide_collapsed', String(collapsed));
    };

    const update = () => {
        frameId = null;
        const max = Math.max(1, scrollLayer.scrollHeight - scrollLayer.clientHeight);
        const progress = scrollLayer.scrollTop / max;
        const offset = Math.round((progress - 0.5) * 92);
        guide.style.setProperty('--guide-y', `${offset}px`);

        const anchor = scrollLayer.scrollTop + Math.min(window.innerHeight * 0.45, 380);
        let current = steps[0];
        steps.forEach(step => {
            const el = qs(step.selector);
            if (el && anchor >= getAbsoluteTop(el)) current = step;
        });

        if (current?.id && current.id !== activeId) {
            activeId = current.id;
            guide.dataset.section = activeId;
            if (text) text.textContent = current.message || '';
            guide.classList.remove('is-talking');
            window.requestAnimationFrame(() => guide.classList.add('is-talking'));
        }
    };

    const requestUpdate = () => {
        if (frameId) return;
        frameId = window.requestAnimationFrame(update);
    };

    const goNext = () => {
        const index = Math.max(0, steps.findIndex(step => step.id === activeId));
        const targetStep = steps[Math.min(index + 1, steps.length - 1)] || steps[1];
        const target = qs(targetStep.selector);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    setCollapsed(shouldStartCollapsed);
    addRenderListener(scrollLayer, 'scroll', requestUpdate, { passive: true });
    addRenderListener(window, 'resize', requestUpdate);
    addRenderListener(toggle, 'click', () => setCollapsed(!guide.classList.contains('is-collapsed')));
    addRenderListener(hide, 'click', () => setCollapsed(true));
    addRenderListener(next, 'click', goNext);
    update();
}

function initDisconnect() {
    const btn = qs('#disconnect-btn');
    const flash = qs('#screen-flash');
    const scrollLayer = qs(SELECTORS.scrollLayer);
    if (btn && flash) {
        addRenderListener(btn, 'click', () => {
            flash.classList.add('flash-active');
            setTimeout(() => { scrollLayer.scrollTop = 0; }, 250);
            setTimeout(() => { flash.classList.remove('flash-active'); }, 600);
        });
    }
}

window.OverrPortfolio = {
    renderDynamicContent,
    updateDynamicLanguage,
    initMobileNav
};
})();
