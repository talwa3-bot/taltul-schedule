#!/usr/bin/env bash
# Usage: ./build.sh            -> rebuild app + push everything
#        ./build.sh data       -> push only data.json (schedule update)
set -e
cd "$(dirname "$0")"
python3 -c "import json;json.load(open('data.json'))"   # validate
if [ "$1" != "data" ]; then
  (cd src && npx esbuild app.tsx --bundle --minify --charset=utf8 --jsx=automatic --define:process.env.NODE_ENV='"production"' --outfile=app.js)
  python3 build.py
fi
git add -A
git -c user.name=talwa3-bot -c user.email=talwa3-bot@users.noreply.github.com commit -qm "update $(date +%F_%H%M)" || echo "nothing to commit"
git push -q
echo "pushed. live in ~1 min: https://talwa3-bot.github.io/taltul-schedule/"
