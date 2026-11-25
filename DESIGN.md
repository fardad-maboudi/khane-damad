# DESIGN.md: Khaneh Damaad («خانه داماد»)

> Source of truth for visual design decisions. Any agent or developer changing UI must read this first and follow it. Do not introduce new colors, fonts, radii, or motion patterns without updating this file.

## 1. Product & Brand

- **What it is:** Upscale Persian men's grooming salon and barbershop showcase web app in Lahijan, Gilan, with online appointment booking.
- **Tagline:** «بهترین ورژن خودت باش» ("Be your best version")
- **Audience:** Modern gentlemen, groom-party clients, and regular grooming customers in Lahijan looking for premium haircuts, beard styling, facial care, and online booking.
- **Concept:** *Old-world gentleman's heritage meets modern Mediterranean/Caspian craftsmanship.*
- **Feeling:** Grounded, masculine, reassuring. No rush, no stress. High trust and transparency. A subtle groom romance (wedding packages).
- **Reference moods:** Savile Row bespoke tailoring salons, classic English grooming parlors, Gilan tea gardens and green hills.

### Anti-goals (never do this)

- No neon or blue LED glows, no harsh monochrome carbon-black, no skull or edgy tattoo-shop motifs, no cold techno-minimalism.
- No pure `#ffffff` backgrounds or pure `#000000` text.
- No loud gradients, glassmorphism, or heavy shadows.

---

## 2. Design Tokens

Tokens live in `site/src/styles/site.css`. **Always use the tokens; never hardcode hex values in components.**

### 2.1 Color

| Family | Tokens | Role |
|---|---|---|
| **Deep Forest Green** (`brand` / `forest`) | `#0f2019` (900), `#1d3d30` (700), `#2f6049` (500) | Primary anchor: primary CTAs, mobile overlay, dark containers and sections |
| **Antique Brass** (`brass`) | `#b08d57` (500), `#c2a064` (400), `#e6d4ac` (200) | Luxury accent, used **sparingly**: badges, rating stars, hover fills, scrollbar thumb, focus rings |
| **Warm Ivory** (`ivory` / `surface`) | `#fcfaf5` (50), `#f7f2e7` (100), `#ede5d1` (200), `#ded3b9` (300) | Page canvas and surfaces (a linen/papyrus feel, like fine card stock) |
| **Charcoal / Ink** (`charcoal` / `ink`) | `#17181a` (900), `#232528` (800), `#5b5a52` (muted) | Text and contrast |
| **Crimson / Danger** (`danger`) | `#fbeeea` (50), `#f6dcd7` (100), `#8a2a22` (600), `#7a241c` (700), `#5c1b16` (900) | Validation alerts, destructive actions, and cancellation badges |

**Usage rules**

- Default page background: ivory 50 or 100. Alternate sections between ivory 50, ivory 100, and forest 900 for rhythm.
- Body text: charcoal 900 on ivory. Secondary text: muted `#5b5a52`.
- Brass is an accent, not a fill color for large areas. At most one or two brass moments per viewport.
- Text on forest backgrounds: ivory 50. Accent text on forest: brass 200 or 400.
- Check contrast (WCAG AA) whenever brass is used for text; prefer brass 500 only on large text or non-text elements.

### 2.2 Typography (RTL Persian)

| Role | Font | Notes |
|---|---|---|
| **Display** | Aref Ruqaa (رقعه) | Calligraphic. Reserved for prominent brand marks and stylized accents only. Never for body or long headings. |
| **Heading** | Estedad (استعداد) | Contemporary Iranian sans. Use `font-feature-settings: "ss01"` and `text-wrap: balance`. |
| **Body** | Vazirmatn (وزیرمتن) | Open counters. Use `text-wrap: pretty` and comfortable leading (`leading-8` / `leading-9`). |

**Rules**

- Prices (Toman), time slots, and calendar grids use the `.num` class (`font-variant-numeric: tabular-nums`) so Persian digits align.
- Persian digits throughout the UI copy.
- No letter-spacing on Persian text (it breaks letter joining).
- Provide real fallback stacks for every font.

### 2.3 Spacing

- Section vertical spacing: `--space-section: 5.5rem`, with a smaller responsive step on mobile (e.g. 3.5-4rem).
- Use one consistent 4/8-based scale everywhere. Prefer Tailwind's scale (`1, 2, 3, 4, 6, 8, 12, 16, 20, 24`).
- Whitespace is a brand value: it should always feel generous and calm. When in doubt, add space rather than remove it.
- Keep a consistent container max-width and horizontal gutters across all sections.

### 2.4 Radius & Shape

- Buttons and pills: `--radius-button: 999px` (pill).
- Cards and containers: soft bevels (around `1rem`-`2rem`). Keep one radius per component type.
- Hero image uses an architectural arch clip (`inset(...) round 999px 999px 2rem 2rem`).

### 2.5 Elevation

- Prefer borders (ivory 200/300) and tonal surface changes over shadows.
- If a shadow is needed, make it soft, low-opacity, and warm-tinted (never pure black).

---

## 3. Layout & RTL

