@echo off
setlocal enabledelayedexpansion
rem Manual create/update/redeploy helper for this repo. Run from the project root:
rem   redeploy.bat              build + publish + deploy to the existing GitHub repo
rem   redeploy.bat -InitRepo    first time only: create the GitHub repo, push main, then deploy

set INIT_REPO=0
if /i "%1"=="-InitRepo" set INIT_REPO=1
if /i "%1"=="--init-repo" set INIT_REPO=1

for /f "delims=" %%i in ('node -p "require(''./package.json'').name"') do set REPO_NAME=%%i
for /f "delims=" %%i in ('gh api user --jq .login') do set GH_USER=%%i

if "%INIT_REPO%"=="1" (
  if not exist .git (
    git init
    git add -A
    git commit -m "Initial commit"
    git branch -M main
  )
  gh repo view %GH_USER%/%REPO_NAME% >nul 2>&1
  if errorlevel 1 (
    echo Creating GitHub repo %GH_USER%/%REPO_NAME%...
    gh repo create %REPO_NAME% --public --source=. --remote=origin --push
  ) else (
    echo GitHub repo %GH_USER%/%REPO_NAME% already exists, skipping creation.
  )
)

echo Building (Tailwind CSS + dotnet publish) and deploying...
call npm run deploy

set URL=https://%GH_USER%.github.io/%REPO_NAME%/
echo.
echo Deployed. Live at: %URL%
start "" "%URL%"
