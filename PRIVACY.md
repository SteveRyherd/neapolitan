# Privacy Policy — Neapolitan Domain Switcher

**Effective date:** May 20, 2026
**Maintained by:** Steve Ryherd

## The short version

Neapolitan does not collect, store, transmit, or sell any personal data. There are no analytics, no telemetry, no remote servers, no advertising trackers, and no third-party data sharing of any kind. The extension runs entirely in your browser.

If that's all you wanted to know, you're done.

## What data the extension handles

To do its job — switching the current page between environments — Neapolitan needs to handle the following data, all locally:

- **The URL of the active tab.** Read when you click the extension icon or trigger a keyboard shortcut, so it can recognize which environment you're on and which others are available for the same site. The URL is never recorded, logged, or transmitted.
- **Your environment configurations.** The list of project domains and environments you set up via the options page. Stored locally using Chrome's [`chrome.storage.local`](https://developer.chrome.com/docs/extensions/reference/api/storage) API. This data lives on your device and is not synchronized to any remote service.
- **Your settings.** Theme choice, shortcut scheme, indicator preferences. Also stored locally via `chrome.storage.local`.

## What permissions the extension requests, and why

The extension requests the following [Chrome permissions](https://developer.chrome.com/docs/extensions/reference/permissions):

| Permission | Why it's needed |
|---|---|
| `tabs` | Read the URL of the active tab and navigate it when you trigger a switch. |
| `storage` | Persist your environment configurations and settings locally on your device. |
| `<all_urls>` (host permission) | Recognize and switch between *any* sites you configure. The extension never reads page contents — only the URL bar. |

## What the extension does NOT do

- Does not read or modify the contents of any web page.
- Does not record browsing history.
- Does not communicate with any remote server operated by the developer or any third party.
- Does not include any analytics, telemetry, or crash reporting SDKs.
- Does not display ads or contain affiliate links.

## Open source verification

This policy describes what the code actually does — but you don't have to take my word for it. The full source is available at [github.com/SteveRyherd/neapolitan](https://github.com/SteveRyherd/neapolitan) under the MIT license. You can audit the codebase, build it yourself, or fork it.

## Children's privacy

Neapolitan is a developer tool and is not directed at children under 13. It does not knowingly collect data from anyone — children included — because it does not collect data at all.

## Changes to this policy

If the way the extension handles data ever changes (for example, if optional cloud sync is added in a future version), this policy will be updated and the change will be noted in the [CHANGELOG](CHANGELOG.md). The current version of this policy is always available at [neapolitan.page/privacy](https://neapolitan.page/privacy).

## Contact

Questions, concerns, or corrections: open an issue at [github.com/SteveRyherd/neapolitan/issues](https://github.com/SteveRyherd/neapolitan/issues).
