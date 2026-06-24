# Melanated In Tech Brand Guide

This folder is the source of truth for brand usage. Production web assets live in
`public/brand/` and root `public/` metadata files; this folder explains when and how to use them.

## Brand Position

Melanated In Tech should feel premium, warm, practical, and technically credible. The visual system
supports the current positioning: the home for AI agents, with marketplace, knowledge, products,
services, and community under one brand.

Use language that is clear and operator-minded. Prefer direct claims about building, deploying,
testing, and benefiting from agents over generic startup hype.

## Logo System

The selected identity is the minimal MIT monogram with a horizontal wordmark.

Primary production files:

- `public/brand/melanated-in-tech-logo.svg` - primary horizontal logo for header and footer.
- `public/brand/mit-monogram.svg` - square monogram for icons and compact brand moments.
- `public/favicon.svg` - browser SVG favicon.
- `public/favicon-32.png` - 32px PNG favicon.
- `public/apple-touch-icon.png` - 180px Apple touch icon.
- `public/og-default.png` - default social preview image.

Use the horizontal logo where the brand name needs to be clear. Use the monogram only where space is
tight, such as favicons, app icons, avatars, or social preview art.

Do not stretch, recolor, outline, distort, add shadows to, or place the logo over busy imagery. If a
new background requires different contrast, create a deliberate logo variant rather than styling the
asset ad hoc.

## Color Direction

The brand palette is warm tech: ivory backgrounds, espresso text, copper emphasis, and restrained
teal accents. The site should not drift back toward a blue-first SaaS palette.

Use:

- Espresso/charcoal for primary text and high-emphasis actions.
- Copper/bronze for brand warmth, highlights, and editorial emphasis.
- Ivory and warm neutrals for page backgrounds and surfaces.
- Teal sparingly for status, connection, and secondary accents.

See `colors.md` for the live CSS token map.

## Typography

The site uses:

- Display: Space Grotesk
- Body/UI: Inter

Use Space Grotesk for headings and brand-forward moments. Use Inter for body copy, forms, metadata,
navigation, and dense UI. Keep letter spacing at `0` by default in UI; use uppercase tracking only
for small section labels that already follow the existing site pattern.

## UI Principles

- Keep the interface polished and direct, not decorative.
- Favor restrained borders, subtle warm shadows, and clear spacing.
- Keep card radius modest; current card surfaces use `rounded-lg`.
- Avoid nested cards and heavy boxed sections.
- Use copper and teal as accents, not as large decorative washes everywhere.
- Preserve accessibility: strong contrast, visible focus rings, semantic images, and readable line
  lengths.

## File Ownership

- `docs/brand/` documents the brand system for humans and future agents.
- `public/brand/` stores production brand assets served by the app.
- `src/styles.css` contains live design tokens.
- Shared component styling lives in `src/components/` and `src/components/ui/`.

When brand assets or theme tokens change, update this folder in the same change.
