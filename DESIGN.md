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
- Tonal layering and hairline rings instead of elevation shadows
- Timetable grid is the signature, not a card gallery

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
- **Headline** (700, 1.5rem / `text-2xl`, tracking-tight): Screen titles (Sinkronisasi Ganjil 2026/2027).
- **Title** (600, 1.125rem / `text-lg`): Section heads and dense tools.
- **Body** (400, 0.875rem / `text-sm`, ~1.5 line-height, measure 65ch on prose): UI copy and explanations.
- **Label** (500, 0.75rem / `text-xs`): Meta, chip text, jam ke- labels.
- **Mono** (400, ~11px): Token names in this document; not for “tech costume” on product UI.

### Named Rules
**The One Family Rule.** Do not pair a display serif or a second geometric sans. Geist does titles, controls, and data.

## Layout

Desktop: 16rem sidebar, remaining width is the board. Main padding `1.5rem` (`p-6`); mobile `1rem` plus a horizontal chip bar. Vertical rhythm: tight groups, `space-y-6` to `space-y-12` between sections. The timetable is a min-width ~720px table, days as columns, jam as rows. Filter chips sit above the grid. AI Resolve uses a list + three equal solution columns at `lg`. Do not fluid-scale headings.

## Elevation & Depth

Tonal, not lifted. Sidebar is a cooler gray field; cards are slightly lighter than Cool Sheet; separation is `ring-1 ring-foreground/10`. Dialogs use the shared popover surface and a light dim overlay, not a floating shadow stack.

### Shadow Vocabulary
- **None at rest.** Product cards and the grid do not ship `box-shadow` as elevation.
- **Focus** (`box-shadow` via `ring-3` / `--ring` at 50%): Press Blue, 3px, on buttons, inputs, and grid cells.

### Named Rules
**The Ring Not Shadow Rule.** Surfaces are flat. A 1px ring (or Press Blue focus ring) is the depth system. Do not add rest-state drop shadows to look “premium.”

## Shapes

Comfortable product radii: controls `0.625rem` (rounded-lg), cards and insight bar `0.875rem` (rounded-xl), chips and AI badges pill (`9999px`). Hairline borders on inputs; cards prefer the ink-tint ring over a heavy stroke. No thick left accent bars on conflict cards.

## Components

Quiet tools: compact, familiar, Indonesian labels. Primary fill is rare.

### Buttons
- **Shape:** 0.625rem corners, height 2rem default, horizontal padding 0.625rem, 0.875rem medium text.
- **Primary:** Press Blue fill, Press Blue ink text; hover at 80% opacity; active nudges 1px down.
- **Hover / Focus:** Focus is Press Blue ring 3px at 50%. Outline uses Cool Sheet + border; ghost is transparent until muted hover.
- **Disabled:** 50% opacity, no pointer. Publish stays disabled while conflicts remain.

### Chips
- **Style:** Pill. Selected = Press Blue fill. Idle = muted field + muted text.
- **State:** Used for role switch, kelas/guru filters. Never black-on-white inversion for “selected.”

### Cards / Containers
- **Corner Style:** 0.875rem
- **Background:** Surface
- **Shadow Strategy:** Ring, not shadow (see Elevation)
- **Border:** `ring-foreground/10`
- **Internal Padding:** 1rem (`--spacing(4)`); sm cards 0.75rem

### Inputs / Fields
- **Style:** Height 2rem, 0.625rem radius, transparent fill, `border-input`
- **Focus:** Border and ring become Press Blue
- **Error / Disabled:** Destructive ring; disabled muted fill at 50% opacity. Caret is Press Blue.

### Navigation
- **Sidebar:** Cooler gray column, 16rem, hidden below `md`. Brand lockup is “Grafika” + “Intelligent Scheduling.”
- **Default:** Muted text, 0.875rem, 0.75rem padding, 0.625rem radius.
- **Active:** Nav wash + Press Blue text, medium weight.
- **AI group:** Same Press Blue as the rest of the system; count pill when conflicts are open.
- **Mobile:** Horizontal scroller with the same selected-chip language.

### AI Badge
Pill, Press Blue, 11px medium, Sparkles icon at 12px. Marks machine output on titles, cells, and insight bars.

### AI Insight Bar
0.875rem radius, Press wash field, 32px Press Blue icon well, title in ink, optional primary action on the right. Used for prediction status and publish locks.

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
