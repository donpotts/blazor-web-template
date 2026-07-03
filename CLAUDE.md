# Blazor WebAssembly Web Template

This is a **template project**, not a live site — it's cloned/copied each time a new static site is started. Companion to `expo-web-template` (Expo/RN Web) and `html-web-template` (plain HTML/TS); same site structure (Home/About/Services/Contact), Blazor WASM standalone here.

## What this is

Blazor WebAssembly (standalone, `dotnet new blazorwasm --empty`), Tailwind CSS via its CLI (not the default template CSS), deployed to GitHub Pages via `npm run deploy` (the `gh-pages` npm package, same tool used by the other two templates for consistency, even though this is a .NET project). No CI/CD; deploy is always a manual local command, by design.

## Page structure

- `Layout/MainLayout.razor` — shared header (site name + `NavLink` nav, auto-highlights active route) and footer, wraps every page via `@Body`.
- `Pages/Home.razor` (`@page "/"`) — hero carousel (own `Timer` in `@code`, not JS) + title/subtitle.
- `Pages/About.razor`, `Pages/Services.razor`, `Pages/Contact.razor` — one route per nav link.
- `Pages/NotFound.razor` — Blazor Router's client-side "no matching route" page (separate from GitHub Pages' own 404 handling — see deploy section).

Add a new page: create `Pages/<Name>.razor` with `@page "/<name>"`, and add a matching `NavLink` in `MainLayout.razor`.

## Where content lives

`SiteConfig.cs` at the project root — a plain static class with nested static classes (`Hero`, `About`, `ServicesSection`, `Contact`, `Footer`), not a JSON file, since C# constants are the idiomatic choice here. Pages reference `SiteConfig.*` directly in their markup. When asked to change site copy or contact info, edit `SiteConfig.cs`, not the `.razor` files. Colors are centralized in `tailwind.config.js`'s `accent` value, not in `SiteConfig.cs`.

**Exception**: hero images (`wwwroot/images/hero-1.jpg` … `hero-5.jpg`) are referenced via a fixed array in `Pages/Home.razor`'s `@code` block, not `SiteConfig.cs` — there's no hard technical constraint forcing this (unlike the Expo version's Metro `require()` limitation), it's just kept alongside the carousel logic that uses it. Swapping images means replacing files in `wwwroot/images/` (same filenames) or editing that array.

## Scaffold script

`scripts/new-site.js` (plain Node, no npm deps) does targeted regex replacement on `SiteConfig.cs`'s `const` declarations, `wwwroot/index.html`'s `<title>`/`<base href>`, and `package.json`'s `name` — not a Roslyn-based codemod, so if `SiteConfig.cs`'s member names or structure change, keep the script's regexes in sync (it matches on the literal `public const string X = "...";` pattern per field name).

## Deploy mechanism and base path

`npm run deploy` → `predeploy` (`npm run build:css` then `dotnet publish -c Release -o publish`, then copy `index.html` to `404.html` — GitHub Pages has no server-side rewrites, so a direct link to `/about` needs the same app shell to load and let Blazor's router take over client-side) → `gh-pages --nojekyll -d publish/wwwroot -t`.

`wwwroot/index.html`'s `<base href>` must match the actual deploy target or asset/route URLs will 404 — this is functionally the same problem and fix as Expo's `experiments.baseUrl`:
- Custom domain (root-served): `<base href="/" />`.
- No custom domain, GitHub Pages project page: `<base href="/<repo-name>/" />` — must exactly match the repo name.

`new-site.js` sets this automatically based on whether a domain was given. The custom domain itself is handled via `wwwroot/CNAME` (published as part of `publish/wwwroot/` automatically, since `wwwroot` already is the static-asset root for a Blazor WASM app — no separate `public/` folder trick needed here, unlike the Expo version).

## localStorage interop

`wwwroot/js/interop.js` is a tiny global-scope JS bridge (`window.localStorageInterop.getItem/setItem`) called from `Pages/Contact.razor` via `IJSRuntime.InvokeAsync`. Deliberately not using a JS-isolation module pattern or a NuGet package like Blazored.LocalStorage — this is small enough that the minimal global-script approach is simpler and has one fewer dependency.

## Scope: static frontend only, backend/other apps are separate concerns

This repo deploys a static WASM app (no ASP.NET Core server running anywhere). If a future task here involves real server-side contact form storage, auth, or a database, that needs a separately hosted API — don't try to run server code via GitHub Pages. Point the app at an API via `HttpClient` in a Razor component. Suggested hosts (not opinionated): Azure App Service or Container Apps for a conventional ASP.NET Core Web API, Azure Functions for a few small endpoints, or any other host. CORS needs to allow the site's origin.

## Placeholder assets

`wwwroot/assets/favicon.png` and `wwwroot/images/hero-*.jpg` are the same generated placeholders used by `expo-web-template` and `html-web-template` — not real branding, expected to be replaced per-site.
