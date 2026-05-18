---
name: Tour des Yoles
description: Coordination de présence et de ravitaillement pour une semaine en mer en Martinique
colors:
  bg: "#f8f5f0"
  surface: "#ffffff"
  surface-2: "#f0ece4"
  coral-fire: "#e04010"
  coral-light: "#f5622c"
  emerald-sea: "#00896f"
  emerald-light: "#00b591"
  golden-hour: "#c87a00"
  ink-deep: "#1a1008"
  danger: "#c83040"
typography:
  display:
    fontFamily: "Syne, sans-serif"
    fontSize: "34px"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Syne, sans-serif"
    fontSize: "22px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Syne, sans-serif"
    fontSize: "16px"
    fontWeight: 800
    lineHeight: 1.3
  body:
    fontFamily: "Figtree, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Figtree, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.3
  caption:
    fontFamily: "Figtree, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.10em"
rounded:
  sm: "9px"
  md: "12px"
  lg: "14px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "18px"
  xl: "28px"
components:
  button-primary:
    backgroundColor: "{colors.coral-fire}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "11px 18px"
  button-primary-hover:
    backgroundColor: "{colors.coral-light}"
  button-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-deep}"
    rounded: "{rounded.md}"
    padding: "11px 18px"
  button-danger:
    backgroundColor: "rgba(200,48,64,.08)"
    textColor: "{colors.danger}"
    rounded: "{rounded.md}"
    padding: "11px 18px"
  chip-default:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink-deep}"
    rounded: "{rounded.pill}"
    padding: "4px 11px"
  chip-me:
    backgroundColor: "{colors.coral-fire}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "4px 11px"
---

# Design System: Tour des Yoles

## 1. Overview

**Creative North Star: "L'Anse Dorée"**

