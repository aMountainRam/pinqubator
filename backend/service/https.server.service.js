"use strict"
// setup http server with applications
import log4js from "log4js";
import https from "https";
import express from "express";
import multer from "multer";
import cors from "cors";
import router from "../router/app.router.js";
import sslContext from "../conf/ssl.conf.js";

/**
 * HTTP CONTEXT '/api'
 */
const app = express();

/**
 * SECURITY
 */
let corsOptions = {};
if (process.env.NODE_ENV === "prod") {
    corsOptions = {
        origin: [/^(https?:\/\/(?:.+\.)?pinqubator\.com(?::\d{1,5})?)$/],
        optionsSuccessStatus: 200,
    };
} else {
    corsOptions = {
        origin: [/^(https?:\/\/(?:.+\.)?localhost(?::\d{1,5})?)$/],
        optionsSuccessStatus: 200,
    };
}
app.use(cors(corsOptions));

/**
 * REQ/RES PARSING
 */
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer().any()); // for parsing multipart/form-data

/**
 * ROUTING
 */
app.use("/api",router);

// server is ready for listening
// on 'serverPort' https only
// either way proxy pass redirects on 8443
// even http traffic
const log = log4js.getLogger("default");
const SERVER_PORT = process.env.NODE_PORT || 8443;
const httpsServer = https
    .createServer(
        {
            key: sslContext.key,
            cert: sslContext.cert,
            passphrase: sslContext.passphrase,
        },
        app
    )
    .listen(SERVER_PORT, () => {
        log.info(`Running on port ${SERVER_PORT}`);
    }).addListener("error", (err) => log.error(err));

export default httpsServer;