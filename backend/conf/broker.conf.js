"use strict";
import broker from "../service/broker.service.js";
import sslContext from "./ssl.conf.js";
import log4js from "log4js";
import { resize } from "../service/resize.service.js";
import { deserialize } from "../utils/messages.utils.js";

const log = log4js.getLogger("default");

const context = {
    host: process.env.BROKERHOST,
    port: process.env.BROKERPORT,
    queue: process.env.RESIZEQUEUE,
};

broker.connection
    .once("open", (url) => log.info(`Connected to message broker at ${url}`))
    .on("error", (error) => log.warn("Error : ", error))
    .on("disconnected", () => log.info("Message broker disconnected"))
    .on("consuming", (queue) => log.info(`Consumer started on queue ${queue}`));

broker.connect(context, sslContext);
broker.connection.registerConsumer((msg) => {
    resize(deserialize(msg));
});
