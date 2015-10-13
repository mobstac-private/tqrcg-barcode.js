#!/bin/bash
set -e
rm -rf tmp;
mkdir tmp;

# just copy playground and dist files for now
cp -r dist test_data playground tmp/

cd tmp
git init

git config user.name "Travis CI"
git config user.email "mb@w69b.com"

git add .
git commit -m "Deploy to GitHub Pages"

git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:gh-pages > /dev/null 2>&1


