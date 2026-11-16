---
name: Syntropic ATS
colors:
  surface: '#0e1323'
  surface-dim: '#0e1323'
  surface-bright: '#34394a'
  surface-container-lowest: '#080d1d'
  surface-container-low: '#161b2b'
  surface-container: '#1a1f30'
  surface-container-high: '#25293a'
  surface-container-highest: '#2f3446'
  on-surface: '#dee1f9'
  on-surface-variant: '#c7c4d8'
  inverse-surface: '#dee1f9'
  inverse-on-surface: '#2b3041'
  outline: '#918fa1'
  outline-variant: '#464555'
  surface-tint: '#c3c0ff'
  primary: '#c3c0ff'
  on-primary: '#1d00a5'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#4d44e3'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#adc6ff'
  on-tertiary: '#002e6a'
  tertiary-container: '#005cc6'
  on-tertiary-container: '#cedbff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#0e1323'
  on-background: '#dee1f9'
  surface-variant: '#2f3446'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  mono-code:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

The design system embodies the calculated precision, focus, and velocity of modern engineering and talent infrastructure. Inspired by Linear’s compact keyboard-first speed, Vercel’s monochromatic restraint, and Stripe’s structural confidence, it transforms high-volume talent sourcing and candidate scoring into a calm, frictionless operating environment. 

The aesthetic style is **Precision Utility with Atmospheric Glow**—an ultra-restrained dark-mode interface anchored by crisp micro-borders, deep cosmic surfaces, purposeful typographic density, and luminous AI-driven visual cues. It eschews gratuitous visual noise in favor of high contrast, typographic clarity, and information density tailored for recruiters, hiring managers, and founders who evaluate talent at scale.

## Colors

The palette is engineered around deep nocturnal layers, high-legibility slate values, and sharp semantic indicators.

### Background & Surface Hierarchy
- **Canvas Base (`#0B1020`):** Core application backdrop.
- **Sidebar & Navigation (`#0F172A`):** Anchored left-rail chrome providing structural depth.
- **Card Surface (`#151E32`):** Primary interactive plane for pipeline boards, candidate dossiers, and metric blocks.
- **Elevated / Hover Surface (`#1B2740`):** Context menus, popovers, active candidate rows, and modal dialogs.
- **Border / Divider (`#263449`):** 1px structural hairpins defining layout divisions and component edges.

### Brand Accents & AI
- **Primary Indigo (`#4F46E5`):** Primary interactions, affirmative CTAs, focused inputs.
- **Deep Indigo (`#3730A3`):** Active states, selection rings, and filled pressed states.
- **Electric Blue (`#3B82F6`):** Secondary interactive links, pipeline phase indicators, and live session status.
- **Soft Violet (`#8B5CF6`):** Dedicated indicator for autonomous agent activity, semantic resume parsing, and AI match calculations.
- **Pale Violet (`#F5F3FF`) / Light Indigo (`#EEF2FF`):** Micro-tinted badge backgrounds (rendered at 8–12% opacity in dark mode).

### Match Score & Semantic Tiers
- **Tier 90–100% (`#16A34A`):** Exceptional Fit.
- **Tier 80–89% (`#22C55E`):** High Potential.
- **Tier 70–79% (`#3B82F6`):** Qualified Contender.
- **Tier 60–69% (`#D97706`):** Borderline / Review Required.
- **Tier 40–59% (`#EA580C`):** Sub-Optimal Alignment.
- **Tier 0–39% (`#DC2626`):** Disqualified / Unmatched.

## Typography

The typographic system utilizes **Plus Jakarta Sans** for prominent headers, section anchors, and key metrics to instill structural clarity and modern geometric authority. **Inter** handles high-volume body copy, dense data tables, pipeline cards, and contextual controls where neutral legibility is paramount.

- Use tabular numbers (`font-variant-numeric: tabular-nums`) across all score badges, match percentages, salary figures, and pipeline counts to prevent layout jitter during live updates.
- Micro-labels (`label-sm`) default to uppercase tracking with `0.04em` letter-spacing when functioning as pipeline column headers or AI inference tags.

## Layout & Spacing

The dashboard relies on an asymmetric fixed/fluid hybrid grid:
- **Left Navigation Rail:** Persistent 240px desktop width (collapsible to 64px icon-rail on smaller viewports).
- **Core Workspace:** Fluid grid stretching to available width with a maximum boundary of `1600px`.
- **Candidate Detail Drawer / Split View:** 480px to 600px persistent secondary panel that docks to the right margin during multi-candidate reviews without displacing primary Kanban boards.

