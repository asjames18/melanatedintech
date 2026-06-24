# Brand Assets

Production assets are served from `public/`. Keep these filenames stable because metadata and
components reference them directly.

## App-Served Assets

| Asset                 | Path                                      | Primary Use                        |
| --------------------- | ----------------------------------------- | ---------------------------------- |
| Horizontal logo       | `public/brand/melanated-in-tech-logo.svg` | Header, footer, full brand lockup  |
| MIT monogram          | `public/brand/mit-monogram.svg`           | Compact mark, icon source          |
| Social preview source | `public/brand/og-default.svg`             | Editable source for social preview |
| SVG favicon           | `public/favicon.svg`                      | Browser favicon                    |
| PNG favicon           | `public/favicon-32.png`                   | 32px fallback favicon              |
| Apple touch icon      | `public/apple-touch-icon.png`             | iOS/home-screen icon               |
| Default OG image      | `public/og-default.png`                   | Open Graph and Twitter card image  |

## Current References

- Header logo: `src/components/site-header.tsx`
- Footer logo: `src/components/site-footer.tsx`
- Metadata icons and OG image: `src/routes/__root.tsx`

## Generation Notes

The PNG favicon, Apple touch icon, and OG image were generated from SVG sources with `sharp`.

When updating source SVGs, regenerate:

```powershell
node -e "const sharp=require('sharp'); const p='public'; Promise.all([sharp(p+'/brand/mit-monogram.svg').resize(32,32).png().toFile(p+'/favicon-32.png'), sharp(p+'/brand/mit-monogram.svg').resize(180,180).png().toFile(p+'/apple-touch-icon.png'), sharp(p+'/brand/og-default.svg').png().toFile(p+'/og-default.png')]).then(()=>console.log('brand png assets generated'))"
```

Expected dimensions:

- `public/favicon-32.png`: `32x32`
- `public/apple-touch-icon.png`: `180x180`
- `public/og-default.png`: `1200x630`

## Do Not

- Replace app UI with a raster screenshot of the logo.
- Use the old concept PNG as the production header/footer asset.
- Rename stable public assets without updating route metadata and component references.
- Add temporary QA screenshots to the repo.
