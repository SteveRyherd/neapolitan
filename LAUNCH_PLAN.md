# Launch Plan — Neapolitan

A pre-written playbook for the day you flip on `neapolitan.page` and announce it. Edit anything that sounds too pitchy in your own voice; the bones are here.

---

## Pre-flight checklist (do before posting anywhere)

- [ ] Domain `neapolitan.page` registered (Cloudflare)
- [ ] Cloudflare Pages deploy live, HTTPS green
- [ ] `https://neapolitan.page/` renders cleanly desktop + mobile (real device, not just devtools)
- [ ] Social card preview tested at [opengraph.xyz](https://www.opengraph.xyz/) for `neapolitan.page`
- [ ] `https://neapolitan.page/privacy.html` accessible
- [ ] `robots.txt` and `sitemap.xml` return 200
- [ ] Chrome Web Store listing has the new `neapolitan.page` URL under "Website"
- [ ] `manifest.json` version bumped if `homepage_url` change shipped to store (1.0.1 → 1.0.2)
- [ ] Screenshot the live site for the launch posts
- [ ] Submit sitemap to [Google Search Console](https://search.google.com/search-console)
- [ ] Test "Add to Chrome" button on a fresh browser profile end-to-end

## Channel 1 — Product Hunt

**When:** Tuesday, Wednesday, or Thursday. Schedule for 12:01am PT.

**Tagline (60 char max):** Switch dev, staging, and production in one keystroke

**Description (260 char max):**
> A Chrome extension that switches the page you're on between development, staging, and production — path, query, and hash come with you. Compare environments in a keystroke instead of retyping URLs. Open source, no tracking, free.

**Gallery assets to upload:**
- og-card.png as the cover image
- popup.png, options.png from `.github/screenshots/`
- demo.gif from `.github/screenshots/`

**Maker comment (first comment after launch):**
> Hi PH 👋 — Neapolitan started life inside my own browser around 2013 because I kept opening the wrong environment and shipping changes to the wrong DB. I rebuilt it on Manifest V3 last year, finally polished it enough to release, and here it is.
>
> Built for the moment you're staring at a bug in prod, hit Alt+X, and the same URL loads in dev so you can debug. The thing it actually optimizes for is **comparison** — three keystrokes to cycle the same page across three environments.
>
> MIT, no tracking, no servers. Happy to answer questions about the architecture, the four shortcut schemes, or why this took 12 years to ship 🙂

## Channel 2 — Hacker News (Show HN)

**When:** Tuesday-Thursday, 9-11am ET (catches the morning US wake-up and start-of-day in Europe).

**Title:**
> Show HN: Neapolitan – Switch a page across dev, staging, and prod in one keystroke

**First comment (post immediately after submitting):**
> Hi HN. This is a Chrome extension I built for myself ~12 years ago, kept private for a decade, then dragged into Manifest V3 last year and released.
>
> The use case: you're looking at a page in production, you want to see how the same page behaves in staging or how it renders against your dev server. With Neapolitan you press Alt+X / Alt+S / Alt+W and the same URL — path, query string, hash, everything — loads in the target environment.
>
> A few design choices that may interest people:
>
> - Four built-in shortcut schemes because Alt-letter keys collide with a lot of webapps. Users can pick or rebind via chrome://extensions/shortcuts.
> - No telemetry, no remote config, no servers. Configurations live in chrome.storage.local. Source on GitHub if you want to verify.
> - The color metaphor (chocolate = dev, strawberry = staging, vanilla = prod) does double duty — it shows you which environment is which in the popup, and the badge color tells you at a glance which environment your current tab is in.
>
> Happy to discuss the manifest v2 → v3 conversion, the keyboard shortcut UX research, the Safari port, or whatever else.
>
> Site: https://neapolitan.page
> Source: https://github.com/SteveRyherd/neapolitan
> Store: https://chromewebstore.google.com/detail/neapolitan-domain-switcher/pbmeeanefgoglnbaikepdhmdjhohodbc

## Channel 3 — Reddit

Submit at different times across subs to avoid simultaneity-spam pattern.

### r/webdev (1.4M)
**Title:** I built a Chrome extension to switch between dev/staging/prod with one keystroke — 12 years in the making

**Body:** Same as HN comment, adjusted for tone — drop the "design choices that may interest people" bullet structure, lean more story-forward.

### r/chrome_extensions (much smaller, but tightly relevant)
**Title:** [Tool] Neapolitan — switch any page across dev/staging/prod with a keystroke, MIT

### r/SideProject (560K)
**Title:** I shipped a Chrome extension I started 12 years ago — Neapolitan, environment switcher

### r/programmingtools (smaller, technical)
**Title:** Neapolitan: keystroke-driven environment switching for browsers (open source, MV3)

### Reddit rules of engagement
- Reddit hates "look at my project" titles. Lead with the *problem* or the *story*.
- Don't link the Chrome Store as the primary link — link the landing page. Conversion is better and looks less like marketing.
- Respond to every comment within the first 2 hours. The algorithm rewards engagement.
- Do NOT cross-post; submit a slightly different angle to each sub.

## Channel 4 — Dev.to article

**Title:** "I shipped a Chrome extension 12 years after I built it"

**Outline:**
1. The original 2013 problem (working at a place with 4 environments and a hosts file I kept editing wrong)
2. The hacky JS bookmark phase
3. Why I never released it (it was "good enough" for me)
4. What changed in 2025 (MV3 migration deadline + realizing other people kept describing the same pain on Twitter)
5. What I learned rebuilding a 12-year-old extension in MV3
6. The keyboard shortcut UX problem (why four schemes ship by default)
7. Try it: link to landing page and Chrome Store

Cross-post to:
- Hashnode
- Medium (canonical link back to dev.to or your personal site)
- LinkedIn article (shortened version)

## Channel 5 — steveryherd.com post

**Why this matters:** Per project goals, Neapolitan should give SEO/brand validation back to steveryherd.com. The reverse needs to be true too — a post on your site linking to neapolitan.page creates the backlink Google cares about most.

**Suggested post:** Brief origin story (300-500 words), big screenshot, link to landing page and GitHub. Title something like *"Releasing a 12-year-old Chrome extension."*

## Channel 6 — Personal social

- **Twitter/X:** One announcement tweet with the OG card, link to neapolitan.page. Optional thread with the origin story (Reddit body, broken into 6-8 tweets).
- **LinkedIn:** Single post, more professional framing. "Releasing an open-source dev tool I built 12 years ago" works as a hook.
- **Mastodon (if you're on it):** Same as Twitter but you can be more relaxed.

## Channel 7 — Directories / aggregators

Submit once, no urgency:

- [AlternativeTo](https://alternativeto.net/) — add as alternative to "BrowserStack switcher", "ModHeader", any environment-switching tool
- [Slant](https://www.slant.co/) — submit as a Chrome extension option in "Best Chrome extensions for web developers"
- [BetaList](https://betalist.com/) — submission form, free
- [Indie Hackers](https://www.indiehackers.com/products) — add product listing
- [Awesome Chrome Extensions](https://github.com/stefanbuck/awesome-browser-extensions-for-github) and similar awesome-lists — PR your extension
- [Chrome Web Store featured submission](https://chromewebstore.google.com/category/extensions/development) — if you hit ~1k installs

## Channel 8 — Slack / Discord communities you're in

Don't drop links cold; share when there's a natural conversation about environment management or dev tooling. Be the person who says "oh I made a thing for this — feedback welcome" not the person who posts a marketing message.

## What to monitor for 48 hours after launch

- Chrome Web Store install count (slow-moving)
- GitHub stars (fast-moving signal of HN/PH/Reddit traction)
- Issues / PRs (real users will surface bugs immediately)
- Search Console once it indexes (a few days)
- Cloudflare Pages analytics (referrer breakdown — tells you which channel worked)

## Response triage

You will get feedback in all of these forms — be ready for the patterns:

| Type | Response pattern |
|------|------------------|
| "Cool, installed it" | A simple thanks. |
| Feature request | Acknowledge, file as GitHub issue, link back to issue in reply. |
| Bug report | Reproduce, file issue, fix in next release. Always close the loop in the comment thread. |
| "How is this different from X?" | Direct, factual comparison. Don't be defensive. |
| Privacy/security skepticism | Point at PRIVACY.md and the open-source repo. Don't argue. |
| Negative comment | Respond once, factually, then disengage. |

## Post-launch

- Send any users-who-emailed a personal thank-you. Solo indie projects live or die on this.
- Pick the top 2-3 feature requests, add to a public roadmap or pinned issue.
- Write a "Week 1 retrospective" post with install numbers + lessons learned. This frequently outperforms the launch post itself on dev social.
