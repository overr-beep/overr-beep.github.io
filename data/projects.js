(function () {
const projectImages = {
    gaming: "assets/images/gaming-hub-ui.webp",
    cyber: "assets/images/cyber-poster.webp",
    cyberBefore: "assets/images/cyber-poster-before.webp",
    cyberAfter: "assets/images/cyber-poster-after.webp",
    branding: "assets/images/esport-branding.webp",
    logo: "assets/images/tactical-logomark.webp"
};

const projectsByLang = {
    pl: [
        {
            id: "01",
            year: "2024",
            title: "GAMING HUB UI",
            category: "UI DESIGN",
            type: "ui",
            size: "card-large",
            status: "CLIENT / UI SYSTEM",
            img: projectImages.gaming,
            tags: ["UI", "UX", "Prototype", "Dashboard"],
            desc: "Turniejowy dashboard z ostrym stylem, czytelnymi statystykami i szybkim dostepem do akcji.",
            details: {
                client: "Gaming platform / tournament hub",
                timeline: "7 days",
                role: "UI/UX, prototyp, system komponentow",
                tools: ["Figma", "Photoshop", "Design Tokens"],
                scope: ["UX", "Prototype", "Design System"],
                challenge: "Zaprojektowanie interfejsu dla statystyk, drabinek i profili graczy bez utraty charakteru marki.",
                process: ["Audyt kluczowych sciezek", "Makiety dashboardu i widokow turnieju", "Biblioteka komponentow i stanow", "Prototyp mikrointerakcji"],
                solution: "Kontrastowa typografia, neonowe akcenty i system kart, ktory pomaga skanowac dane bez wizualnego chaosu.",
                stats: "+45% szybsze dotarcie do priorytetowych akcji.",
                outcome: "Dashboard, ktory prowadzi gracza od statusu turnieju do najwazniejszej akcji bez szukania po ekranie.",
                deliverables: ["dashboard cover", "key screens", "component states", "interactive prototype"],
                decisions: [
                    { label: "Hierarchy", value: "Najwazniejsze akcje wyzej niz dekoracja." },
                    { label: "Mood", value: "Gamingowy kontrast bez utraty czytelnosci." }
                ],
                gallery: [projectImages.gaming, projectImages.branding]
            }
        },
        {
            id: "02",
            year: "2023",
            title: "CYBER POSTER",
            category: "FOTOMANIPULACJA",
            type: "photo",
            size: "card-portrait",
            status: "CONCEPT / KEY VISUAL",
            img: projectImages.cyber,
            tags: ["Poster", "Retouch", "Key Art", "Campaign"],
            desc: "Key visual w klimacie cyberpunk, przygotowany pod feed, story i baner kampanii.",
            details: {
                client: "Campaign / social launch",
                timeline: "3 days",
                role: "Art direction, retusz, compositing",
                tools: ["Photoshop", "Lightroom", "Midjourney"],
                scope: ["Retouch", "Poster", "Social Kit"],
                challenge: "Zbudowanie plakatu, ktory dziala mocno w social mediach i nadal czyta sie po pionowym kadrze.",
                process: ["Moodboard swiatla i palety", "Laczenie postaci, miasta i atmosfery", "Reczne maskowanie i korekcja koloru", "Eksport formatow kampanijnych"],
                solution: "Wyrazny punkt skupienia, zimna paleta i kontrolowany szum nadaja projektowi filmowy charakter.",
                stats: "3 formaty kampanijne z jednego master layoutu.",
                outcome: "Jeden key visual gotowy do feedu, story i banneru bez przebudowy kompozycji.",
                deliverables: ["master poster", "social crops", "before / after file", "export pack"],
                decisions: [
                    { label: "Focus", value: "Silna sylwetka w centrum kadru." },
                    { label: "Color", value: "Zimna paleta i kontrolowany kontrast." }
                ],
                beforeAfter: { before: projectImages.cyberBefore, after: projectImages.cyberAfter },
                gallery: [projectImages.cyberAfter, projectImages.cyberBefore]
            }
        },
        {
            id: "03",
            year: "2023",
            title: "E-SPORT BRANDING",
            category: "IDENTYFIKACJA",
            type: "branding",
            size: "card-wide",
            status: "CLIENT / BRAND SYSTEM",
            img: projectImages.branding,
            tags: ["Branding", "Logo", "Social Kit", "Stream"],
            desc: "Kompletny system wizualny dla organizacji e-sportowej: znak, overlaye, avatary i social kit.",
            details: {
                client: "E-sport organization",
                timeline: "10 days",
                role: "Brand system, logo, social kit",
                tools: ["Illustrator", "Figma", "Photoshop"],
                scope: ["Logo", "Brand Kit", "Social Kit"],
                challenge: "Stworzenie identyfikacji agresywnej na streamie, ale uporzadkowanej dla sponsorow, deckow i merchu.",
                process: ["Analiza konkurencji", "Szkice znaku i lockupow", "System koloru, typografii i patternow", "Pakiet overlayow i szablonow"],
                solution: "Elastyczny znak i modularne assety dzialaja jako mala ikona, overlay streamu i duzy baner turniejowy.",
                stats: "12 gotowych assetow startowych dla zespolu.",
                outcome: "Spójny system marki, ktory mozna szybko stosowac w streamie, socialach i materialach sponsorskich.",
                deliverables: ["logo variants", "color and type kit", "stream overlays", "social templates"],
                decisions: [
                    { label: "System", value: "Moduly zamiast pojedynczej grafiki." },
                    { label: "Use", value: "Czytelnosc od avatara do banneru." }
                ],
                gallery: [projectImages.branding, projectImages.gaming]
            }
        },
        {
            id: "04",
            year: "2022",
            title: "TACTICAL LOGOMARK",
            category: "LOGO",
            type: "logo",
            size: "card-standard",
            status: "SELECTED / LOGOMARK",
            img: projectImages.logo,
            tags: ["Logo", "Vector", "Brand Guide"],
            desc: "Minimalistyczny znak wektorowy dla marki odziezowej, czytelny od favicony po duzy nadruk.",
            details: {
                client: "Apparel brand",
                timeline: "4 days",
                role: "Logo design, wektor, mini brand guide",
                tools: ["Illustrator", "Figma"],
                scope: ["Logo", "Vector", "Brand Guide"],
                challenge: "Zaprojektowanie znaku ostrego na naszywce, metce i faviconie bez utraty rozpoznawalnego ksztaltu.",
                process: ["Szkice sylwetki i negatywow", "Siatka konstrukcyjna", "Test czytelnosci w malych rozmiarach", "Eksport produkcyjny"],
                solution: "Kompaktowy logomark oparty na mocnym konturze, prostych katach i wariantach pod druk oraz haft.",
                stats: "Czytelny od 24 px do oversized print.",
                outcome: "Znak zachowuje charakter w malych rozmiarach i nadaje sie do druku, haftu oraz digitalu.",
                deliverables: ["vector mark", "mono variants", "favicon tests", "mini usage guide"],
                decisions: [
                    { label: "Shape", value: "Prosty kontur z mocnym negatywem." },
                    { label: "Production", value: "Test pod haft i mala ikone." }
                ],
                gallery: [projectImages.logo, projectImages.branding]
            }
        }
    ],
    en: [
        {
            id: "01",
            year: "2024",
            title: "GAMING HUB UI",
            category: "UI DESIGN",
            type: "ui",
            size: "card-large",
            status: "CLIENT / UI SYSTEM",
            img: projectImages.gaming,
            tags: ["UI", "UX", "Prototype", "Dashboard"],
            desc: "A tournament dashboard with sharp styling, readable statistics, and fast access to key actions.",
            details: {
                client: "Gaming platform / tournament hub",
                timeline: "7 days",
                role: "UI/UX, prototype, component system",
                tools: ["Figma", "Photoshop", "Design Tokens"],
                scope: ["UX", "Prototype", "Design System"],
                challenge: "Designing a clear interface for statistics, brackets, and player profiles without losing the brand edge.",
                process: ["Audit of core user paths", "Dashboard and tournament wireframes", "Component library with states", "Microinteraction prototype"],
                solution: "High-contrast typography, neon accents, and a card system make dense data easy to scan.",
                stats: "+45% faster access to priority actions.",
                outcome: "A dashboard that guides players from tournament status to the next key action without visual hunting.",
                deliverables: ["dashboard cover", "key screens", "component states", "interactive prototype"],
                decisions: [
                    { label: "Hierarchy", value: "Primary actions sit above decoration." },
                    { label: "Mood", value: "Gaming contrast without losing readability." }
                ],
                gallery: [projectImages.gaming, projectImages.branding]
            }
        },
        {
            id: "02",
            year: "2023",
            title: "CYBER POSTER",
            category: "PHOTOMANIPULATION",
            type: "photo",
            size: "card-portrait",
            status: "CONCEPT / KEY VISUAL",
            img: projectImages.cyber,
            tags: ["Poster", "Retouch", "Key Art", "Campaign"],
            desc: "A cyberpunk key visual prepared for feed, story, and campaign banner formats.",
            details: {
                client: "Campaign / social launch",
                timeline: "3 days",
                role: "Art direction, retouching, compositing",
                tools: ["Photoshop", "Lightroom", "Midjourney"],
                scope: ["Retouch", "Poster", "Social Kit"],
                challenge: "Creating a key visual that hits hard in social feeds and still reads after vertical crops.",
                process: ["Lighting and palette moodboard", "Character, city, and atmosphere compositing", "Manual masking and color correction", "Campaign format export"],
                solution: "A clear focal point, cold palette, and controlled noise give the piece a cinematic finish.",
                stats: "3 campaign formats from one master layout.",
                outcome: "One key visual prepared for feed, story, and banner formats without rebuilding the composition.",
                deliverables: ["master poster", "social crops", "before / after file", "export pack"],
                decisions: [
                    { label: "Focus", value: "Strong central silhouette." },
                    { label: "Color", value: "Cold palette with controlled contrast." }
                ],
                beforeAfter: { before: projectImages.cyberBefore, after: projectImages.cyberAfter },
                gallery: [projectImages.cyberAfter, projectImages.cyberBefore]
            }
        },
        {
            id: "03",
            year: "2023",
            title: "E-SPORT BRANDING",
            category: "IDENTITY",
            type: "branding",
            size: "card-wide",
            status: "CLIENT / BRAND SYSTEM",
            img: projectImages.branding,
            tags: ["Branding", "Logo", "Social Kit", "Stream"],
            desc: "A complete esports identity: mark, overlays, avatars, and social launch kit.",
            details: {
                client: "E-sport organization",
                timeline: "10 days",
                role: "Brand system, logo, social kit",
                tools: ["Illustrator", "Figma", "Photoshop"],
                scope: ["Logo", "Brand Kit", "Social Kit"],
                challenge: "Building an identity that feels aggressive on stream but organized enough for sponsors, decks, and merch.",
                process: ["Competitor analysis", "Mark and lockup sketches", "Color, type, and pattern system", "Overlay and template package"],
                solution: "A flexible mark and modular assets work as a small icon, stream overlay, and large tournament banner.",
                stats: "12 launch-ready assets for the team.",
                outcome: "A cohesive brand system that can move quickly across stream, social, and sponsor materials.",
                deliverables: ["logo variants", "color and type kit", "stream overlays", "social templates"],
                decisions: [
                    { label: "System", value: "Modules instead of a one-off graphic." },
                    { label: "Use", value: "Readable from avatar to event banner." }
                ],
                gallery: [projectImages.branding, projectImages.gaming]
            }
        },
        {
            id: "04",
            year: "2022",
            title: "TACTICAL LOGOMARK",
            category: "LOGO",
            type: "logo",
            size: "card-standard",
            status: "SELECTED / LOGOMARK",
            img: projectImages.logo,
            tags: ["Logo", "Vector", "Brand Guide"],
            desc: "A minimal vector mark for an apparel brand, readable from favicon to oversized print.",
            details: {
                client: "Apparel brand",
                timeline: "4 days",
                role: "Logo design, vector system, mini brand guide",
                tools: ["Illustrator", "Figma"],
                scope: ["Logo", "Vector", "Brand Guide"],
                challenge: "Designing a mark that stays sharp on patches, labels, and favicons without losing its distinctive shape.",
                process: ["Silhouette and negative-space sketches", "Construction grid", "Small-size readability testing", "Production exports"],
                solution: "A compact logomark built from a strong outline, clean angles, and variants for print and embroidery.",
                stats: "Readable from 24 px to oversized print.",
                outcome: "A mark that keeps its character at small sizes and works across print, embroidery, and digital use.",
                deliverables: ["vector mark", "mono variants", "favicon tests", "mini usage guide"],
                decisions: [
                    { label: "Shape", value: "Simple outline with strong negative space." },
                    { label: "Production", value: "Tested for embroidery and small-icon use." }
                ],
                gallery: [projectImages.logo, projectImages.branding]
            }
        }
    ]
};

function getProjects(lang) {
    return projectsByLang[lang] || projectsByLang.en;
}

window.OverrData = { projectsByLang, getProjects };
})();
