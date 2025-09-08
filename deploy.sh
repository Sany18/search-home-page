#!/bin/bash
set -e

git checkout main
git checkout deploy || git checkout -b deploy
git reset --hard main
npm run build
cp -r dist/* .
git add .
git commit -m "Deploy build $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit."
git push -f origin deploy
git checkout main

echo "Done."
