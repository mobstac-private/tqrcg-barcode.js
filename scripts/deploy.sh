#!/bin/bash
set -e -v
# readJsonProp(jsonFile, property)
#
function readJsonProp {
  echo $(sed -En 's/.*"'$2'"[ ]*:[ ]*"(.*)".*/\1/p' $1)
}
VERSION=$(readJsonProp "package.json" "version")
echo Deploying version $VERSION...

rm -rf tmp || exit 1;
mkdir tmp
cp dist/* package.json bower.json LICENSE NOTICE tmp/
cd tmp

# git config user.name "Travis CI"
# git config user.email "mb@w69b.com"
# 
# git add -A
# git commit -m "v$VERSION" || true;
# git tag v$VERSION
# 
# git push --quiet origin master > /dev/null 2>&1
# git push --quiet origin v$VERSION > /dev/null 2>&1

echo "Depoying to npm..."
npm publish
