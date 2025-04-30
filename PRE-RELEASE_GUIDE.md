# Pre-Release Guide for Neapolitan Domain Switcher v1.0.0-rc.1

This document outlines the steps to prepare, tag, and publish the first official pre-release of the Neapolitan Domain Switcher.

## 1. Update Version Information

### Update manifest.json
```json
{
  "name": "Neapolitan Domain Switcher",
  "manifest_version": 3,
  "version": "1.0.0",
  "description": "Switch between development, staging, and production environments easily",
  // rest of manifest remains the same
}
```

## 2. Add CHANGELOG.md
- Copy the provided CHANGELOG.md file to the root of your project
- Review and adjust the content as needed
- Make sure the date is correct for the pre-release

## 3. Final Code Review
- Check for any TODOs or unfinished code
- Review browser compatibility
- Test keyboard shortcuts in target browsers
- Verify that settings save correctly
- Test environment switching across different domains
- Ensure all themes display correctly

## 4. Build Process

### For Chrome:
1. Use the build script to create a clean build:
   ```
   chmod +x build-chrome.sh
   ./build-chrome.sh
   ```
2. The script will:
   - Create a clean build directory: `build/chrome`
   - Copy only the necessary files (manifest.json, src/, icons/, etc.)
   - Remove unnecessary files (.DS_Store, etc.)
   - Create a ZIP file ready for distribution in `build/neapolitan-1.0.0.zip`

### For Safari:
1. Use the Safari build preparation script:
   ```
   chmod +x build-safari.sh
   ./build-safari.sh
   ```
2. Follow the instructions output by the script to run Safari Web Extension Converter
3. Open the generated Xcode project
4. Configure signing with your Apple Developer account
5. Build and test the extension in Xcode
6. Archive the project for distribution

## 5. Testing Pre-Release
1. Install the pre-release in Chrome and Safari
2. Test all core functionality:
   - Environment detection
   - Environment switching
   - Keyboard shortcuts
   - Settings persistence
   - Different themes
   - Options page functionality
3. Document any issues found

## 6. Git Tagging and Release
1. Commit all changes:
   ```
   git add .
   git commit -m "Prepare 1.0.0-rc.1 release"
   ```

2. Create a tag for the pre-release:
   ```
   git tag -a v1.0.0-rc.1 -m "Version 1.0.0 Release Candidate 1"
   ```

3. Push the tag to remote repository:
   ```
   git push origin v1.0.0-rc.1
   ```

4. Create a GitHub release (if using GitHub):
   - Go to Releases page
   - Create a new release using the tag
   - Mark it as a pre-release
   - Upload the built ZIP file(s)
   - Copy release notes from CHANGELOG.md
   - Publish the release

## 7. Distribute for Testing
1. Share the pre-release with internal testers or trusted users
2. Provide clear guidance on what to test
3. Establish a method for collecting feedback (GitHub issues, form, email)
4. Set a feedback deadline (recommend 1-2 weeks)

## 8. Post-Release Candidate Tasks
1. Collect and organize feedback
2. Prioritize issues to fix before final release
3. Create a milestone for 1.0.0 final release
4. Address critical issues
5. Plan the timeline for final 1.0.0 release

## 9. Final Release Planning
Once testing is complete and critical issues addressed:
1. Update version to 1.0.0 (remove RC designation)
2. Update CHANGELOG.md with the final release date
3. Tag the final release
4. Create production builds
5. Publish to browser extension stores (if applicable)

## Contact Information
For questions about the release process, contact:
- [Your Contact Information]