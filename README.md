# OVERR DESIGN Portfolio

Static portfolio site for OVERR DESIGN.

The current direction combines a premium minimal gallery with a light interactive layer: large project previews, fullscreen case studies, a reactive project index, PL/EN copy, and a simple brief form.

## Local Preview

Open `index.html` directly in a browser.

If you prefer a local URL:

```bash
py -m http.server 8000 --bind 127.0.0.1
```

Then visit:

```text
http://127.0.0.1:8000/
```

## Main Files

- `index.html` - page structure, SEO metadata, contact shell.
- `style.css` - premium minimal visual system and responsive layout.
- `script.js` - project data, PL/EN language switch, case study overlay, lab interaction, form mailto.
- `assets/project-*.svg` - current project preview visuals.
- `overrlogo.svg` - brand mark.
- `assets/OVERR-portfolio.pdf` - downloadable PDF slot.

## Updating Content

Project cards and case studies are defined in `script.js` inside the `projects` array. Each project has Polish and English copy.

Recommended next improvements:

- Replace concept SVGs with polished final screenshots or WebP mockups.
- Replace `kontakt@overr.com` with the final email if needed.
- Replace `assets/OVERR-portfolio.pdf` with the final portfolio PDF.
- Add real client or recruitment links once available.

## Asset Direction

Use real project visuals whenever possible:

- UI: wide readable screenshots, ideally 16:10.
- Branding: logo applications, social kit, palette/type details.
- Key visual: strong master image plus campaign crops.
- Logo: mark, construction, small-size tests, production variants.
