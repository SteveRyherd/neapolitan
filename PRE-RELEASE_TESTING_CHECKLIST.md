# Neapolitan Domain Switcher - Pre-Release Testing Checklist

This checklist should be completed before finalizing the v1.0.0 release.

## Installation Testing

### Chrome
- [ ] Extension installs correctly
- [ ] Icons display properly in the toolbar
- [ ] Options page opens correctly

### Safari
- [ ] Builds successfully using Xcode
- [ ] Extension installs correctly
- [ ] Icons display properly in the toolbar
- [ ] Options page opens correctly

## Core Functionality

### Environment Detection
- [ ] Correctly identifies development environments
- [ ] Correctly identifies staging environments
- [ ] Correctly identifies production environments
- [ ] Shows appropriate icon for each environment
- [ ] Shows appropriate tooltip for current environment

### Environment Switching
- [ ] Switching to development environment works
- [ ] Switching to staging environment works
- [ ] Switching to production environment works
- [ ] Path preservation works correctly when switching
- [ ] Query parameters preserved when switching
- [ ] Fragment identifiers preserved when switching

### Keyboard Shortcuts
- [ ] Alt+X works for development environment
- [ ] Alt+S works for staging environment
- [ ] Alt+W works for production environment
- [ ] Other configured keyboard shortcuts work
- [ ] Shortcuts work consistently across multiple sites

## Options Page

### Environment Configuration
- [ ] Adding a new environment works
- [ ] Editing an environment works
- [ ] Deleting an environment works
- [ ] Configuration saves correctly between sessions
- [ ] Environment detection updates when configuration changes

### Settings
- [ ] Theme selection works
- [ ] Theme changes apply immediately
- [ ] System theme detection/sync works
- [ ] Emoji toggle works and persists
- [ ] Settings save automatically
- [ ] Settings persist between browser sessions

### UI
- [ ] All tabs in options page work correctly
- [ ] Options UI is responsive at different sizes
- [ ] No visual glitches or overlapping elements
- [ ] Keyboard navigation works correctly

## Themes

### Themes Display Correctly
- [ ] Neapolitan (default) theme displays correctly
- [ ] Dark theme displays correctly
- [ ] Light theme displays correctly
- [ ] High contrast theme displays correctly

### Environment-Specific Styling
- [ ] Development environment styling works with all themes
- [ ] Staging environment styling works with all themes
- [ ] Production environment styling works with all themes

## Browser Compatibility

### Chrome
- [ ] Works correctly in Chrome stable
- [ ] Works correctly in Chrome beta (if available)
- [ ] Works on Windows
- [ ] Works on macOS
- [ ] Works on Linux

### Safari
- [ ] Works correctly in Safari stable
- [ ] Works correctly in Safari Technology Preview (if available)
- [ ] Works on macOS
- [ ] Works on iOS (if applicable)

## Edge Cases

### Error Handling
- [ ] Handles invalid configurations gracefully
- [ ] Shows appropriate error messages
- [ ] Recovers from storage errors
- [ ] Handles restricted permissions appropriately

### Performance
- [ ] Extension loads quickly
- [ ] No noticeable performance impact while browsing
- [ ] Options page renders efficiently
- [ ] Environment switching happens without delay

### Special Domains
- [ ] Works correctly with localhost
- [ ] Works correctly with IP addresses
- [ ] Works correctly with ports in URLs
- [ ] Works correctly with subdomains

## Documentation

- [ ] README.md is up to date
- [ ] CHANGELOG.md reflects current release
- [ ] Safari installation guide is accurate
- [ ] Keyboard shortcuts documentation is accurate

## Final Checks

- [ ] Version number is correctly set to 1.0.0 in manifest.json
- [ ] All debug/console logging removed or minimized
- [ ] No TODOs remaining in the code
- [ ] Extension icon is consistent across all contexts
- [ ] Extension name is consistent across all contexts

## Tester Information

Tested by: ________________________

Date: ________________________

Browser/Version: ________________________

OS/Version: ________________________

Notes:
_______________________________________________________
_______________________________________________________
_______________________________________________________
_______________________________________________________