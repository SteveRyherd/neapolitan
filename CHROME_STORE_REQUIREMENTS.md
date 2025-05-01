# Chrome Web Store Publishing Requirements

This guide addresses all the requirements needed to successfully publish the Neapolitan Domain Switcher extension.

## Privacy Practices Tab

### Permissions Justifications

#### 1. Host Permission Justification
```
This extension requires host permissions to detect the current environment (development, staging, or production) and to modify the URL when switching between environments. The extension needs to access the current tab's URL to determine which environment the user is in and to preserve the path and query parameters when switching to a different environment. Host permissions are necessary for the core functionality of environment switching.
```

#### 2. Remote Code Justification
```
The extension does not execute remote code. All JavaScript is contained within the extension package and runs locally in the browser. No external scripts are downloaded or executed.
```

#### 3. Storage Permission Justification
```
Storage permissions are required to save user preferences including configured environments, theme settings, and user interface preferences. This allows the extension to remember the user's custom environment configurations between browser sessions and across multiple devices when the user is signed in to Chrome.
```

#### 4. Tabs Permission Justification
```
The tabs permission is required to access the current tab's URL and to update it when switching environments. The extension needs to read the current URL to determine the environment and to modify it when the user selects a different environment. This is essential for the core functionality of environment switching.
```

### Single Purpose Description
```
The single purpose of this extension is to help developers and testers switch between different environments (development, staging, production) of the same web application while preserving the current path and parameters. It provides visual indicators to show which environment is currently active and offers both popup menu and keyboard shortcut methods for switching.
```

### Data Usage Compliance
Make sure to check the box certifying that your data usage complies with the Developer Program Policies.

## Basic Information Tab

### Language
Select "English" as the primary language.

### Category
Select "Developer Tools" as the primary category.

### Detailed Description
Use the detailed description provided earlier. Ensure it's at least 25 characters. Here's a shortened version if needed:

```
Neapolitan Domain Switcher helps developers and testers easily switch between development, staging, and production environments while preserving URL paths and parameters. 

Features include:
• One-click environment switching
• Visual indicators for each environment
• Keyboard shortcuts
• Customizable configurations
• Multiple theme options

Perfect for development teams who regularly work across multiple environments of the same application.
```

## Graphic Assets

### Icon
Ensure you upload the following icons:
- 16x16px icon
- 32x32px icon
- 48x48px icon
- 128x128px icon

Your `icons` directory already contains these files:
- icons/badge@0.25x.png (for 16x16 and 32x32)
- icons/badge@0.5x.png (for 48x48)
- icons/badge.png (for 128x128)

### Screenshots
Upload at least one screenshot showing the extension in action. Recommended screenshots:

1. Popup menu showing the three environments
2. Options page showing environment configuration
3. Different theme options (if available)

Screenshots should be at least 1280x800px or 640x400px.

## Account Settings Tab

### Contact Email
1. Add your contact email address
2. Verify the email by clicking the verification link sent to your inbox

## Final Checklist

- [ ] Privacy practices all completed (permissions justifications, single purpose)
- [ ] Data usage compliance certified
- [ ] Language selected
- [ ] Category selected
- [ ] Detailed description added (25+ characters)
- [ ] Icon uploaded in all required sizes
- [ ] At least one screenshot uploaded
- [ ] Contact email added and verified
- [ ] Saved draft of all changes
- [ ] Reviewed final submission before publishing