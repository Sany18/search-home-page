#!/bin/bash
set -e


echo "Checking out main branch and pulling latest changes..."
git checkout main
git pull origin main

echo "Switching to deploy branch (creating if needed)..."
git checkout deploy || git checkout -b deploy

echo "Merging main into deploy..."
git merge main

echo "Building the app..."
npm run build

echo "Copying build output to root..."
cp -r dist/* .

echo "Adding and committing changes..."
git add .
git commit -m "Deploy build $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit."

echo "Pushing to deploy branch..."
git push origin deploy

echo "Switching back to main branch..."
git checkout main

echo "Done."
