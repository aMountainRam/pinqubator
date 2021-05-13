#!/bin/bash
export DOTENV_CONFIG_PATH=./.env.test
WORKDIR=`dirname $0`;
bash $WORKDIR/wait-for-it.sh $DBHOST:$DBPORT -t 10 -s -- \
    bash $WORKDIR/wait-for-it.sh $BROKERHOST:$BROKERPORT -t 10 -s -- \
        mocha \
            --require dotenv/config \
            --exit
            --timeout 60000
            -R spec
            --recursive "./test/**/*.js";