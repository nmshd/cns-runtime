set -e
set -x

npm run lint:prettier
npm run lint:eslint
npx license-check
npx better-npm-audit audit --exclude 1004876
