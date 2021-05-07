"use strict";
import fs from "fs";
import https from "https";
import express from "express";
import log from "./conf/log.conf.js";
import db from "./model/db.model.js";

const DBHOST = process.env.DBHOST;
const DBPORT = process.env.DBPORT;
const SSL_VALIDATE = process.env.NODE_ENV !== "dev";
const sslContext = {
    key: fs.readFileSync("ssl/backend.pinqubator.com.key"),
    cert: fs.readFileSync("ssl/backend.pinqubator.com.crt"),
    ca: fs.readFileSync("ssl/pinqubator-ca.pem"),
    passphrase: fs.readFileSync("ssl/ssl_passwords.txt").toString(),
};
var connected = false;
db.mongoose
    .connect(`mongodb://${DBHOST}:${DBPORT}/test`, {
        ssl: true,
        sslValidate: SSL_VALIDATE,
        sslCA: sslContext.ca,
        sslKey: sslContext.key,
        sslCert: sslContext.cert,
        sslPass: sslContext.passphrase,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => log.info(`Connected to mongodb://${DBHOST}:${DBPORT}/test`))
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });

const PORT = 8443;
const app = express();
app.get("/api", (req, res) => {
    res.send(`Welcome; Mongoose is ${connected ? "" : "not"} connected on ${DBHOST}:${DBPORT}`);
});
https
    .createServer(
        {
            key: sslContext.key,
            cert: sslContext.cert,
            passphrase: sslContext.passphrase,
        },
        app
    )
    .listen(PORT, () => {
        console.log(`Running on port ${PORT}`);
    });
