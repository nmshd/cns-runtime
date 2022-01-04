set -e
set -x

npm ci
npm run lint:prettier
npm run lint:eslint
npx license-check
npx better-npm-audit audit --exclude 1004876
