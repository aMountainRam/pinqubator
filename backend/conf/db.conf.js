"use strict";
import sslContext from "./ssl.conf.js";
import log4js from "log4js";
import mongoose from "mongoose";
const log = log4js.getLogger("default");

const context = {
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
        useFindAndModify: false,
        useCreateIndex: true,
    },
};
mongoose.Promise = global.Promise;
mongoose.connect(
    `mongodb://${context.host}:${context.port}/${context.name}`,
    context.options
);
if (process.env.QUERY_DEBUG) {
    mongoose.set("debug", (coll, method, query) =>
        log.debug(
            `called '${method}' on collection '${coll}': ${JSON.stringify(
                query
            )}`
        )
    );
}
mongoose.connection
    .once("open", () =>
        log.info(
            `Connected to mongodb://${context.host}:${context.port}/${context.name}`
        )
    )
    .on("error", (error) => log.warn("Error : ", error))
    .on("disconnected",() => log.info("Mongoose disconnected"));
