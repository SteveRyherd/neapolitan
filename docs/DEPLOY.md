# Deployment notes — neapolitan.page

This site is a static landing page served from `/docs/` in the repo. Two viable hosts; pick one.

## Option A — Cloudflare Pages (recommended)

Best fit if `neapolitan.page` is registered through Cloudflare Registrar.

1. Log into the Cloudflare dashboard → Workers & Pages → Create application → Pages → Connect to Git
2. Select the `SteveRyherd/neapolitan` repo
3. Build settings:
   - **Production branch:** `main`
   - **Build command:** *leave blank* (no build needed — pure static site)
   - **Build output directory:** `docs`
   - **Root directory:** *(leave at repo root)*
4. Deploy. First build produces a `<project>.pages.dev` URL.
5. Custom domain: Pages → your project → Custom domains → Add → `neapolitan.page`
   - If the domain is registered at Cloudflare, DNS is configured automatically.
   - If elsewhere, follow the CNAME / A record instructions Pages shows you.
6. SSL is automatic (Cloudflare Universal SSL). Allow ~30 seconds for cert issuance.

Future deploys: any push to `main` that touches `/docs/` triggers a redeploy. PRs get preview URLs automatically.

## Option B — GitHub Pages

Fine fallback. Free, no extra account.

1. Repo → Settings → Pages
2. Source: **Deploy from a branch**
3. Branch: `main` / Folder: `/docs`
4. Save. First deploy takes a minute or two.
5. Custom domain: enter `neapolitan.page` in the Pages settings.
   - The `CNAME` file in `/docs/` is already present, so GitHub will detect it.
   - At your registrar (Cloudflare), add a CNAME record: `neapolitan.page` → `steveryherd.github.io`.
   - Or, for an apex domain, use the four GitHub Pages A records.
6. Tick **Enforce HTTPS** once Let's Encrypt finishes issuing the cert.

## DNS shortcut (Cloudflare registrar + Cloudflare Pages)

If everything is in Cloudflare, the entire DNS step is "add custom domain in Pages, click confirm." No manual records.

## Smoke test after deploy

- `https://neapolitan.page/` loads, fonts render, no console errors
- `https://neapolitan.page/privacy.html` loads
- `https://neapolitan.page/404` → renders the styled 404
- `https://neapolitan.page/robots.txt` and `/sitemap.xml` return 200
- Social card preview: paste the URL into Slack or [opengraph.xyz](https://www.opengraph.xyz/) to validate `og:image` resolves

## Updating the site

All site source is in `/docs/`. Edit, commit, push. That's the entire workflow.
