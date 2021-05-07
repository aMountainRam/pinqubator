#!/bin/bash
./wait-for-it.sh $DBHOST:$DBPORT -t 120 -s -- node server.js
