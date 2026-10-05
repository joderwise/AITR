#!/bin/sh
# Screenshot every page × breakpoint × state into shots/review/. Requires a server on :8110 (python3 -m http.server 8110).
cd "$(dirname "$0")/.." || exit 1
mkdir -p shots/review
B=http://localhost:8110
shot() { node tools/shot.mjs "$B/$1" "shots/review/$2-$3.png" "$3" full | python3 -c "import sys,json; d=json.load(sys.stdin); e=[x for x in d['errors'] if 'deprecated' not in x]; print(d['out'], d['size'], ('ERRORS: '+' | '.join(e)) if e else 'ok')"; }
for w in 1440 834 390; do
  shot "index.html" home $w
  shot "browse.html" browse $w
  shot "browse.html?state=no-results" browse-no-results $w
  shot "browse.html?state=loading" browse-loading $w
  shot "browse.html?state=search-loading" browse-search-loading $w
  shot "how-we-assess.html#what-is-roai" assess-13-1 $w
  shot "how-we-assess.html#how-we-rate" assess-13-2 $w
  shot "how-we-assess.html#every-tier" assess-13-3 $w
  shot "how-we-assess.html#safety-levels" assess-13-4 $w
  shot "how-we-assess.html#what-we-check" assess-13-5 $w
  shot "how-we-assess.html#our-facts" assess-13-6 $w
  shot "how-we-assess.html#how-current" assess-13-7 $w
  shot "for-business.html" business $w
  shot "for-business.html?state=contact-success" business-contact-success $w
  shot "contribute.html" contribute $w
  shot "contribute.html?state=error" contribute-error $w
  shot "contribute.html?state=success" contribute-success $w
  shot "tool.html" tool-locked $w
  shot "tool.html?state=unlocked" tool-unlocked $w
  shot "tool.html?state=tier-error" tool-tier-error $w
  shot "tool.html?state=tier-loading" tool-tier-loading $w
  shot "tool.html?state=unlock-error" tool-unlock-error $w
done
