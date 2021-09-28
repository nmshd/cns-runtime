export CONNECTION_STRING="mongodb://root:example@localhost:27021/?readPreference=primary&appname=transport&ssl=false"

docker-compose -f test/docker-compose.yml up -d
