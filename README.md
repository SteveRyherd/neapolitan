# Browser Environment Switcher

A browser extension that helps developers switch between different environments (development, certification, production) for web applications.

## Features

- Quickly switch between environments with a single click
- Visual indicator for current environment
- Configure custom environments through the options page
- Support for Chrome, Firefox, and Safari

## Installation

### Chrome / Edge

1. Download the latest release from the [Releases page](https://github.com/yourusername/browser-environment-switcher/releases)
2. Unzip the file
3. In Chrome, go to `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked" and select the unzipped folder

### Firefox

1. Download the latest release from the [Releases page](https://github.com/yourusername/browser-environment-switcher/releases)
2. In Firefox, go to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on..." and select the `manifest.json` file in the unzipped folder

### Safari

1. Download the latest release from the [Releases page](https://github.com/yourusername/browser-environment-switcher/releases)
2. Double-click the `.app` file to install the extension
3. Open Safari preferences and enable the extension

## Usage

1. Navigate to a website that's configured in the extension
2. Click the extension icon in the toolbar
3. Select the environment you want to switch to

## Configuration

You can add or edit environments through the options page:

1. Right-click the extension icon and select "Options"
2. Edit the JSON configuration
3. Click "Save"

## Building for Safari

To build for Safari:

1. First build the extension for Chrome/Firefox
2. Use the Safari Web Extension Converter (in Xcode):
   - Run: `xcrun safari-web-extension-converter /path/to/extension`
3. Open the generated Xcode project
4. Build and sign with your Apple Developer account

## License

[MIT License](LICENSE)
