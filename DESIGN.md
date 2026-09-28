---
name: Grafika Intelligent Scheduling
description: Kurikulum sync board — Press Blue on Cool Sheet.
colors:
  press-blue: "oklch(0.52 0.155 247)"
  press-blue-ink: "oklch(0.99 0.01 247)"
  press-wash: "oklch(0.955 0.035 247)"
  cool-sheet: "oklch(0.985 0.006 247)"
  surface: "oklch(0.995 0.003 247)"
  sidebar: "oklch(0.962 0.012 247)"
  ink: "oklch(0.3 0.028 247)"
  muted: "oklch(0.955 0.012 247)"
  muted-text: "oklch(0.48 0.025 247)"
  border: "oklch(0.905 0.014 247)"
  nav-wash: "oklch(0.93 0.035 247)"
  danger: "oklch(0.55 0.2 25)"
  warning: "oklch(0.78 0.12 78)"
  warning-ink: "oklch(0.38 0.08 60)"
  success: "oklch(0.52 0.12 155)"
typography:
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "normal"
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.625rem"
  xl: "0.875rem"
  full: "9999px"
spacing:
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  section: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.press-blue}"
    textColor: "{colors.press-blue-ink}"
    rounded: "{rounded.lg}"
    padding: "0 0.625rem"
    height: "2rem"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "color-mix(in oklch, oklch(0.52 0.155 247) 80%, transparent)"
    textColor: "{colors.press-blue-ink}"
  button-outline:
    backgroundColor: "{colors.cool-sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0 0.625rem"
    height: "2rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted-text}"
    rounded: "{rounded.lg}"
    height: "2rem"
  chip-selected:
    backgroundColor: "{colors.press-blue}"
    textColor: "{colors.press-blue-ink}"
    rounded: "{rounded.full}"
    padding: "0.25rem 0.75rem"
  chip-idle:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-text}"
    rounded: "{rounded.full}"
    padding: "0.25rem 0.75rem"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0.25rem 0.625rem"
    height: "2rem"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "1rem"
  ai-badge:
    backgroundColor: "{colors.press-blue}"
    textColor: "{colors.press-blue-ink}"
    rounded: "{rounded.full}"
    padding: "0.125rem 0.5rem"
  nav-active:
    backgroundColor: "{colors.nav-wash}"
    textColor: "{colors.press-blue}"
    rounded: "{rounded.lg}"
    padding: "0.5rem 0.75rem"
---

# Design System: Grafika Intelligent Scheduling

## Overview

**Creative North Star: "The Sync Board"**

This is the kurikulum work surface for SMK Grafika: a cool sheet, a timetable grid, and one Press Blue that marks both human action and machine output. Density is product-like (Operate), not marketing. Geist carries every role; nothing performs “schooly” or “AI futurism.”

Blue is scarce on purpose. It appears on the primary control, the current selection, focus, and AI chrome. Conflict severity stays red and amber so a predicted clash is never mistaken for a brand flourish. Depth is tonal: Cool Sheet, a slightly grayer sidebar, a near-white card, a 1px ink-tinted ring. No rest-state drop shadows.

Rejected by the incumbent build and confirmed with the product owner: neon or glow “AI,” a second purple for intelligence, and hero-metric dashboards of big numbers.

**Key Characteristics:**
- One chromatic voice (Press Blue, hue 247) for action, selection, focus, and AI
- Cool Sheet neutrals, never warm cream
- Quiet tools: compact controls, familiar affordances, Indonesian task copy
- Tonal layering and hairline borders instead of elevation shadows
- Timetable grid is the signature, not a card gallery

## OpenAI Hybrid (structure)

GIS keeps the **Press Blue palette** (hue 247) but adopts an **editorial OpenAI-style shell**: pill interactive controls, 6px cards, hairline `border-border`, no rest-state box-shadow, 16px body in chrome, 28px medium page titles (`.gis-page-title`).

**Hybrid density:** shell, sidebar, forms, and hub pages use comfortable spacing (`p-6`–`p-8`, `--section-gap` 32px). **Operational zones stay compact:** schedule grid, CRUD `DataTable`, conflict/plotting lists keep `text-sm` and tight cell padding.

