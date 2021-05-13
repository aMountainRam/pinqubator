"use strict";
import { EventEmitter } from "events";
import amqp from "amqplib";

export class BrokerConnection extends EventEmitter {
    constructor() {
        super();
        this.connection = undefined;
        this.context = {};
        this.url = undefined;
        this.consumer = undefined;
    }
    close() {
        this.connection.close();
        this.emit("disconnected");
    }
    setConnection(conn, url, context) {
        this.connection = conn;
        this.url = url;
        this.context = { ...context };
        this.emit("open", this.url);
    }
    /**
     * Publishes a message `msg` on connection `open`
     * on queue `queue`
     * @param {*} open
     * @param {*} msg
     * @param {*} queue
     * @returns {Promise<void>}
     */
    sendToQueue = async (msg, queue = this.context.queue) => {
        return await this.connection.createChannel().then(function (ch) {
            var ok = ch.assertQueue(queue, { durable: false });

            return ok.then(function (_qok) {
                ch.sendToQueue(queue, Buffer.from(msg));
                return ch.close();
            });
        });
    };
    /**
     * Enables a consumer to read from `queue` on connection `open`
     * while applying a `callback` for each message it receives
     * @param {*} open
     * @param {*} callback
     * @param {*} queue
     * @returns {Promise<void>}
     */
    consumeFromQueue = async (callback, queue = this.context.queue, emitter = this) => {
        return await this.connection.createChannel().then(function (ch) {
            ch.assertQueue(queue, { durable: false }).then(function (_qok) {
                emitter.emit("consuming",queue);
                return ch.consume(queue, callback, { noAck: true });
            });
        });
    };
    registerConsumer(callback) {
        if (this.connection) {
            this.consumeFromQueue(callback);
        } else {
            this.on("open", () => this.consumeFromQueue(callback));
        }
    }
}

/**
 * Opens a tls/ssl connection towards the message broker
 * @returns
 */
const connect = (context, sslContext) => {
    const url = `amqps://guest:guest@${context.host}:${context.port}`;
    amqp.connect(url, {
        ca: sslContext.ca,
        key: sslContext.key,
        cert: [sslContext.cert],
        passphrase: sslContext.passphrase,
    }).then((conn) => {
        connection.setConnection(conn, url, { ...context, ...sslContext });
    });
};

const connection = new BrokerConnection();
export default { connect, connection };