### Breakpoint Matrix
- **Mobile (< 768px):** Single-column stack. Kanban boards morph into horizontal swipe lists or tabbed columns. Sidebar collapses to bottom sheet or drawer. Margins reduce to `1rem`.
- **Tablet (768px – 1023px):** 8-column layout. Sidebar collapses to 64px icon rail. Candidate drawers open as overlay modals rather than side-by-side panes.
- **Desktop (1024px+):** 12-column layout with 24px gutters and 32px canvas margins. Enables simultaneous view of Kanban columns, quick-preview filters, and action bars.

## Elevation & Depth

Visual hierarchy in this dark environment is established primarily through **tonal separation and hairline borders**, rather than heavy drop shadows.

- **Baseline (`#0B1020`):** The ground plane. Never elevated.
- **Tier 1 Layer (`#151E32`):** Cards, Kanban columns, and list items. Outlined with a 1px border (`#263449`).
- **Tier 2 Layer (`#1B2740`):** Hovered cards, floating action toolbars, dropdowns, and slide-over sidebars. Layer is accentuated with a subtle ambient glow: `0 8px 24px -4px rgba(0, 0, 0, 0.45), 0 0 0 1px #263449`.
- **AI Highlight States:** When an element displays an AI-calculated insight or auto-match recommendation, pair `#151E32` with an inner border transition and a soft ambient violet back-glow: `0 0 20px -2px rgba(139, 92, 246, 0.15)`.
- Avoid colored drop shadows under standard UI elements. Shadows must remain deep charcoal or black tint to preserve enterprise gravity.

## Shapes

The geometry uses a dual-radius philosophy to balance data-dense containment with tactile feedback:
- **Cards, Modals, Panels, and Containers:** Fixed at `12px` (`rounded-lg` / `0.75rem`), yielding a cohesive frame for complex sub-components.
- **Buttons, Text Inputs, Segmented Controls, and Select Triggers:** Fixed at `8px` (`rounded-md` / `0.5rem`) for a snappy, precise feel.
- **Badges, Status Indicators, and Match Score Tiers:** Rendered as full pills (`9999px`) or compact `4px` tags to visually differentiate metadata from actionable triggers.

## Components

### Buttons
- **Primary:** Background `#4F46E5`, text `#F8FAFC`, radius `8px`, font weight `500`. Hover state transitions to `#4338CA` with an outline halo of `rgba(79, 70, 229, 0.35)`. Height: `36px` default, `32px` compact.
- **Secondary:** Background `#151E32`, border `1px solid #263449`, text `#F8FAFC`. Hover shifts background to `#1B2740`.
- **AI Action Button:** Subtle gradient background from `#4F46E5` to `#8B5CF6`, text `#F8FAFC`, paired with an inline sparkles icon.
- **Ghost / Minimal:** Background transparent, text `#94A3B8`, hover text `#F8FAFC`, hover background `rgba(255, 255, 255, 0.05)`.

### Input Fields & Controls
- **Inputs:** Background `#0F172A`, border `1px solid #263449`, text `#F8FAFC`, placeholder `#64748B`, height `36px`, radius `8px`. Active focus state triggers border `#4F46E5` with `0 0 0 2px rgba(79, 70, 229, 0.25)`.
- **Checkboxes & Radios:** `16px` dimension, border `1px solid #263449`, radius `4px` (checkbox) or circular (radio). Checked state utilizes `#4F46E5` with a high-contrast white glyph.

### Cards & Pipeline Columns
- **Kanban Column:** Background `#0F172A`, border `1px solid #263449`, radius `12px`, padding `12px`. Header includes uppercase stage name, candidate count tag, and quick-add icon.
- **Candidate Card:** Background `#151E32`, border `1px solid #263449`, radius `12px`, padding `12px 14px`. Hover state lifts card via border color change to `#3B82F6` and background to `#1B2740`. Contains applicant name, current role, match score pill, AI keyword tags, and elapsed stage timer.

### Score Badges & Data Chips
- **Match Score Badge:** Pill shape, height `22px`, font `JetBrains Mono` or `Inter` `11px` bold. Consists of a 10% opacity background of the respective score color, a matching colored text label, and an optional 6px glowing radial pulse dot.
- **Skills Chip:** Background `rgba(38, 52, 73, 0.6)`, text `#94A3B8`, border `1px solid rgba(38, 52, 73, 0.8)`, radius `4px`, padding `2px 8px`, font size `12px`.

### Candidate Detail Drawer
- Right-docked sheet (`#0F172A`), left border `1px solid #263449`. Features tabbed navigation (Overview, Resume Parse, AI Score Breakdown, Scorecard, Timeline). Resume parsing highlights extracted entities with tinted underlays corresponding to skills, tenure, and role mismatch alerts.