#!/bin/sh
# Copy the labs into site/, build Study Lab into site/study-lab/, and deploy site/ to Vercel.
# First time only: npx vercel login
set -e
cd "$(dirname "$0")"
cp attention-lab.html disturbance-lab.html working-memory-lab.html thinking-fast-and-slow-lab.html site/

# Study Lab (React app). npm ci installs the exact locked versions; the audit fails the
# deploy if any dependency has a known vulnerability.
( cd study-lab && npm ci && npm run audit && npm run build )
rm -rf site/study-lab
cp -R study-lab/dist site/study-lab

cd site
npx --yes vercel deploy --prod --yes
