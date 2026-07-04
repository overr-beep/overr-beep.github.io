(function () {
const { contact: contactConfig } = window.OverrConfig;
const { getCurrentLang, getTranslations } = window.OverrI18n;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const COMMAND_ALIASES = {
    '?': 'help',
    commands: 'help',
    contact: 'email',
    mail: 'mailto',
    send: 'mailto',
    quick: 'mailto',
    copy: 'copy email'
};

function initTerminal() {
    const input = document.getElementById('terminal-input');
    const body = document.getElementById('terminal-body');
    const emailLine = document.getElementById('email-input-line');
    const prompt = emailLine?.querySelector('.prompt');
    const messageEditor = document.getElementById('message-editor');
    const textarea = document.getElementById('terminal-textarea');
    const sendBtn = document.getElementById('terminal-send-btn');
    if (!input || !body || !emailLine || !prompt || !messageEditor || !textarea || !sendBtn) return;

    let isProcessing = false;
    let userEmail = '';
    let pendingMessage = '';
    let history = [];
    let historyIndex = 0;
    const t = () => getTranslations(getCurrentLang());
    const cursorBlock = document.createElement('span');
    cursorBlock.className = 'terminal-cursor';
    emailLine.appendChild(cursorBlock);

    input.setAttribute('aria-label', t().termPromptEmail);

    qsaCommandChips().forEach(chip => {
        chip.addEventListener('click', () => {
            runRawInput(chip.dataset.terminalCommand || chip.textContent, true);
        });
    });

    input.addEventListener('keydown', async (e) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            recallHistory(-1);
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            recallHistory(1);
            return;
        }

        if (e.key !== 'Enter' || isProcessing) return;

        await runRawInput(input.value, true);
    });

    async function runRawInput(rawValue, echo) {
        if (isProcessing) return;
        const value = rawValue.trim();
        if (!value) return;

        pushHistory(value);
        input.value = '';
        isProcessing = true;
        input.disabled = true;
        if (echo) await addLog(`> ${value}`, false);
        await handleInput(value);
        isProcessing = false;
        if (emailLine.style.display !== 'none') {
            input.disabled = false;
            input.focus();
        }
    }

    sendBtn.addEventListener('click', async () => {
        const message = textarea.value.trim();
        if (!message) {
            textarea.style.borderColor = '#ef4444';
            setTimeout(() => { textarea.style.borderColor = 'rgba(59,130,246,0.2)'; }, 1000);
            return;
        }

        pendingMessage = message;
        sendBtn.disabled = true;
        messageEditor.style.display = 'none';
        showCommandLine(t().termPromptCommand, true);
        await addLog(t().termLogSaved, false);
        await processCompilation(userEmail, pendingMessage);
        sendBtn.disabled = false;
    });

    async function handleInput(rawValue) {
        const command = normalizeCommand(rawValue);

        if (command === 'help') {
            await printHelp();
            return;
        }

        if (command === 'clear') {
            clearLogs();
            await addLog(t().termClearDone, false, 'success');
            return;
        }

        if (command === 'reset') {
            resetFlow();
            await addLog(t().termResetDone, false, 'success');
            return;
        }

        if (command === 'email') {
            await addLog(`CONTACT_EMAIL: ${contactConfig.email}`, false, 'info');
            return;
        }

        if (command === 'copy email') {
            await copyContactEmail();
            return;
        }

        if (command === 'socials') {
            await printSocials();
            return;
        }

        if (command === 'mailto') {
            openMailto(userEmail, pendingMessage);
            await addLog(t().termMailtoOpen, false, 'info');
            return;
        }

        if (EMAIL_PATTERN.test(rawValue)) {
            await beginMessage(rawValue);
            return;
        }

        if (rawValue.includes('@')) {
            await addLog(t().termErrorEmail, true, 'error');
            await addLog(t().termEmailHint, false, 'info');
            return;
        }

        await addLog(t().termUnknownCommand.replace('{command}', rawValue), true, 'error');
        await addLog(t().termHelpHint, false, 'info');
    }

    async function beginMessage(email) {
        userEmail = email;
        pendingMessage = '';
        await addLog(`ID: ${email}`, false, 'info');
        await addLog(t().termLogUserOk, true, 'success');
        emailLine.style.display = 'none';
        messageEditor.style.display = 'flex';
        textarea.value = '';
        textarea.focus();
    }

    async function printHelp() {
        for (const line of t().termHelpLines) {
            await addLog(line, false, 'info');
        }
    }

    async function printSocials() {
        const socials = contactConfig.social;
        await addLog(`BEHANCE: ${socials.behance}`, false, 'info');
        await addLog(`DRIBBBLE: ${socials.dribbble}`, false, 'info');
        await addLog(`INSTAGRAM: ${socials.instagram}`, false, 'info');
        await addLog(`DISCORD: ${socials.discord}`, false, 'info');
        await addLog(`X: ${socials.x}`, false, 'info');
    }

    async function copyContactEmail() {
        try {
            await navigator.clipboard.writeText(contactConfig.email);
            await addLog(t().termCopiedTerminal, false, 'success');
        } catch {
            await addLog(t().termCopyFailed, true, 'error');
            openMailto(userEmail, pendingMessage);
        }
    }

    async function processCompilation(email, message) {
        await addLog(t().termLogQueued, false, 'success');
        await addLog(t().termLogReady, false, 'success');
        await addLog(t().termLogUplink);
        const progressLine = document.createElement('div');
        progressLine.className = 'terminal-line terminal-info';
        body.insertBefore(progressLine, emailLine);
        let progress = 0;

        return new Promise(resolve => {
            const interval = setInterval(async () => {
                progress += Math.floor(Math.random() * 15) + 5;
                if (progress > 100) progress = 100;
                const barChunks = Math.floor(progress / 5);
                const bar = '[' + '='.repeat(barChunks) + '&nbsp;'.repeat(20 - barChunks) + ']';
                progressLine.innerHTML = `UPLOADING... ${bar} ${progress}%`;
                body.scrollTop = body.scrollHeight;

                if (progress < 100) return;

                clearInterval(interval);
                setTimeout(async () => {
                    try {
                        await sendContactMessage(email, message);
                        await addLog(t().termLogSuccess, true, 'success');
                        await addLog(t().termLogNotice, false, 'info');
                        await addLog(t().termLogExpect, false, 'info');
                        await addLog(t().termLogTerminated);
                        resetFlow(false);
                    } catch (error) {
                        await addLog(`[ERROR] ${error.message}`, true, 'error');
                        await addLog(t().termFailedOptions, false, 'info');
                        showCommandLine(t().termPromptCommand);
                    }
                    resolve();
                }, 500);
            }, 150);
        });
    }

    async function sendContactMessage(email, message) {
        const payload = { email, message, source: 'overr-portfolio-terminal' };
        localStorage.setItem('overr_last_message', JSON.stringify({ ...payload, savedAt: new Date().toISOString() }));

        if (contactConfig.formEndpoint) {
            const response = await fetch(contactConfig.formEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('Contact endpoint rejected the message.');
            return;
        }

        openMailto(email, message);
    }

    function openMailto(email = '', message = '') {
        const subject = encodeURIComponent(email ? `Portfolio contact from ${email}` : 'Portfolio contact');
        const bodyText = encodeURIComponent(message ? `${message}\n\nReply to: ${email || 'not provided'}` : '');
        window.location.href = `mailto:${contactConfig.email}?subject=${subject}&body=${bodyText}`;
    }

    function showCommandLine(label, keepDisabled = false) {
        prompt.textContent = `C:\\OVERR\\CONTACT> ${label}`;
        emailLine.style.display = 'flex';
        input.disabled = keepDisabled;
        input.setAttribute('aria-label', label);
        if (!keepDisabled) input.focus();
    }

    function resetFlow(announcePrompt = true) {
        userEmail = '';
        pendingMessage = '';
        textarea.value = '';
        messageEditor.style.display = 'none';
        showCommandLine(t().termPromptEmail);
        if (announcePrompt) input.focus();
    }

    function normalizeCommand(value) {
        const normalized = value.trim().toLowerCase().replace(/\s+/g, ' ');
        return COMMAND_ALIASES[normalized] || normalized;
    }

    function pushHistory(value) {
        if (history[history.length - 1] !== value) history.push(value);
        history = history.slice(-20);
        historyIndex = history.length;
    }

    function recallHistory(direction) {
        if (!history.length) return;
        historyIndex += direction;
        if (historyIndex < 0) historyIndex = 0;
        if (historyIndex > history.length) historyIndex = history.length;
        input.value = history[historyIndex] || '';
        requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
    }

    function clearLogs() {
        body.querySelectorAll('.terminal-line:not(.active-line)').forEach(line => line.remove());
    }

    function qsaCommandChips() {
        return [...document.querySelectorAll('[data-terminal-command]')];
    }

    async function addLog(text, typing = true, tone = '') {
        const line = document.createElement('div');
        line.className = `terminal-line${tone ? ` terminal-${tone}` : ''}`;
        body.insertBefore(line, emailLine);
        if (typing) await typeWriter(text, line);
        else line.textContent = text;
        body.scrollTop = body.scrollHeight;
    }

    async function typeWriter(text, element, speed = 12) {
        element.textContent = '';
        for (let i = 0; i < text.length; i++) {
            element.textContent += text.charAt(i);
            body.scrollTop = body.scrollHeight;
            await new Promise(resolve => setTimeout(resolve, speed));
        }
    }
}

window.OverrTerminal = { initTerminal };
})();