- The whole site is **RTL** (`dir="rtl"`). Use **logical properties** only: `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`. Avoid `left`/`right`.
- Mirror directional icons and arrows (chevrons, "next/previous").
- Primary reading start is the **right** edge. Alignment, button fills, and sliders must respect it.
- Mobile first. Test at 360, 390, 768, 1024, 1280, 1536px. No horizontal overflow at any width.

---

## 4. Components

### Buttons

- **Primary:** forest background, ivory text, pill shape.
- **`.btn-fill`:** a brass fill sweeps in on hover from the reading-start side (right to left in RTL).
- **`.btn-press`:** `transform: scale(0.97)` on active/touch.
- Minimum touch target: **44x44px**, with comfortable space between adjacent targets.

### Cards

- Ivory surface, subtle border, soft radius, generous inner padding.
- Consistent internal rhythm: title, meta, description, action.

### Badges & Ratings

- Brass accents (badges, stars). Keep them small and rare.

### Images (`Photo.jsx` / `.img-fade`)

- Always reserve the aspect-ratio box (e.g. `ratio: "4/5"`) to avoid layout shift.
- Fade in only after the image has decoded.

### Navigation

- Mobile overlay uses forest green.
- Include a `.skip-link` (off-screen until focused, forest green).

---

## 5. Motion

**Principle:** subtle, tactile, unhurried. Motion should add calm polish, never draw attention to itself.

- **Easing tokens (CSS vars in `site.css`):** `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` for anything entering or responding to input, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` for on-screen movement (clip reveals), `--ease-soft` as the legacy default. Built-in `ease`/`ease-in` is never used on UI: it reads sluggish.
- **Duration tokens:** `--dur-press: 140ms`, `--dur-hover: 220ms`, `--dur-reveal: 620ms`, `--dur-hero: 780ms`. Interaction feedback stays under 300ms; only hero/entrance choreography goes longer.
- **Animate `transform`, `opacity` and `clip-path` only.** Never width/height/top/left or CSS variables on animated parents.
- **Hover motion is gated** behind `@media (hover: hover) and (pointer: fine)` — touch devices fire `:hover` on tap and that false positive is what makes mobile sites feel sticky (`img-zoom`, `lift`, `u-link`, `nav-link`, button icon nudges).
- **Entrances:** `.enter` (lead, travels 18px), `.enter-fade` (decoration, fades only), `.enter-clip` (media frame opens from the bottom, photo settles 1.07 → 1). One entrance per hero, staggered only through `--i` (90ms steps); decoration never travels. Scroll reveals use `Reveal` (`variant="up" | "fade" | "image"`).
- **Press feedback:** `.btn-press` → `scale(0.97)` at 140ms. Never animate from `scale(0)`; dialogs settle from `0.97`.
- **Page transition:** `.page-enter` (260ms `--ease-out`). Lightbox: `.lightbox-enter` / `.lightbox-figure`.
- **Hero entrance:** staggered `hero-rise` using the delay formula `calc(var(--i) * 90ms + 80ms)`; `hero-arch` for the clip-path photo reveal; `hero-stroke` for the SVG underline draw.
- **Page transition:** `page-in`.
- **Press feedback:** `.btn-press`.
- **Do not** add bouncy, spring-heavy, parallax-heavy, or looping decorative animations.
- **Reduced motion:** every keyframe animation (`rise`, `draw`, `arch-open`, `page-in`, `btn-fill`) must be disabled under `@media (prefers-reduced-motion: reduce)`. Any new animation must be added to that block.

---

## 6. Accessibility

- Focus ring: `:focus-visible { outline: 3px solid var(--color-brass-500); outline-offset: 3px; }`. Never remove it.
- Keyboard: logical tab order, skip link, visible focus on every interactive element.
- Semantic heading hierarchy (one `h1` per page, no skipped levels).
- Contrast: WCAG AA at minimum for all text.
- Custom scrollbar: slim, brass thumb (`--color-brass-400`) on ivory. Cosmetic only; it must not harm usability.
- All images need meaningful Persian `alt` text (decorative images get `alt=""`).

---

## 7. Content & Tone

- Persian copy is warm, respectful, and confident, never pushy or slangy.
- Emphasize bespoke service, sterilized individual tools, and master craftsmen with years of experience.
- Groom packages should feel celebratory but refined (think formal attire: black tuxedos, ivory silk shirts, brass cufflinks, botanical boutonnieres).

---

## 8. Agent Working Rules

1. Read this file before any UI change.
2. Reuse existing tokens and Tailwind utilities. Do not invent colors, fonts, radii, or spacing values.
3. Preserve RTL correctness (logical properties only).
4. Keep diffs minimal and focused. No unrelated refactors, no new dependencies without approval.
5. Respect `prefers-reduced-motion` for any motion you add or touch.
6. Verify visually at all breakpoints and check the console for errors and hydration warnings.
7. If a request conflicts with this file, flag it and ask before proceeding. If a design decision changes, update this file in the same change.

---

## 9. Quality Targets (from the styling audit)

| Dimension | Current | Goal |
|---|---|---|
| Color cohesion | 9.8 / 10 | Maintain |
| Persian RTL adaptation | 9.5 / 10 | Maintain |
| Micro-interactions | 9.2 / 10 | Maintain |
| Brand fit | 10 / 10 | Maintain |

Any change should keep or improve these, never lower them.