### Structural tokens (`globals.css`)
- `--radius-card`: 6px — panels, cards, dialogs, grid wrapper
- `--radius-pill`: 9999px — buttons, inputs, selects, badges, nav pills
- `--radius-link`: 4px — small in-grid corners
- `--page-max-width`: 1200px — main canvas cap
- `--shadow-surface` / `--shadow-lift`: `none` — depth from border + tone only

## Colors

A restrained cool family: paper, ink, and one bright working blue. Semantic red, amber, and green stay out of the brand lane.

### Primary
- **Press Blue** (`oklch(0.52 0.155 247)`): Primary buttons, selected chips, focus ring, caret, AI badge, insight icon well, active nav text. Same token as `--ai`. Its job is to say “act here” or “the machine marked this.”
- **Press wash** (`oklch(0.955 0.035 247)`): Insight bar, recommended-resolve card wash, light AI field. Secondary text on this field stays ink-tinted, not generic gray.

### Neutral
- **Cool Sheet** (`oklch(0.985 0.006 247)`): Page canvas.
- **Surface** (`oklch(0.995 0.003 247)`): Cards, popovers, grid cells at rest.
- **Sidebar** (`oklch(0.962 0.012 247)`): Nav column; one step grayer than the canvas.
- **Ink** (`oklch(0.3 0.028 247)`): Body and titles.
- **Muted / muted text** (`oklch(0.955 0.012 247)` / `oklch(0.48 0.025 247)`): Idle chips, meta, placeholders.
- **Border** (`oklch(0.905 0.014 247)`): Inputs, table rules, 1px rings mixed with `ink` at 10% for cards.

### Named Rules
**The One Voice Rule.** Press Blue is the only accent for action and AI. Do not introduce a second hue (purple, neon cyan) to mean “machine.”

**The Cool Sheet Rule.** Neutrals stay on hue 247. Warm gray, cream, and ivory are out.

## Typography

**Display Font:** Geist (ui-sans-serif, system-ui)
**Body Font:** Geist (same family)
**Label/Mono Font:** Geist Mono for token names and tabular times only

**Character:** One workhorse sans. Headings gain weight and tracking-tight, not a second face. Data times use `tabular-nums`.

### Hierarchy
- **Page title** (500, 1.75rem / `.gis-page-title`, tracking-tight): Screen titles (Sinkronisasi Ganjil 2026/2027).
- **Section** (500, 0.875rem / `text-sm`): Section labels in shell — not uppercase microtype.
- **Title** (500–600, 1.125rem / `text-lg`): Dense tool heads inside panels.
- **Body** (400, 1rem / `text-base` in shell, `text-sm` in tables/grid): UI copy; prose measure ~65ch.
- **Label** (500, 0.75rem–0.875rem): Meta, chip text, jam ke- labels.
- **Mono** (400, ~11px): Token names in this document; not for “tech costume” on product UI.

### Named Rules
**The One Family Rule.** Do not pair a display serif or a second geometric sans. Geist does titles, controls, and data.

## Layout

Desktop: 16rem sidebar, remaining width is the board capped at 1200px. Main padding `1.5rem`–`2rem` (`p-6`–`p-8`). Header ~64px, no heavy divider — whitespace separates chrome. Vertical rhythm: `space-y-6` to `space-y-8` in shell; `space-y-12` on marketing-style pages. The timetable is a min-width ~720px table, days as columns, jam as rows. Filter chips sit above the grid. AI Resolve uses a list + three equal solution columns at `lg`. Do not fluid-scale headings.

## Elevation & Depth

Tonal first, **border-only**. Sidebar is a cooler gray field; cards are slightly lighter than Cool Sheet; separation is `border border-border` (1px). **No rest-state box-shadow** on panels, hub cards, or buttons. Dialogs use popover surface + light dim overlay.

### Depth Vocabulary
- **Border** (`border-border`): Default edge for `.gis-panel`, cards, tables, dialogs.
- **Whisper hover** (`bg-muted/50`): Interactive hub cards and ghost nav — no translateY lift.
- **None on grid.** Timetable wrapper uses border only; cells stay flat fill.
- **Focus** (`ring-1` / `--ring` at 40%): Press Blue on buttons, inputs; grid cells keep ring-3 when interactive.

