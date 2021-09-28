#!/usr/bin/env bash
set -e

if ! command -v jq &> /dev/null
then
    echo "jq could not be found"
    exit 1
fi

TARGET_FILE="./dist/RuntimeBuildInformation.js"

sed -i "s~{{dependencies}}~$(jq .dependencies package.json -cr)~" $TARGET_FILE
sed -i "s/{{version}}/$(jq .version package.json -cr)/" $TARGET_FILE
sed -i "s/{{build}}/$BUILD_NUMBER/" $TARGET_FILE
sed -i "s/{{commit}}/$COMMIT_HASH/" $TARGET_FILE
sed -i "s/{{date}}/$(date -u --iso-8601=seconds)/" $TARGET_FILE
