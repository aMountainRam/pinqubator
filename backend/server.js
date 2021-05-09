"use strict";
// set environment
export const nodeEnv = process.env.NODE_ENV;
export const serverPort = process.env.NODE_PORT;

// set log context
import log from "./conf/log.conf.js";

import fs from "fs";
import https from "https";
// set TLS/SSL context for server and client authentication
export const sslContext = {
    key: fs.readFileSync("ssl/backend.pinqubator.com.key"),
    cert: fs.readFileSync("ssl/backend.pinqubator.com.crt"),
    ca: fs.readFileSync("ssl/pinqubator-ca.pem"),
    passphrase: fs.readFileSync("ssl/ssl_passwords.txt").toString(),
    sslValidate: nodeEnv !== "dev", // in case of tests and dev environment, the db
    // is bridged on localhost:27017 while certificate
    // yields instants-db.pinqubator.com
};

import db from "./model/db.model.js";
// set DB
export const dbContext = {
    host: process.env.DBHOST,
    port: process.env.DBPORT,
    name: process.env.DBNAME,
    options: {
        authMechanism: "MONGODB-X509",
        ssl: true,
        sslValidate: sslContext.sslValidate,
        sslCA: sslContext.ca,
        sslKey: sslContext.key,
        sslCert: sslContext.cert,
        sslPass: sslContext.passphrase,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
};
// and connect using provided context
db.connect(dbContext)
    .then(() => log.info(`Connected to ${db.connectionString(dbContext)}`))
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });

// setup http server with applications
import express from "express";
// server holds context '/'
export const server = express();
// while api
export const app = express();
// is controlled by 'app' at '/api'
server.use("/api", app);
server.use("/", express.static("public"));

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// inject controller
import controller from "./controller/app.controller.js";
controller(app);

// server is ready for listening
// on 'serverPort' https only
// either way proxy pass redirects on 8443
// even http traffic
export const httpsServer = https
    .createServer(
        {
            key: sslContext.key,
            cert: sslContext.cert,
            passphrase: sslContext.passphrase,
        },
        server
    )
    .listen(serverPort, () => {
        log.info(`Running on port ${serverPort}`);
    });
