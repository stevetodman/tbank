#!/bin/bash
# Generate PWA and iOS icons from SVG source
# Requires: imagemagick, librsvg2-bin
#
# Usage: ./scripts/generate-icons.sh

set -e

# Check dependencies
if ! command -v rsvg-convert &> /dev/null; then
    echo "Error: rsvg-convert not found. Install with:"
    echo "  Ubuntu/Debian: sudo apt-get install librsvg2-bin"
    echo "  macOS: brew install librsvg"
    exit 1
fi

if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick convert not found. Install with:"
    echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  macOS: brew install imagemagick"
    exit 1
fi

# Directories
ICON_DIR="docs/assets/icons"
SOURCE_SVG="$ICON_DIR/icon.svg"

if [ ! -f "$SOURCE_SVG" ]; then
    echo "Error: Source SVG not found at $SOURCE_SVG"
    exit 1
fi

echo "Generating PWA and iOS icons from $SOURCE_SVG..."

# Generate PWA icons
PWA_SIZES=(72 96 128 144 152 192 384 512)
for size in "${PWA_SIZES[@]}"; do
    output="$ICON_DIR/icon-${size}x${size}.png"
    echo "  Generating $output..."
    rsvg-convert -w $size -h $size "$SOURCE_SVG" -o "$output"
done

# Generate iOS (Apple Touch) icons
IOS_SIZES=(120 152 167 180)
for size in "${IOS_SIZES[@]}"; do
    output="$ICON_DIR/apple-touch-icon-${size}x${size}.png"
    echo "  Generating $output..."
    rsvg-convert -w $size -h $size "$SOURCE_SVG" -o "$output"
done

echo ""
echo "✅ All icons generated successfully!"
echo ""
echo "Generated files:"
ls -lh "$ICON_DIR"/*.png | awk '{print "  " $9 " (" $5 ")"}'
echo ""
echo "Next steps:"
echo "  1. Review the generated icons"
echo "  2. Commit the icons: git add docs/assets/icons/*.png"
echo "  3. Test PWA installation on mobile devices"