### Named Rules
**Border, not shadow.** Default depth is 1px hairline + tonal layer. Never stack drop shadows on cards at rest.

## Shapes

OpenAI hybrid radii: **pill** (`9999px`) for buttons, inputs, selects, badges, workflow chips, sidebar nav; **6px** (`--radius-card`) for cards, panels, insight bar, dialogs; **4px** (`--radius-link`) for in-grid cell corners. Hairline borders on all interactive surfaces. No thick left accent bars on conflict cards.

## Components

Quiet tools: compact, familiar, Indonesian labels. Primary fill is rare.

### Buttons
- **Shape:** Pill (`rounded-full`), height 2.25rem default (`h-9`), horizontal padding 1.25rem, 0.875rem medium text.
- **Primary:** Press Blue fill, Press Blue ink text; hover lightens mix; active nudges 1px down.
- **Hover / Focus:** Focus is Press Blue ring 1px at 40%. Outline is transparent + `border-border`; ghost is transparent until muted hover.
- **Disabled:** 50% opacity, no pointer. Publish stays disabled while conflicts remain.

### Chips
- **Style:** Pill. Selected = Press Blue fill. Idle = muted field + muted text.
- **State:** Used for role switch, kelas/guru filters. Never black-on-white inversion for “selected.”

### Cards / Containers
- **Corner Style:** 6px (`--radius-card`)
- **Background:** Surface
- **Shadow Strategy:** None at rest (see Elevation)
- **Border:** `border-border`
- **Internal Padding:** 1rem (`--spacing(4)`); sm cards 0.75rem

### Inputs / Fields
- **Style:** Height 2.5rem shell / 2rem compact table, pill radius, transparent fill, `border-input`
- **Focus:** Border and thin Press Blue ring
- **Error / Disabled:** Destructive ring; disabled muted fill at 50% opacity. Caret is Press Blue.

### Navigation
- **Sidebar:** Cooler gray column, 16rem, hidden below `md`. Brand lockup is “Grafika” + “Intelligent Scheduling.”
- **Default:** Ghost pill — muted text, 0.875rem, medium weight; hover `bg-muted/50`.
- **Active:** `bg-primary/5` + Press Blue text + 3px left bar; no filled block wash.
- **AI group:** Same Press Blue as the rest of the system; count pill when conflicts are open.
- **Mobile:** Horizontal scroller with the same selected-chip language.

### AI Badge
Pill, Press Blue, 11px medium, Sparkles icon at 12px. Marks machine output on titles, cells, and insight bars.

### AI Insight Bar
6px radius, `border-primary/15`, Press wash field, 32px Press Blue icon well, title in ink, optional primary action on the right. Used for prediction status and publish locks.

### Schedule Grid
Day × jam table. Empty cells dashed border. Rest cells muted/secondary. Unplotted: warning wash. AI-predicted error: destructive wash + ring; warning: amber wash. Conflict cells show the AI badge. Interactive cells use a Press Blue focus ring.

### Resolve Cards
Three equal columns. Rank-1 solution uses Press wash + Press Blue ring. Confidence is a Press Blue bar and percentage, never a second accent.

## Do's and Don'ts

### Do:
- **Do** use Press Blue for the one primary action on a screen, current selection, focus, and AI chrome.
- **Do** keep neutrals on hue 247 (Cool Sheet, sidebar, ink).
- **Do** separate conflict severity (danger/warning) from AI marking (Press Blue badge).
- **Do** set data times in tabular figures; keep prose near 65ch.
- **Do** label synthetic timetable data as dummy when a visitor could take it as SMK Grafika fact.

### Don't:
- **Don't** add a purple, neon, or glow layer to mean AI.
- **Don't** build dashboards from hero metrics (big number + label + sparkline).
- **Don't** drop-shadow cards at rest.
- **Don't** put a display serif or a second sans on product UI.
- **Don't** use a thick colored left bar on conflict or insight surfaces.
- **Don't** auto-apply an AI resolution in the interface; kurikulum applies it.
