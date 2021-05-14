#!/bin/bash
export DBHOST=localhost;
export DBPORT=27017;
export BROKERHOST=localhost;
export BROKERPORT=5671;
export DOTENV_CONFIG_PATH=./.env.dev
WORKDIR=`dirname $0`;
bash $WORKDIR/wait-for-it.sh $DBHOST:$DBPORT -t 10 -s -- \
    bash $WORKDIR/wait-for-it.sh $BROKERHOST:$BROKERPORT -t 10 -s -- \
        node -r dotenv/config $(pwd)/server.js