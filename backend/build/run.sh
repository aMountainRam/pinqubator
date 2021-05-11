#!/bin/bash
./wait-for-it.sh $DBHOST:$DBPORT -t 120 -s -- \
    ./wait-for-it.sh $BROKERHOST:$BROKERPORT -t 120 -s -- \
        node -r dotenv/config server.js
