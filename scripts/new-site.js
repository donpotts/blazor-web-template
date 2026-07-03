#!/usr/bin/env node
// Scaffold a new site from this template: fills in SiteConfig.cs,
// wwwroot/index.html (title + base href), package.json (name), and
// wwwroot/CNAME. Node-only (no npm deps) so it runs before `npm install`.
'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline/promises');
const { stdin, stdout } = require('process');

const ROOT = path.resolve(__dirname, '..');
const SITE_CONFIG_PATH = path.join(ROOT, 'SiteConfig.cs');
const INDEX_HTML_PATH = path.join(ROOT, 'wwwroot', 'index.html');
const PACKAGE_JSON_PATH = path.join(ROOT, 'package.json');
const CNAME_PATH = path.join(ROOT, 'wwwroot', 'CNAME');

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'my-website';
}

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeFile(filePath, contents) {
  fs.writeFileSync(filePath, contents, 'utf8');
}

async function main() {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const ask = async (question, defaultValue) => {
    const answer = (await rl.question(`${question} (${defaultValue}): `)).trim();
    return answer || defaultValue;
  };
  const askYesNo = async (question, defaultYes) => {
    const suffix = defaultYes ? 'Y/n' : 'y/N';
    const answer = (await rl.question(`${question} (${suffix}): `)).trim().toLowerCase();
    if (!answer) return defaultYes;
    return answer === 'y' || answer === 'yes';
  };

  console.log('--- New site setup ---');
  console.log('Press Enter to accept the default shown in parentheses.\n');

  const siteName = await ask('Site name', 'My Website');
  const suggestedSlug = slugify(siteName);
  const domain = await ask('Custom domain for GitHub Pages (blank to skip)', '');
  const repoName = domain ? suggestedSlug : slugify(await ask('GitHub repo name (for the /repo-name/ Pages subpath, since no domain was given)', suggestedSlug));
  const heroSubtitle = await ask('Hero subtitle', 'A short, punchy line about what you do and who it helps.');
  const aboutBody = await ask('About paragraph', 'Replace this paragraph with a short description of your business, project, or organization.');
  const phone = await ask('Contact phone', '+1 (555) 555-5555');
  const email = await ask('Contact email', 'hello@example.com');
  const runBuild = await askYesNo('Run npm install and dotnet restore now?', true);

  rl.close();

  // --- SiteConfig.cs ---
  let siteConfig = readFile(SITE_CONFIG_PATH);
  siteConfig = siteConfig.replace(/public const string SiteName = "[^"]*";/, `public const string SiteName = "${siteName}";`);
  siteConfig = siteConfig.replace(/public const string Title = "[^"]*";/, `public const string Title = "Welcome to ${siteName}";`);
  siteConfig = siteConfig.replace(/public const string Subtitle = "[^"]*";/, `public const string Subtitle = "${heroSubtitle}";`);
  siteConfig = siteConfig.replace(
    /public const string Body =\s*\n?\s*"[^"]*"[^;]*;/,
    `public const string Body = "${aboutBody}";`
  );
  siteConfig = siteConfig.replace(/public const string Phone = "[^"]*";/, `public const string Phone = "${phone}";`);
  siteConfig = siteConfig.replace(/public const string Email = "[^"]*";/, `public const string Email = "${email}";`);
  writeFile(SITE_CONFIG_PATH, siteConfig);

  // --- wwwroot/index.html ---
  let indexHtml = readFile(INDEX_HTML_PATH);
  indexHtml = indexHtml.replace(/<title>[^<]*<\/title>/, `<title>${siteName}</title>`);
  indexHtml = indexHtml.replace(/<base href="[^"]*"\s*\/>/, `<base href="${domain ? '/' : `/${repoName}/`}" />`);
  writeFile(INDEX_HTML_PATH, indexHtml);

  // --- package.json ---
  const pkg = JSON.parse(readFile(PACKAGE_JSON_PATH));
  pkg.name = repoName;
  writeFile(PACKAGE_JSON_PATH, JSON.stringify(pkg, null, 2) + '\n');

  // --- wwwroot/CNAME ---
  if (domain) {
    writeFile(CNAME_PATH, `${domain}\n`);
  } else if (fs.existsSync(CNAME_PATH)) {
    fs.unlinkSync(CNAME_PATH);
  }

  console.log(`\nDone! Updated SiteConfig.cs, wwwroot/index.html, package.json${domain ? ', wwwroot/CNAME' : ''}.`);

  if (runBuild) {
    const { execSync } = require('child_process');
    console.log('\nRunning npm install...');
    execSync('npm install', { stdio: 'inherit', cwd: ROOT });
    console.log('\nRunning dotnet restore...');
    execSync('dotnet restore', { stdio: 'inherit', cwd: ROOT });
  }

  console.log('\nNext steps:');
  if (!runBuild) console.log('  npm install && dotnet restore');
  console.log('  npm run build:css && dotnet run   # preview locally');
  console.log('  npm run deploy                     # build, publish, and push to gh-pages');
  if (!domain) {
    console.log(`\nMake sure your GitHub repo is actually named "${repoName}" — the base href`);
    console.log('baked into wwwroot/index.html must match the repo name for asset URLs to resolve.');
  } else {
    console.log(`\nRemember to point your DNS for ${domain} at GitHub Pages and enable the`);
    console.log("custom domain in your repo's GitHub Pages settings.");
  }
  console.log('\nNote: this script is safe to re-run before you start hand-editing SiteConfig.cs');
  console.log('further — after that, edit the file directly.');
}

main().catch((err) => {
  console.error(`\nError: ${err.message}`);
  process.exit(1);
});