The system reads like a secluded golden-hour cove in Martinique — warm ivory sand, sun-bleached surfaces, coral fire and emerald water cutting through with full saturation. Every surface is light because light is the point: guests use this on their phones under direct Caribbean sun, and dark interfaces fail in that context. The warmth is baked in, not decorative; the cream base (#f8f5f0) is tinted toward the brand hue family so it reads as deliberate rather than default.

Coral (#e04010) is the sun, used for every primary action, active state, and urgency signal. Emerald (#00896f) is the sea, used for confirmations, presence, and "covered" states. The two converge on the progress bar horizon line — the same gradient that appears on headings' accent underlines. Golden (#c87a00) exists as a tertiary for quantities and metadata, rarely surfaced. This restraint keeps the palette vibrant rather than chaotic.

Motion is present but purposeful: staggered fadeUp entrances on lists create rhythm without choreography. State transitions are fast (150–200ms). No bounce, no elastic — just clean ease-out-quart curves that feel native on mobile.

**Key Characteristics:**
- Light-first: warm ivory canvas, white panels, warm-tinted shadows
- Two saturated accents (coral + emerald) with a strict role split: coral = action/urgency, emerald = success/presence
- Syne for all structural text (bold, geometric) paired with Figtree for all content (humanist, legible small)
- Tactile affordances: 36px minimum touch target, generous hit areas, shadow lift on hover
- Progress bar as the signature element: coral→emerald gradient, the horizon line between sun and sea

## 2. Colors: The Martinique Palette

Three axes: warm sand grounds the surface; coral fire drives action; emerald sea confirms completion.

### Primary
- **Coral Fire** (#e04010): The primary action color. Every `.btn-primary`, active day chip, active nav link, focus ring, and urgency indicator. Its lighter sibling Coral Light (#f5622c) carries the gradient endpoint on buttons and the "me" chip.

### Secondary
- **Emerald Sea** (#00896f): The success and presence color. Presence-confirmed buttons, "done" item states, progress bar endpoint, date subtitles. Lighter variant (#00b591) used for gradients.

### Tertiary
- **Golden Hour** (#c87a00): Metadata, quantity labels. Rarely surfaced — it earns its visibility by scarcity.

### Neutral
- **Sand Warm** (#f8f5f0): Body background. Not pure white — the warm tint is load-bearing, it signals "sun-drenched" rather than "blank canvas."
- **Surface White** (#ffffff): Card and panel backgrounds. Pure white creates the lift off the sand base.
- **Surface Soft** (#f0ece4): Hover states, editing backgrounds, qty button resting state. Deepest neutral before reaching ink.
- **Ink Deep** (#1a1008): Near-black body text. Warm-tinted brown-black, never pure `#000`.
- **Ink Dim / Muted**: `rgba(26,16,8,.60)` and `rgba(26,16,8,.36)` for secondary and tertiary text.
- **Danger** (#c83040): Destructive actions only. Not used for "missing" items — that role belongs to coral.

### Named Rules

**The Horizon Rule.** The coral→emerald gradient appears in exactly two places: the progress bar fill and the 2px heading accent underline. These two surfaces echo each other intentionally. Applying this gradient anywhere else dilutes the metaphor.

**The Ink Tint Rule.** Every neutral — from background to shadow to ink — is tinted toward warm brown (hue ~25–30). Pure `#000`, `#fff`, or `#808080` are prohibited. Warmth is structural, not decorative.

## 3. Typography

**Display / Structural Font:** Syne (600, 800 weights)
**Body / Content Font:** Figtree (400, 500, 600 weights)

**Character:** Syne is condensed and geometric — it commands without apologizing. Figtree is humanist and open — it disappears into readability. The pairing creates a clear two-register system: Syne signals structure, Figtree delivers content. There is no ambiguity about which is which.

### Hierarchy
- **Display** (Syne 800, 34px, lh 1.1, ls -0.02em): Name picker heading only. The boarding moment.
- **Headline** (Syne 800, 22px, lh 1.2, ls -0.01em): Page titles (`.page-title`).
- **Title** (Syne 800, 16–18px, lh 1.3): Panel headings, day headings in Récap.
- **Body** (Figtree 600, 15px, lh 1.5): Item names, course names, button text, person names. Semi-bold is the default — 400 weight is reserved for supplementary copy only.
- **Label** (Figtree 600, 13px): Chips, nav links, presence names, secondary metadata.
- **Caption** (Figtree 600, 11px, ls 0.10em, uppercase): Section titles (`.section-title`). All-caps with wide tracking, never used below 11px.

### Named Rules

**The Syne Numeric Rule.** All quantities, counts, and progress labels (`item-count`, `course-target`, `qty-value`, `recap-item-count`) use Syne even though their surrounding text uses Figtree. Numbers are structural — they get the structural font.

## 4. Elevation

This system uses warm-tinted ambient shadows, not colored or sharp ones. Depth is conveyed through two levels: resting surfaces have a barely-visible lift; interactive surfaces gain a second, softer spread layer on hover or when elevated.

No tonal layering (Material-style container nesting). Depth comes from shadow only — surfaces are flat and white at rest.

### Shadow Vocabulary
- **Shadow SM** (`0 1px 4px rgba(90,55,20,.07)`): Default resting state for cards, buttons, chips, inputs. Barely perceptible but creates separation from the sand background.
- **Shadow MD** (`0 2px 8px rgba(90,55,20,.08), 0 8px 24px rgba(90,55,20,.05)`): Hover state on cards and interactive panels. Two-layer: a close shadow for definition and a far diffuse shadow for depth. Panels (`.panel`) use this at rest.

### Named Rules

**The Flat-At-Rest Rule.** Shadows appear by default only on panel-level containers (`.panel`). Cards and rows (`.item`, `.course-row`) rest with Shadow SM and lift to Shadow MD on hover. Buttons use a colored glow on their active state (e.g., `0 2px 8px rgba(224,64,16,.28)` on `.btn-primary`) which is distinct from the neutral shadow system.

## 5. Components

### Buttons

Bold and tactile. Generous padding, rounded corners, immediate feedback.

- **Shape:** Gently curved (12px radius); small variant (`.sm`) uses 9px
- **Primary:** Coral→Coral-Light diagonal gradient, white text, coral glow shadow (`0 2px 8px rgba(224,64,16,.28)`). Shadow lifts on hover, collapses on active. The only button with color.
- **Ghost:** White surface, warm border, Sand Soft on hover. The default for secondary actions.
- **Danger:** Desaturated danger tint background, danger-colored text. No solid red — destructive actions don't shout; they warn.
- **States:** Active scales to 97% + removes shadow. Disabled at 35% opacity with no shadow.

### Chips

Compact presence indicators and person labels.

- **Default:** Sand Soft background, warm border, Ink Dim text.
- **Me chip:** Coral→Coral-Light gradient, white text — the user's own identity in the crowd.
- **Radius:** Pill (999px). Chips are always full-pill; no squared chip variants.

### Cards / Item Rows

- **Corner Style:** Consistently curved (12px for `.item`, 11px for `.course-row`). Large radius (14px) for `.panel`.
- **Background:** Surface White (#fff) at rest; done-state uses the teal tint (`rgba(0,137,111,.08)`).
- **Shadow:** Shadow SM at rest, lifts to Shadow MD on hover.
- **Border:** Warm-tinted (`rgba(90,55,20,.11)`), strengthens to `.border-hi` on hover.
- **Internal Padding:** 12px standard (items), 11px 13px (course rows), 16px (panels).

### Inputs / Fields

- **Style:** Sand Warm background (#f8f5f0), warm border, 10–12px radius.
- **Focus:** Coral focus ring for primary fields (`0 0 0 3px rgba(224,64,16,.12)`); Teal focus ring for secondary/day fields (`0 0 0 3px rgba(0,137,111,.10)`). The ring color signals context.
- **Placeholder:** Ink Muted (`rgba(26,16,8,.36)`).

### Navigation

Frosted warm-cream bar, sticky at top. Two rows: brand identity + person selector (top), page tabs (bottom). Active tab: Coral bottom border + Coral text. Inactive: Ink Muted, no underline. The blur effect (`backdrop-filter: blur(20px)`) is the only glassmorphism in the system — reserved for the nav because it genuinely aids legibility over scrolling content.

### Progress Bar (Signature Component)

The horizon line. A 5px track of warm-tinted mist (`rgba(90,55,20,.10)`) with a coral→emerald gradient fill. The fill has a subtle emerald glow (`box-shadow: 0 0 5px rgba(0,137,111,.28)`) that intensifies when the item is complete. Width animates with `cubic-bezier(.4,0,.2,1)` over 350ms. This component appears on every item card and is the visual heartbeat of the app.

## 6. Do's and Don'ts

### Do:
- **Do** use Coral Fire (#e04010) exclusively for primary actions, active states, and urgency. Its scarcity is what makes it read as "tap here."
- **Do** use Emerald Sea (#00896f) for all confirmations: presence on, item covered, "done" badges.
- **Do** keep the coral→emerald gradient in exactly two places: the progress bar fill and the 2px heading accent underlines.
- **Do** use Syne for all quantity and count displays, even when surrounded by Figtree copy.
- **Do** tint every neutral toward warm brown. Background, border, shadow, and ink all carry the same hue family.
- **Do** use the two-level shadow system: Shadow SM for resting cards, Shadow MD for panels and hover states.
- **Do** give every interactive element a minimum 36px touch target — guests use this on a moving boat.

### Don't:
- **Don't** reproduce the aesthetic of corporate dashboards (Linear, Notion, Jira). No cold greys, no flat-neutral surfaces, no dense information hierarchy. This is between friends on a boat.
- **Don't** use generic SaaS UI patterns: hero-metric tiles (big number + small label + gradient accent), identical card grids, or modal-first interaction patterns.
- **Don't** use glassmorphism except on the nav. The frosted nav is purposeful (scrolling legibility); glass panels everywhere become decorative and expensive on mobile GPUs.
- **Don't** use pure `#000` or pure `#fff` for any text, background, or border. Everything is warm-tinted.
- **Don't** apply the coral→emerald gradient to text, headings, or decorative elements. It belongs on the progress bar and heading underlines only.
- **Don't** use the danger color (#c83040) for "missing" item states. Coral handles urgency in this system; danger is reserved for destructive actions (delete buttons only).
- **Don't** add bounce or elastic easing. All transitions use ease-out-quart curves. Motion is responsive, not playful.
