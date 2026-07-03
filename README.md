# Blazor WebAssembly Web Template

A reusable Blazor WebAssembly (standalone) multi-page site template, deployed to GitHub Pages. Companion to `expo-web-template` (Expo/React Native Web) and `html-web-template` (plain HTML/TypeScript) — same site structure, Blazor's router for navigation, Tailwind CSS for styling.

## Quick start

```bash
git clone <this-repo-url> my-new-site
cd my-new-site

node scripts/new-site.js    # fill in your site's basics interactively
npm install                  # if you didn't let the script do it
dotnet restore

npm run build:css            # build Tailwind CSS
dotnet run                    # preview locally
```

## Pages

| Route | File | Content |
|---|---|---|
| `/` | `Pages/Home.razor` | Landing page: hero image carousel, title/subtitle |
| `/about` | `Pages/About.razor` | About section |
| `/services` | `Pages/Services.razor` | Services grid |
| `/contact` | `Pages/Contact.razor` | Contact info + a working contact form |

`Layout/MainLayout.razor` renders the shared header (site name + `NavLink` nav, which highlights the active page automatically) and footer around every page. Add a new page by creating another `.razor` file under `Pages/` with an `@page` directive, and add a matching `NavLink` in `MainLayout.razor`.

## Customizing content — `SiteConfig.cs`

Everything site-specific lives in one file, `SiteConfig.cs`, at the project root — a plain static class (there's no JSON/YAML config here, just C# constants, which is idiomatic for a .NET project):

| Member | Controls |
|---|---|
| `SiteConfig.SiteName` | Header brand text, `<title>`, footer |
| `SiteConfig.Hero.Title` / `.Subtitle` | Landing page hero heading |
| `SiteConfig.About.Heading` / `.Body` | About page |
| `SiteConfig.ServicesSection.Heading` / `.Items` | Services grid — an array of `(Title, Description)` tuples, any length |
| `SiteConfig.Contact.Heading` / `.Phone` / `.Email` | Contact page |
| `SiteConfig.Footer.Text` | Footer copyright line (year computed at render time) |

Colors are centralized in `tailwind.config.js`'s `accent` color, not in `SiteConfig.cs` — Tailwind utility classes in the `.razor` files reference it directly (e.g. `text-accent`, `bg-accent`).

### Hero images

`wwwroot/images/hero-1.jpg` … `hero-5.jpg`, referenced by a fixed array in `Pages/Home.razor`'s `@code` block. Replace the files (same names) or edit the array and rebuild.

## Running the scaffold script

`node scripts/new-site.js` prompts for the site name, custom domain (or, if skipped, the GitHub repo name), hero subtitle, about paragraph, and contact phone/email. It edits `SiteConfig.cs`, `wwwroot/index.html` (`<title>` and `<base href>`), `package.json` (`name`), and writes or removes `wwwroot/CNAME` based on whether you gave a domain.

Safe to re-run before you start hand-editing `SiteConfig.cs` further — once customized beyond what the script knows about, just edit the file directly.

## Development

```bash
npm run watch:css   # rebuild Tailwind CSS on change
dotnet watch          # hot-reload Blazor dev server
```

## Deploying

```bash
npm run deploy
```

`predeploy` runs `npm run build:css`, then `dotnet publish -c Release -o publish`, then copies the published `index.html` to `404.html` (the standard SPA-on-GitHub-Pages trick — GitHub Pages has no server-side rewrites, so a direct link to `/about` needs to fall back to the same app shell, which then reads the URL and lets Blazor's router take over). `deploy` publishes `publish/wwwroot/` to the `gh-pages` branch via the `gh-pages` npm package.

### Base path — root domain vs. GitHub Pages subpath

`wwwroot/index.html`'s `<base href>` tag tells the WASM app what path prefix all its asset/route URLs need — Blazor reads this at startup to resolve every relative link. `new-site.js` sets this for you:

- **Custom domain** (you gave one): `<base href="/" />` — served from the domain root.
- **No custom domain**: GitHub Pages serves project sites from `https://<user>.github.io/<repo-name>/`, so `<base href="/<repo-name>/" />`. **The repo name must match exactly**, or asset/JS URLs will 404.

If `wwwroot/CNAME` exists (written by `new-site.js` when you give it a domain), it publishes as part of `publish/wwwroot/` and GitHub Pages picks up the custom domain automatically. You're still responsible for pointing your domain's DNS at GitHub Pages — outside this repo's scope.

There is no CI/CD here by design — deploying is always a manual, local `npm run deploy`.

## The contact form — localStorage, no backend

`Pages/Contact.razor` is a real `EditForm` (Name/Email/Message) that, on submit, calls into `wwwroot/js/interop.js` (a tiny JS interop bridge, invoked via `IJSRuntime`) to read/write the browser's `localStorage` under the key `contact_submissions`, then re-renders the list of past submissions below the form. Since this is a static WASM app with nowhere to send the data otherwise, this is a way to demo persisted form data with zero backend:

- Submissions are **per-browser, per-device** — nothing syncs, and clearing browser storage clears them.
- For real, shared, server-side contact form data, you need an actual backend — see below.

## Beyond a static site — pairing with a backend

Like the other two template versions, this repo is static only (Blazor WASM ships as plain files GitHub Pages serves directly — there's no ASP.NET Core server running). For a real contact form or any dynamic feature, host an API separately and call it from a Razor component with `HttpClient` instead of the `localStorage` interop. Common places to host that API: **Azure App Service** (a natural fit for an ASP.NET Core Web API), **Azure Container Apps**, **Azure Functions** (a few small endpoints), or any other host. The API needs CORS headers allowing this site's origin.

## Icons and favicon

`wwwroot/assets/favicon.png` is a placeholder — replace it with your own branding.

## Why Tailwind CLI, not the default Blazor template CSS

This template replaces the default Blazor template's hand-written `app.css` with Tailwind, built via its CLI (`npm run build:css`) into `wwwroot/css/app.css` — same static-asset story as any other file Blazor's publish step copies. `tailwind.config.js` scans `**/*.razor` and `wwwroot/**/*.html` for class names, so purging works correctly across Razor markup.
