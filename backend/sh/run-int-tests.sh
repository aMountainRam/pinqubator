#!/bin/bash
export NODE_ENV=test;
export NODE_PORT=8443;
export DBNAME=test;
export DBHOST=localhost;
export DBPORT=27017;
export BROKERHOST=localhost;
export BROKERPORT=5671;
WORKDIR=`dirname $0`;
bash $WORKDIR/wait-for-it.sh $DBHOST:$DBPORT -t 10 -s -- \
    bash $WORKDIR/wait-for-it.sh $BROKERHOST:$BROKERPORT -t 10 -s -- \
        mocha --timeout 60000 --exit "test/it/**/*.tests.js";