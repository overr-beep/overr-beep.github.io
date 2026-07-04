const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "figma");
const outFile = path.join(outDir, "overr-portfolio-homepage.svg");
const readmeFile = path.join(outDir, "README.md");

function asset(relPath) {
  const file = path.join(root, relPath);
  const ext = path.extname(file).toLowerCase();
  const mime = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
  }[ext];

  if (!mime) throw new Error(`Unsupported asset type: ${relPath}`);
  return `data:${mime};base64,${fs.readFileSync(file).toString("base64")}`;
}

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function text(x, y, content, size, weight = 700, fill = "#0D1117", extra = "") {
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="Inter, SF Pro Display, Arial, sans-serif" font-size="${size}" font-weight="${weight}" letter-spacing="0" ${extra}>${esc(content)}</text>`;
}

function multiline(x, y, lines, size, weight = 700, fill = "#0D1117", leading = 1.12, extra = "") {
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="Inter, SF Pro Display, Arial, sans-serif" font-size="${size}" font-weight="${weight}" letter-spacing="0" ${extra}>${lines
    .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : size * leading}">${esc(line)}</tspan>`)
    .join("")}</text>`;
}

function rect(x, y, w, h, r = 8, fill = "#FFFFFF", stroke = "none", extra = "") {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" ${extra}/>`;
}

function image(id, relPath, x, y, w, h, r = 8, mode = "slice", extra = "") {
  const clipId = `clip-${id}`;
  const preserve = mode === "meet" ? "xMidYMid meet" : "xMidYMid slice";
  return `
    <clipPath id="${clipId}">${rect(x, y, w, h, r, "#fff")}</clipPath>
    <image x="${x}" y="${y}" width="${w}" height="${h}" href="${asset(relPath)}" preserveAspectRatio="${preserve}" clip-path="url(#${clipId})" ${extra}/>
  `;
}

function button(x, y, label, primary = true, w = 170) {
  return `
    ${rect(x, y, w, 48, 8, primary ? "#007EFF" : "rgba(255,255,255,0.04)", primary ? "none" : "rgba(255,255,255,0.28)")}
    ${text(x + 20, y + 30, label, 14, 750, "#FFFFFF")}
  `;
}

