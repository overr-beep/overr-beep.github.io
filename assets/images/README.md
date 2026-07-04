Put real portfolio images in this folder.

The current site works without these files because stage one uses SVG fallbacks
from `assets/project-*.svg`. When you export real work, add the WebP files below
without changing the HTML. The JS project data already exposes `gallery`,
`beforeAfter`, and `pdf` fields for the next visual pass.

Expected filenames:
- about.webp
- gaming-hub-ui.webp
- cyber-poster.webp
- cyber-poster-before.webp
- cyber-poster-after.webp
- esport-branding.webp
- tactical-logomark.webp
- client-founder.webp
- client-content-lead.webp
- client-esport-manager.webp
- og-image.webp (1200x630 social sharing preview)

You can also use .jpg or .png, but update the paths in data/projects.js and modules/config.js.

Recommended crop system:
- UI / dashboard: 16:10, wide readable screenshots.
- Poster / key visual: 4:5 or 2:3, strong vertical crop.
- Branding: 16:9 hero plus square detail crops.
- Logo: 1:1, high contrast on dark background.
- Social / stream assets: 21:9 for banners, 1:1 for avatars.

Keep every image under ~350 KB when possible and export as WebP.

Before publishing a new case study, check:
- Hero image is readable in a wide crop.
- Gallery images are real project screens/mockups, not decorative fillers.
- Process crops explain the work: sketch, wireframe, detail, before/after, or export pack.
- Avatars are square and clear at small sizes.
- File names match the paths in `data/projects.js`.
