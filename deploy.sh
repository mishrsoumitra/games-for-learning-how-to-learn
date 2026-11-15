#!/bin/sh
# Copy the labs into site/ and deploy site/ to Vercel.
# First time only: npx vercel login
set -e
cd "$(dirname "$0")"
cp attention-lab.html disturbance-lab.html working-memory-lab.html thinking-fast-and-slow-lab.html expert-novice-lab.html how-the-mind-learns-lab.html site/
cd site
npx --yes vercel deploy --prod --yes
