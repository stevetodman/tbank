# TBank App Icons

This directory contains app icons for PWA (Progressive Web App) and iOS support.

## Required Icon Sizes

### PWA Icons (manifest.webmanifest)
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

### iOS App Icons (Apple Touch Icons)
- apple-touch-icon-120x120.png (iPhone)
- apple-touch-icon-152x152.png (iPad)
- apple-touch-icon-167x167.png (iPad Pro)
- apple-touch-icon-180x180.png (iPhone Plus/Pro)

## Design Guidelines

**Icon Design:**
- Square format with rounded corners (iOS handles corner rounding automatically)
- Minimum safe area: Keep important content within 80% of the icon area
- Background: #2b6cb0 (TBank primary blue)
- Foreground: White text "TB" or medical symbol
- Simple, recognizable design that works at small sizes

**Maskable Icons:**
All PWA icons should support the "maskable" purpose, meaning they have adequate padding (20%) around the main icon content for different OS mask shapes.

## Quick Generation

To generate placeholder icons, you can:

1. Use an online tool like [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
2. Use ImageMagick to resize a source SVG/PNG:
   ```bash
   # Example: Generate all sizes from source-icon.png
   for size in 72 96 128 144 152 192 384 512; do
     convert source-icon.png -resize ${size}x${size} icon-${size}x${size}.png
   done
   ```

3. For iOS icons:
   ```bash
   for size in 120 152 167 180; do
     convert source-icon.png -resize ${size}x${size} apple-touch-icon-${size}x${size}.png
   done
   ```

## Temporary Fallback

Until proper icons are generated, the app will function but may show browser default icons on home screen installation.
