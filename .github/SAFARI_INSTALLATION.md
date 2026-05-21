# Safari Installation Guide

This document provides detailed instructions for installing the Browser Environment Switcher in Safari.

## Safari Web Extension Compatibility

Safari supports web extensions through its Safari Web Extension framework. Here are important compatibility considerations when targeting Safari:

## API Compatibility

Safari supports most Chrome extension APIs through compatibility layers, with a few key differences:

1. **Service Workers**: Safari supports service workers, but there may be subtle differences in behavior. We should test the background.js service worker carefully in Safari.

2. **Storage API**: Safari fully supports `chrome.storage.local`, which is what we're using.

3. **Tabs API**: Safari supports the `chrome.tabs` API, but there may be permission differences.

4. **Action API**: Safari supports `chrome.action` for the extension toolbar button.

## Building Process

To build for Safari:

1. First, ensure the extension works in Chrome.
2. From the project root, run the Safari build script. It prepares a clean copy of the extension under `build/safari` and prints the exact `xcrun` invocation to use next:
   ```
   ./build-safari.sh
   ```
3. Run the Safari Web Extension Converter on the prepared directory (the script will print this command for you):
   ```
   xcrun safari-web-extension-converter ./build/safari \
     --app-name "NeapolitanDomainSwitcher" \
     --bundle-identifier "com.steveryherd.neapolitan" \
     --project-location "build"
   ```
4. The tool will create a new Xcode project.
5. Sign the extension with your Apple Developer account.
6. Ensure the Team is set, and that the app and extension bundle identifiers match (don't let Xcode append `.extension` — that's been observed to fail).
7. Build and install the extension from Xcode.

## Safari-Specific Issues to Watch For

1. **Extension Signing**: Safari requires all extensions to be signed with an Apple Developer account.

2. **Performance**: Test the extension performance in Safari, especially the background script.

3. **Content Security Policy**: Safari may enforce stricter Content Security Policy rules.

4. **Permissions**: Safari's permission model may require adjustments to our host permissions.

5. **UI Appearance**: Safari has different styling guidelines for extension UIs.

## Testing in Safari

Before deploying:

1. Test the environment detection logic
2. Verify the icon changes correctly
3. Ensure the popup UI displays and functions properly
4. Confirm that environment switching works as expected

## Debugging in Safari

To debug Safari extensions:

1. Enable the "Develop" menu in Safari preferences
2. Use the Web Inspector to debug the extension's background and content scripts
3. Look for any console errors specific to Safari

## Safari Extension Distribution

To distribute for Safari:

1. Submit the extension to the Apple App Store as a Safari extension
2. Follow Apple's review guidelines
3. Users will install via the App Store rather than direct download

Note: For internal use, you can distribute the .app file directly to users.