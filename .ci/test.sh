set -e
set -x

export CONNECTION_STRING="mongodb://127.0.0.1:27017/?readPreference=primary&appname=Core&ssl=false"
npm run test:ci
