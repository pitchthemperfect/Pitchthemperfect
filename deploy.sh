#!/bin/bash
# Deploy Pitch Them Perfect to Vercel
# Usage: ./deploy.sh
set -e
cd "$(dirname "$0")"
echo "🔨 Building..."
npx vercel build --prod --yes
echo "🚀 Deploying..."
npx vercel deploy --prebuilt --prod --yes
echo "✅ Live at https://pitch-them-perfect.vercel.app"
