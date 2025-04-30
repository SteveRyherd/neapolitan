#!/bin/bash
# build-safari.sh
# Preparation script for the Neapolitan Domain Switcher Safari extension
# Creates a clean build directory with files ready for Safari Web Extension Converter

# Set variables
VERSION=$(grep -o '"version": "[^"]*"' manifest.json | cut -d'"' -f4)
BUILD_DIR="build/safari"
APP_NAME="NeapolitanDomainSwitcher"
BUNDLE_IDENTIFIER="com.steveryherd.neapolitan"

# Print header
echo "========================================"
echo "Preparing Neapolitan Domain Switcher v$VERSION for Safari"
echo "========================================"

# Create fresh build directory
echo "Creating build directory..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Copy required files
echo "Copying files to build directory..."

# Copy manifest.json
cp manifest.json "$BUILD_DIR/"

# Copy src directory
cp -r src "$BUILD_DIR/"

# Copy icons
cp -r icons "$BUILD_DIR/"

# Copy CHANGELOG.md and README files
cp CHANGELOG.md "$BUILD_DIR/"
cp .github/README.md "$BUILD_DIR/"

# Copy Safari-specific installation guide
cp .github/SAFARI_INSTALLATION.md "$BUILD_DIR/"

# Remove any unwanted files (like .DS_Store)
find "$BUILD_DIR" -name ".DS_Store" -delete

echo "========================================"
echo "Preparation complete!"
echo "Files located in: $BUILD_DIR"
echo ""
echo "Next steps for Safari extension:"
echo "1. Run Safari Web Extension Converter:"
echo "   xcrun safari-web-extension-converter $BUILD_DIR \\"
echo "   --app-name \"$APP_NAME\" \\"
echo "   --bundle-identifier \"$BUNDLE_IDENTIFIER\" \\"
echo "   --project-location \"build\""
echo ""
echo "2. Open the Xcode project created by the converter"
echo "3. Configure signing with your Apple Developer account"
echo "4. Build the extension in Xcode"
echo "========================================"

# Make the file executable
chmod +x "build-safari.sh"
