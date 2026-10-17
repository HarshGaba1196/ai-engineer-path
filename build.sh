#!/bin/sh
# Builds the single-page app from src/:
#   ai-engineer-path.html  page body for the Claude artifact (Claude adds the document skeleton)
#   index.html             standalone page for GitHub Pages or any static host
cd "$(dirname "$0")"
{ cat src/head.html; echo "<script>"; cat src/phases.js src/lessons.js src/game.js src/dash.js src/app.js; echo "</script>"; } > ai-engineer-path.html
{
  echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
  echo '<meta name="description" content="A gamified learning path from backend engineer to AI engineer.">'
  echo '<style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}</style>'
  echo '</head><body>'
  cat ai-engineer-path.html
  echo '</body></html>'
} > index.html
echo "Built ai-engineer-path.html and index.html"
