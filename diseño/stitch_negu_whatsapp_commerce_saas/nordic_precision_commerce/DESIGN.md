---
name: Nordic Precision Commerce
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#3d4a42'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#6d7a72'
  outline-variant: '#bccac0'
  surface-tint: '#006c4a'
  primary: '#006948'
  on-primary: '#ffffff'
  primary-container: '#00855d'
  on-primary-container: '#f5fff7'
  inverse-primary: '#68dba9'
  secondary: '#006a63'
  on-secondary: '#ffffff'
  secondary-container: '#99efe5'
  on-secondary-container: '#006f67'
  tertiary: '#006947'
  on-tertiary: '#ffffff'
  tertiary-container: '#00855b'
  on-tertiary-container: '#f5fff6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#85f8c4'
  primary-fixed-dim: '#68dba9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#9cf2e8'
  secondary-fixed-dim: '#80d5cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#00504a'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.03em
  display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.005em
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
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
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
The design system embodies hyper-minimalism, calm authority, and frictionless utility. Tailored for independent local merchants, culinary operators, and mobile consumers, the interface removes cognitive friction entirely. Visual inspiration draws from Scandinavian product design, Apple’s disciplined restraint, and Linear’s micro-precision.

The visual style is characterized by:
- **Quiet Clarity:** Heavy reliance on generous whitespace and calibrated typographic scale over decorative containers or heavy styling.
- **Micro-tactile Precision:** Hairline borders (1px) establish structure without visual noise. Surfaces feel light, airy, and purposefully organized.
- **Intentional Contrast:** Neutral backgrounds dominate 95% of the viewport, reserving focused, saturated emerald accents exclusively for primary conversion steps, transactional status cues, and key workflow actions.
- **Restraint Over Expression:** Zero gradients, no heavy drop shadows, no saturated micro-badges, and zero ornamentation. Every visual mark serves clear transactional orientation.

## Colors
The palette balances stark, functional clarity with high-precision slate neutrals and a selective botanical emerald punch.

### Palette Architecture
- **Primary (`#059669` - Forest Emerald):** The foundational action color. Used strictly for dominant interactive moments: checkout completion, order dispatch, primary CTA buttons, and verified system states.
- **Secondary (`#0f766e` - Deep Spruce):** Applied to structural status accents, active tab indicators, and high-emphasis analytical markers in merchant dashboards.
- **Tertiary (`#10b981` - Mint Accent):** Reserved for live status indicators (e.g., "Driver Approaching", "Order Accepted"), micro-callouts, and positive trend vectors.
- **Neutral Stack:**
  - Base White (`#ffffff`): Canvas background for primary interactive panels and cards.
  - Surface Muted (`#f9fafb`): Outer canvas and subtle secondary zones.
  - Surface Subtle (`#f3f4f6`): Hover states, chip backgrounds, and segmented controls.
  - Hairline Border (`#e5e7eb`): 1px structural partitions and card bounds.
  - Typography Muted (`#6b7280`): Metadata, secondary labels, and descriptive timestamps.
  - Typography Strong (`#111827`): Headlines, price tags, and primary item titles.

## Typography
The system employs a dual-sans typographic pairing optimized for scan-speed and informational density:
- **Headlines (`Plus Jakarta Sans`):** Provides a contemporary, geometric balance with clean apertures. Used for category navigation, restaurant branding, and high-level revenue figures. Tight tracking (-0.01em to -0.03em) yields an intentional, editorial structure.
- **Body & Labels (`Inter`):** Engineered for numerical clarity, checkout details, dynamic cart listings, and merchant order management. High x-height ensures immediate recognition at small sizes on outdoor mobile displays.

### Typographic Rules
- Always use `tnum` (tabular numbers) for item counts, timestamps, order IDs, and currency amounts to maintain vertical baseline rhythm in tables and order cards.
- Restrict uppercase text exclusively to `label-sm` when used for micro-status indicators (e.g., `PREPARING`, `DISPATCHED`).

## Layout & Spacing
The layout adheres to a structured, fluid grid philosophy with strict whitespace hierarchies:
- **Mobile Grid (0 - 639px):** 4 fluid columns, 16px (`gutter`) gutters, and 16px (`margin`) outer edge margins. Interactive components span 4 columns; items in double-column browsing grids span 2 columns.
- **Tablet Grid (640px - 1023px):** 8 fluid columns, 16px gutters, and 24px (`margin-tablet`) canvas margins.
- **Desktop Grid (1024px+):** 12 fluid columns constrained to a max-width of 1280px, with 24px (`gutter-desktop`) gutters and 40px (`margin-desktop`) outer padding. Order streams, analytics charts, and cart workflows align systematically into 3- or 4-column module clusters.

