# Brand Colors

The live theme tokens are defined in `src/styles.css`. The brand palette uses OKLCH values directly
because the app is built on Tailwind CSS tokens.

## Light Theme

| Role               | Token          | OKLCH                   | Usage                                |
| ------------------ | -------------- | ----------------------- | ------------------------------------ |
| Ivory background   | `--background` | `oklch(0.98 0.018 78)`  | Page background                      |
| Espresso text      | `--foreground` | `oklch(0.2 0.025 55)`   | Primary text                         |
| Warm card          | `--card`       | `oklch(0.995 0.01 82)`  | Card and popover surfaces            |
| Espresso action    | `--primary`    | `oklch(0.24 0.035 55)`  | Primary buttons, high-emphasis links |
| Warm neutral       | `--secondary`  | `oklch(0.94 0.025 76)`  | Secondary surfaces                   |
| Muted warm neutral | `--muted`      | `oklch(0.93 0.02 78)`   | Bands and quiet UI                   |
| Copper accent      | `--accent`     | `oklch(0.9 0.055 65)`   | Warm hover/fill surfaces             |
| Warm border        | `--border`     | `oklch(0.86 0.03 75)`   | Borders and dividers                 |
| Copper ring        | `--ring`       | `oklch(0.56 0.11 55)`   | Focus rings                          |
| Brand espresso     | `--brand`      | `oklch(0.24 0.035 55)`  | Brand-specific surfaces              |
| Restrained teal    | `--accent2`    | `oklch(0.47 0.105 205)` | Secondary accent, status, connection |

## Dark Theme

| Role               | Token          | OKLCH                     | Usage                                |
| ------------------ | -------------- | ------------------------- | ------------------------------------ |
| Deep charcoal      | `--background` | `oklch(0.16 0.022 55)`    | Page background                      |
| Warm ivory text    | `--foreground` | `oklch(0.96 0.012 78)`    | Primary text                         |
| Dark card          | `--card`       | `oklch(0.21 0.025 55)`    | Card and popover surfaces            |
| Copper action      | `--primary`    | `oklch(0.76 0.095 65)`    | Primary actions in dark mode         |
| Dark neutral       | `--secondary`  | `oklch(0.27 0.025 55)`    | Secondary surfaces                   |
| Muted dark neutral | `--muted`      | `oklch(0.27 0.025 55)`    | Bands and quiet UI                   |
| Dark copper accent | `--accent`     | `oklch(0.32 0.045 65)`    | Warm hover/fill surfaces             |
| Translucent border | `--border`     | `oklch(1 0.015 78 / 12%)` | Borders and dividers                 |
| Copper ring        | `--ring`       | `oklch(0.76 0.095 65)`    | Focus rings                          |
| Warm brand text    | `--brand`      | `oklch(0.96 0.012 78)`    | Brand-specific surfaces              |
| Soft teal          | `--accent2`    | `oklch(0.7 0.095 205)`    | Secondary accent, status, connection |

## Guardrails

- Do not introduce a new dominant blue palette.
- Do not make the site one-note brown; teal should stay present as a secondary signal.
- Use `--primary` for primary actions unless a component has a semantic color.
- Use `--accent2` sparingly for active dots, featured marks, or connection/status cues.
- Keep destructive/error colors semantic and separate from the brand palette.
