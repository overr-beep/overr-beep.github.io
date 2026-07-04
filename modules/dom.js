(function () {
    const SELECTORS = {
        scrollLayer: '#scrollLayer',
        revealTargets: '.glitch-reveal',
        mobileLinks: '.mobile-menu a',
        desktopLinks: '.nav-links-top a',
        card: '.bento-card',
        cardBg: '.card-bg[data-bg]',
        modeButton: '.mode-btn'
    };

    function qs(selector, root = document) {
        return root.querySelector(selector);
    }

    function qsa(selector, root = document) {
        return [...root.querySelectorAll(selector)];
    }

    function required(selector, root = document) {
        const el = qs(selector, root);
        if (!el) throw new Error(`Missing required element: ${selector}`);
        return el;
    }

    window.OverrDom = { SELECTORS, qs, qsa, required };
})();
