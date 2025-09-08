#!/bin/bash
set -e

echo "Building the app..."
npm run build

echo "Switching to deploy branch..."
git checkout deploy || git checkout -b deploy

echo "Copying build output to root..."
cp -r dist/* .

echo "Adding and committing changes..."
git add .
git commit -m "Deploy build $(date '+%Y-%m-%d %H:%M:%S')"

echo "Pushing to deploy branch..."
git push origin deploy

echo "Switching back to main branch..."
git checkout main

echo "Done."
