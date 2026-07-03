#!/usr/bin/env pwsh
# Manual create/update/redeploy helper for this repo. Run from the project root:
#   ./redeploy.ps1              # build + publish + deploy to the existing GitHub repo
#   ./redeploy.ps1 -InitRepo    # first time only: create the GitHub repo, push main, then deploy
param(
    [switch]$InitRepo
)

$ErrorActionPreference = 'Stop'

$pkg = Get-Content package.json | ConvertFrom-Json
$repoName = $pkg.name
$ghUser = (gh api user --jq .login)

if ($InitRepo) {
    if (-not (Test-Path .git)) {
        git init
        git add -A
        git commit -m "Initial commit"
        git branch -M main
    }
    $exists = gh repo view "$ghUser/$repoName" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Creating GitHub repo $ghUser/$repoName..."
        gh repo create $repoName --public --source=. --remote=origin --push
    } else {
        Write-Host "GitHub repo $ghUser/$repoName already exists, skipping creation."
    }
}

Write-Host "Building (Tailwind CSS + dotnet publish) and deploying..."
npm run deploy

$url = "https://$ghUser.github.io/$repoName/"
Write-Host ""
Write-Host "Deployed. Live at: $url"
Start-Process $url