Vertical flow is strictly driven by the `space-*` scale. Component internals rely strictly on `space-xs` (4px), `space-sm` (8px), and `space-md` (16px) to eliminate sprawling paddings while keeping touch targets at 44px minimum.

## Elevation & Depth
Depth in this system is driven by **low-contrast outlines and subtle surface shifts**, strictly avoiding heavy, diffused drop shadows.

- **Base Layer:** The global foundation uses `#f9fafb`.
- **Raised Layer (Cards, Sheets, Modals):** Pure crisp white (`#ffffff`) bordered by a 1px solid hairline (`#e5e7eb`).
- **Elevated Modals & Floating Bars:** For elements that sit over active content (e.g., bottom sticky cart on mobile, merchant order popovers), use an ultra-refined, feather-light shadow paired with a hairline perimeter:
  - `box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 4px 12px 0 rgba(0, 0, 0, 0.04);`
  - `border: 1px solid #e5e7eb;`
- **Backdrop Blurs:** Frosted navigation bars and sticky headers utilize `backdrop-filter: blur(12px)` over an 85% transparent white background (`rgba(255, 255, 255, 0.85)`).

## Shapes
Geometry is calm, balanced, and uniform:
- **Base Rounding (`0.5rem` / `8px`):** Standard buttons, text input fields, dropdown menus, and list items.
- **Large Rounding (`1rem` / `16px`):** Menu item cards, cart containers, order summary panels, and modal windows.
- **Extra Large Rounding (`1.5rem` / `24px`):** Full-screen merchant drawers and bottom sheet cards on mobile screens.
- **Full Radius (Pill):** Strictly reserved for numerical notification counts, active dietary tags (e.g., `Vegan`, `Gluten-Free`), and operational status capsules (e.g., `Ready for pickup`).

## Components

### Buttons
- **Primary:** Solid `#059669` background with `#ffffff` text (`label-lg`). Height: 44px mobile / 40px desktop. Border: none. Subtle transition to `#047857` on hover.
- **Secondary:** `#ffffff` surface, 1px border in `#e5e7eb`, `#111827` text. Hover shifts to `#f9fafb`.
- **Tertiary / Ghost:** No border, transparent background, `#6b7280` text; transitions to `#111827` on hover with a `#f3f4f6` background.

### Input Fields & Controls
- **Text Inputs:** Height 44px, `#ffffff` surface, 1px `#e5e7eb` border, 8px radius. Text in `#111827`, placeholder in `#9ca3af`. Focus state switches border to `#059669` with a subtle 1px ring (`rgba(5, 150, 105, 0.15)`).
- **Checkboxes & Radios:** 18px box, 4px corner radius for checkboxes, full circle for radios. Default border: 1.5px `#d1d5db`. Checked state: `#059669` fill with crisp white internal icon.

### Cards & Menu Items
- **Card Pattern:** Plain white background (`#ffffff`), 1px solid `#e5e7eb`, 16px radius, internal padding of 16px. No drop shadow in resting state. On interactive merchant or dish cards, hover slightly darkens the hairline to `#d1d5db`.
- **Imagery:** Aspect ratio 1:1 or 4:3 with an inner 1px inset border (`rgba(0, 0, 0, 0.04)`) to separate light imagery from white card containers.

### Chips & Badges
- **Status Badges:** Muted tonal background paired with strong label text. For example, "Active Order" uses `#ecfdf5` background with `#047857` text and a 6px solid `#059669` status dot.
- **Filter Chips:** 32px height, 1px solid `#e5e7eb`, `#ffffff` background, 8px radius. When selected: `#111827` background with `#ffffff` text, or `#ecfdf5` with `#059669` border and text.

### Lists & Transaction Rows
- Compact tabular structure with horizontal 1px `#f3f4f6` hairline dividers. No vertical dividing lines. 
- Left-aligned title (`body-md` in `#111827`) paired with a muted subline (`body-sm` in `#6b7280`); right-aligned bold price or action toggle using tabular numerals.