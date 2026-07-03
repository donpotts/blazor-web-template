#!/usr/bin/env bash
# Manual create/update/redeploy helper for this repo. Run from the project root:
#   ./redeploy.sh              # build + publish + deploy to the existing GitHub repo
#   ./redeploy.sh -InitRepo    # first time only: create the GitHub repo, push main, then deploy
set -e

INIT_REPO=false
if [ "$1" = "-InitRepo" ] || [ "$1" = "--init-repo" ]; then
  INIT_REPO=true
fi

REPO_NAME=$(node -p "require('./package.json').name")
GH_USER=$(gh api user --jq .login)

if [ "$INIT_REPO" = true ]; then
  if [ ! -d .git ]; then
    git init
    git add -A
    git commit -m "Initial commit"
    git branch -M main
  fi
  if ! gh repo view "$GH_USER/$REPO_NAME" >/dev/null 2>&1; then
    echo "Creating GitHub repo $GH_USER/$REPO_NAME..."
    gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
  else
    echo "GitHub repo $GH_USER/$REPO_NAME already exists, skipping creation."
  fi
fi

echo "Building (Tailwind CSS + dotnet publish) and deploying..."
npm run deploy

URL="https://$GH_USER.github.io/$REPO_NAME/"
echo ""
echo "Deployed. Live at: $URL"
if command -v open >/dev/null 2>&1; then
  open "$URL"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL"
fi
