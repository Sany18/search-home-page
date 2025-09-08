#!/bin/bash
set -e

echo "Building the app..."
npm run build

echo "Switching to publish branch..."
git checkout publish || git checkout -b publish

echo "Copying build output to root..."
cp -r dist/* .

echo "Adding and committing changes..."
git add .
git commit -m "Publish build $(date '+%Y-%m-%d %H:%M:%S')"

echo "Pushing to publish branch..."
git push origin publish

echo "Switching back to main branch..."
git checkout main

echo "Done."
