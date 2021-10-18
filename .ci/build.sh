set -e
set -x

npm ci
npm run lint:prettier
npm run lint:eslint
npx license-check

# dependencies should only be checked with audit level 'high'
# because there is currently an issue with one of the dependencies (qrcode)
npm audit --audit-level high

npm run build:ci
