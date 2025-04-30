#!/bin/bash
# build-chrome.sh
# A simple build script for the Neapolitan Domain Switcher Chrome extension
# Creates a clean build directory with only the necessary files

# Set variables
VERSION=$(grep -o '"version": "[^"]*"' manifest.json | cut -d'"' -f4)
BUILD_DIR="build/chrome"
ZIP_NAME="neapolitan-$VERSION.zip"

# Print header
echo "========================================"
echo "Building Neapolitan Domain Switcher v$VERSION"
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

# Remove any unwanted files (like .DS_Store)
find "$BUILD_DIR" -name ".DS_Store" -delete

# Create ZIP file for Chrome Web Store
echo "Creating ZIP file for distribution..."
(cd "build" && zip -r "$ZIP_NAME" "chrome" -x "*.git*" "*.DS_Store")

echo "========================================"
echo "Build complete!"
echo "Files located in: $BUILD_DIR"
echo "ZIP file: build/$ZIP_NAME"
echo "========================================"

# Make the file executable
chmod +x "build-chrome.sh"
