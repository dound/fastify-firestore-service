#!/bin/bash
cd "`dirname \"$0\"`"
script_path="`pwd`"

cd ..
embed-markdown # Update .md files before embedding the .md files into docs

cd "$script_path"
rm -rf generated

npx jsdoc --configure jsdoc.config.json --destination generated/libs/api --readme api.md ../src/api
npx jsdoc --configure jsdoc.config.json ../src/plugins `find ../src -type f -not -name index.js`

sed -e "s/docs\\/api[.]md/libs\\/api\\/index.html/g" generated/index.html > generated/tmp
mv generated/tmp generated/index.html

if [ "$GITHUB_SHA" = "" ]; then
    gitHash=`git rev-parse HEAD`
else
    gitHash=$GITHUB_SHA
fi
newLine="Generated from <a href=\"$gitHash\">$gitHash<\\/a><\\/article>"
cat ./generated/index.html | sed -e "s/[<][/]article[>]/$newLine/g" > tmp
mv tmp ./generated/index.html
