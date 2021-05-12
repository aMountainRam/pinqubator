import amqp from "amqplib";

/**
 * Connection factory to message broker.
 * It provides a method `openConnection` to open a connection which
 * abstracts away every tls/ssl complexities and takes
 * care of the connection string.
 *
 * More over pub/sub routines can be found at `sendToQueue` and
 * `consumeFromQueue`
 * @param {*} context
 * @param {*} sslContext
 * @returns
 */
export function brokerFactory(context, sslContext) {
    return {
        connectionString: `amqps://${context.host}:${context.port}`,
        /**
         * Opens a tls/ssl connection towards the message broker
         * @returns
         */
        openConnection: () =>
            amqp.connect(
                `amqps://guest:guest@${context.host}:${context.port}`,
                {
                    ca: sslContext.ca,
                    key: sslContext.key,
                    cert: [sslContext.cert],
                    passphrase: sslContext.passphrase,
                }
            ),
        /**
         * Publishes a message `msg` on connection `open`
         * on queue `queue`
         * @param {*} open
         * @param {*} msg
         * @param {*} queue
         * @returns {Promise<void>}
         */
        sendToQueue: async (open, msg, queue = context.queue) => {
            return await open.then(function (conn) {
                return conn.createChannel().then(function (ch) {
                    var ok = ch.assertQueue(queue, { durable: false });

                    return ok.then(function (_qok) {
                        ch.sendToQueue(queue, Buffer.from(msg));
                        return ch.close();
                    });
                });
            });
        },
        /**
         * Enables a consumer to read from `queue` on connection `open`
         * while applying a `callback` for each message it receives
         * @param {*} open
         * @param {*} callback
         * @param {*} queue
         * @returns {Promise<void>}
         */
        consumeFromQueue: async (open, callback, queue = context.queue) => {
            return await open.then(function (conn) {
                return conn.createChannel().then(function (ch) {
                    ch.assertQueue(queue, { durable: false }).then(function (
                        _qok
                    ) {
                        return ch.consume(queue, callback, { noAck: true });
                    });
                });
            });
        },
    };
}
export function consumerFactory(broker, callback, log) {
    return broker.consumeFromQueue(broker.openConnection(), (msg) => {
        const jsonMessage = JSON.parse(msg.content.toString());
        log.info(jsonMessage.jobId);
        callback(jsonMessage);
    });
}