function caseCard(id, x, y, w, h, relPath, title, label, highlighted = false) {
  const mediaH = Math.round(w * 9 / 16);
  return `
    <g id="${id}">
      ${rect(x, y, w, h, 8, highlighted ? "#F2F8FF" : "#FFFFFF", highlighted ? "#57A9FF" : "rgba(13,17,23,0.10)", `filter="${highlighted ? "url(#blueShadow)" : "url(#softShadow)"}"`)}
      ${image(`${id}-image`, relPath, x, y, w, mediaH, 8)}
      ${text(x + 22, y + mediaH + 34, label, 11, 820, "#007EFF")}
      ${text(x + 22, y + mediaH + 68, title, highlighted ? 34 : 24, 820, "#0D1117")}
      ${multiline(x + 22, y + mediaH + (highlighted ? 104 : 96), ["Project presentation and visual", "system prepared for portfolio review."], 14, 520, "#5F6672", 1.45)}
      ${rect(x + 22, y + h - 58, 128, 36, 8, "rgba(0,126,255,0.08)", "rgba(0,126,255,0.22)")}
      ${text(x + 38, y + h - 35, "View case", 12, 780, "#007EFF")}
    </g>
  `;
}

function skillCard(x, y, w, title, copy) {
  return `
    <g>
      ${rect(x, y, w, 150, 8, "#FFFFFF", "rgba(13,17,23,0.10)", 'filter="url(#softShadow)"')}
      ${rect(x + 18, y + 18, 34, 34, 17, "rgba(0,126,255,0.10)")}
      <circle cx="${x + 35}" cy="${y + 35}" r="7" fill="none" stroke="#007EFF" stroke-width="2"/>
      ${text(x + 18, y + 76, title, 17, 800, "#0D1117")}
      ${multiline(x + 18, y + 102, copy, 12, 520, "#5F6672", 1.35)}
    </g>
  `;
}

function visualCard(id, x, y, w, h, relPath, title, label) {
  return `
    <g id="${id}">
      ${rect(x, y, w, h + 72, 8, "#080B10", "rgba(13,17,23,0.10)", 'filter="url(#softShadow)"')}
      ${image(`${id}-image`, relPath, x, y, w, h, 8)}
      ${text(x + 14, y + h + 28, label, 10, 760, "rgba(255,255,255,0.66)")}
      ${text(x + 14, y + h + 54, title, 16, 800, "#FFFFFF")}
    </g>
  `;
}

const logo = asset("overrlogo.svg");
const W = 1440;
const H = 3180;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="22" stdDeviation="28" flood-color="#0A1020" flood-opacity="0.12"/></filter>
    <filter id="blueShadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="30" stdDeviation="34" flood-color="#007EFF" flood-opacity="0.22"/></filter>
    <radialGradient id="heroGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1250 210) rotate(133) scale(720 520)">
      <stop stop-color="#007EFF" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#007EFF" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="darkHero" x1="0" y1="0" x2="1440" y2="780" gradientUnits="userSpaceOnUse">
      <stop stop-color="#05070B"/>
      <stop offset="1" stop-color="#071226"/>
    </linearGradient>
    <linearGradient id="lightBg" x1="0" y1="780" x2="0" y2="3180" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFFFFF"/>
      <stop offset="0.55" stop-color="#F7F9FC"/>
      <stop offset="1" stop-color="#FFFFFF"/>
    </linearGradient>
  </defs>

  <g id="Desktop / Portfolio Home">
    ${rect(0, 0, W, H, 0, "url(#lightBg)")}

    <g id="Hero">
      ${rect(0, 0, W, 780, 0, "url(#darkHero)")}
      <rect x="0" y="0" width="${W}" height="780" fill="url(#heroGlow)"/>
      <line x1="116" y1="779" x2="1324" y2="779" stroke="rgba(255,255,255,0.16)"/>

      <g id="Header">
        <image x="112" y="30" width="48" height="48" href="${logo}"/>
        ${text(178, 60, "Lukasz Michalski", 14, 820, "#FFFFFF")}
        ${text(540, 60, "Work", 13, 760, "#FFFFFF")}
        ${text(620, 60, "About", 13, 650, "rgba(255,255,255,0.78)")}
        ${text(706, 60, "Services", 13, 650, "rgba(255,255,255,0.78)")}
        ${text(808, 60, "Skills", 13, 650, "rgba(255,255,255,0.78)")}
        ${text(890, 60, "Contact", 13, 650, "rgba(255,255,255,0.78)")}
        ${rect(1176, 24, 132, 48, 8, "#007EFF")}
        ${text(1204, 54, "Hire me", 13, 800, "#FFFFFF")}
      </g>

      <g id="Hero Copy">
        ${text(112, 176, "GRAPHIC DESIGNER & DTP SPECIALIST", 13, 820, "#007EFF")}
        ${multiline(112, 254, ["I design with detail in mind.", "I create with", "impact."], 58, 840, "#FFFFFF", 1.05)}
        ${text(412, 376, "impact.", 58, 840, "#007EFF")}
        ${multiline(112, 454, ["I create visual systems for brands, creators and digital products.", "From concept to print-ready files, I design with precision and purpose."], 16, 520, "rgba(255,255,255,0.74)", 1.45)}
        ${button(112, 548, "View selected work", true, 190)}
        ${button(320, 548, "Download CV", false, 156)}
        ${button(492, 548, "Contact me", false, 150)}

        <g id="Stats">
          ${text(112, 682, "100+", 30, 840, "#FFFFFF")}
          ${text(112, 706, "Completed projects", 12, 520, "rgba(255,255,255,0.66)")}
          ${text(272, 682, "5+", 30, 840, "#FFFFFF")}
          ${text(272, 706, "Years of experience", 12, 520, "rgba(255,255,255,0.66)")}
          ${text(424, 682, "100%", 30, 840, "#FFFFFF")}
          ${text(424, 706, "Passion for detail", 12, 520, "rgba(255,255,255,0.66)")}
          ${text(590, 682, "∞", 34, 840, "#FFFFFF")}
          ${text(590, 706, "Ideas & creativity", 12, 520, "rgba(255,255,255,0.66)")}
        </g>
      </g>

      <g id="Hero Visual / Yuzu">
        <g transform="translate(706 130) rotate(-4 310 210)">
          ${rect(0, 0, 620, 414, 14, "#FFFFFF", "rgba(255,255,255,0.18)", 'filter="url(#blueShadow)"')}
          ${image("hero-yuzu", "assets/portfolio/yuzu-mockup.png", 0, 0, 620, 414, 14)}
          <rect x="0" y="230" width="620" height="184" fill="rgba(0,0,0,0.32)"/>
          ${text(30, 330, "Packaging concept", 12, 800, "rgba(255,255,255,0.72)")}
          ${text(30, 374, "Yuzu Matcha", 42, 830, "#FFFFFF")}
        </g>
      </g>
    </g>

    <g id="Selected Case Studies" transform="translate(112 850)">
      ${text(0, 0, "SELECTED CASE STUDIES", 12, 820, "#007EFF")}
      ${multiline(0, 48, ["Selected work with real design", "systems behind it."], 38, 820, "#0D1117", 1.08)}
      ${caseCard("Case / Yuzu Matcha Highlight", 0, 126, 584, 548, "assets/portfolio/yuzu-mockup.png", "Yuzu Matcha", "BRANDING / PACKAGING / MOCKUPS", true)}
      ${caseCard("Case / Zlote Guziki", 612, 126, 286, 548, "assets/portfolio/zlote-guziki.png", "Zlote Guziki", "EVENT DESIGN", false)}
      ${caseCard("Case / EAFC 25", 926, 126, 286, 548, "assets/portfolio/eafc-inform-cards.png", "EAFC 25", "GAME UI", false)}
    </g>

    <g id="Visual Systems" transform="translate(112 1588)">
      ${text(0, 0, "VISUAL SYSTEMS", 12, 820, "#007EFF")}
      ${multiline(0, 48, ["Consistency that works", "across every format."], 38, 820, "#0D1117", 1.08)}
      <g id="System Cards" transform="translate(0 126)">
        ${rect(0, 0, 586, 586, 8, "#05070B", "none", 'filter="url(#softShadow)"')}
        ${image("system-zg", "assets/portfolio/zg-start.png", 0, 0, 586, 586, 8)}
        <rect x="0" y="340" width="586" height="246" fill="rgba(0,0,0,0.72)"/>
        ${text(24, 444, "Event identity / Stream package", 12, 800, "#007EFF")}
        ${text(24, 486, "Zlote Guziki", 30, 820, "#FFFFFF")}
        ${text(24, 522, "Tournament visual system", 16, 520, "rgba(255,255,255,0.74)")}

        ${rect(626, 0, 586, 586, 8, "#05070B", "none", 'filter="url(#softShadow)"')}
        ${image("system-ts4", "assets/portfolio/ts4-start.png", 626, 0, 586, 586, 8)}
        <rect x="626" y="340" width="586" height="246" fill="rgba(0,0,0,0.72)"/>
        ${text(650, 444, "Esports production", 12, 800, "#007EFF")}
        ${text(650, 486, "Turniej Synow IV", 30, 820, "#FFFFFF")}
        ${text(650, 522, "Broadcast assets", 16, 520, "rgba(255,255,255,0.74)")}
      </g>
    </g>

    <g id="Selected Visuals" transform="translate(112 2360)">
      ${text(0, 0, "SELECTED VISUALS", 12, 820, "#007EFF")}
      ${multiline(0, 48, ["Selected work across gaming,", "sport, music and more."], 38, 820, "#0D1117", 1.08)}
      <g id="Category Pills" transform="translate(688 22)">
        ${rect(0, 0, 54, 34, 8, "#007EFF")}
        ${text(18, 22, "All", 11, 780, "#FFFFFF")}
        ${rect(64, 0, 78, 34, 8, "#FFFFFF", "rgba(13,17,23,0.10)")}
        ${text(82, 22, "Gaming", 11, 700, "#0D1117")}
        ${rect(152, 0, 116, 34, 8, "#FFFFFF", "rgba(13,17,23,0.10)")}
        ${text(170, 22, "Social Media", 11, 700, "#0D1117")}
        ${rect(278, 0, 84, 34, 8, "#FFFFFF", "rgba(13,17,23,0.10)")}
        ${text(296, 22, "Branding", 11, 700, "#0D1117")}
        ${rect(372, 0, 62, 34, 8, "#FFFFFF", "rgba(13,17,23,0.10)")}
        ${text(390, 22, "Print", 11, 700, "#0D1117")}
      </g>

      <g id="16:9 Visuals" transform="translate(0 132)">
        ${visualCard("Visual / Ciucholandia", 0, 0, 386, 217, "assets/portfolio/ciucholandia.webp", "Ciucholandia", "PRINT / OPENING MATERIALS")}
        ${visualCard("Visual / TOTY", 413, 0, 386, 217, "assets/portfolio/toty-instagram.jpg", "TOTY", "GAME CONCEPT / SOCIAL")}
        ${visualCard("Visual / K11CK", 826, 0, 386, 217, "assets/portfolio/web/k11ck.jpg", "K11CK", "GAMING / KEY VISUAL")}
      </g>

      <g id="9:16 Visuals" transform="translate(0 458)">
        ${visualCard("Visual / Mbappe", 0, 0, 386, 686, "assets/portfolio/mbappe-poster.jpg", "Mbappe", "SPORTS / POSTER")}
        ${visualCard("Visual / Yamal", 413, 0, 386, 686, "assets/portfolio/web/yamal-poster.jpg", "Yamal", "SPORTS / POSTER")}
        ${visualCard("Visual / Abyss of the Forest", 826, 0, 386, 686, "assets/portfolio/forest-abyss.png", "Abyss of the Forest", "MUSIC / ALBUM COVER")}
      </g>
    </g>

    <g id="Skills and DTP" transform="translate(112 2860)">
      ${text(0, 0, "SKILLS", 12, 820, "#007EFF")}
      ${text(0, 46, "Practical skills backed by real deliverables.", 34, 820, "#0D1117")}
      <g transform="translate(0 94)">
        ${skillCard(0, 0, 186, "Branding", ["Identity systems,", "key visuals."])}
        ${skillCard(204, 0, 186, "DTP / Print", ["Bleeds, CMYK,", "safe export."])}
        ${skillCard(408, 0, 186, "Social Media", ["Posts, banners,", "thumbnails."])}
        ${skillCard(612, 0, 186, "UI / Digital", ["Cards, interfaces,", "asset systems."])}
        ${skillCard(816, 0, 186, "Mockups", ["Product mockups,", "composition."])}
        ${skillCard(1020, 0, 192, "Adobe Suite", ["Photoshop,", "Illustrator, InDesign."])}
      </g>
    </g>
  </g>
</svg>
`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, svg);
fs.writeFileSync(readmeFile, `# Figma import

Import \`overr-portfolio-homepage.svg\` into Figma by dragging it onto the canvas.

This is an SVG handoff file, not a native \`.fig\` file. It contains a desktop artboard, editable text layers where possible, vector cards and embedded portfolio images.
`);

console.log(outFile);
