# Changelog
All notable changes to the Neapolitan Domain Switcher will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-rc.1] - 2025-04-30
First official release candidate after 12 years of internal development.

### Added
- Modern browser extension architecture using Manifest V3
- Multi-browser support (Chrome, Safari)
- Environment detection and switching between development, staging, and production
- Visual indicators for current environment status
- Four recommended keyboard shortcut schemes for efficient workflow
- Customizable environment configurations through options page
- Theming system with support for:
  - Default "Neapolitan" theme (vanilla, strawberry, chocolate)
  - Dark mode
  - Light mode
  - High contrast mode for accessibility
- System theme detection and syncing
- Settings management with auto-save
- Emoji or text indicators based on user preference
- Comprehensive options page with multiple tabs:
  - Environment configuration
  - Settings customization
  - Keyboard shortcuts guidance
  - Credits information
- Path and query preservation when switching environments

### Technical Features
- CSS variable-based design system for consistent styling
- Centralized theme manager for cross-component styling
- Service worker background script for performance
- Component-based UI architecture
- Environment-specific visual styling (colors, icons)
- Keyboard shortcut system with multiple scheme options
- Flexible environment configuration storage

### Documentation
- Keyboard shortcuts guide
- Safari installation instructions
- Demo creation guidance
- Clear visual indicators for active environment

## Earlier History
This project was developed 12 years ago then shelved for a siginicant time, with significant modernization efforts to align with current browser extension standards and web development practices. The 1.0.0 release represents the first official public version.