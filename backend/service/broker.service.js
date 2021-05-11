import amqp from "amqplib";

export function brokerFactory(context, sslContext, log) {
    return {
        connectionString: `amqps://${context.host}:${context.port}`,
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
        sendToQueue: (open, msg, queue = context.queue) => {
            return open.then(function (conn) {
                return conn.createChannel().then(function (ch) {
                    var ok = ch.assertQueue(queue, { durable: false });

                    return ok.then(function (_qok) {
                        ch.sendToQueue(queue, Buffer.from(msg));
                        return ch.close();
                    });
                });
            });
            // .then(
            //     (connection) => connection.createChannel(),
            //     (err) => log.error(err)
            // )
            // .then((channel) =>
            //     channel.assertQueue(queue, { durable: true }, (err, ok) =>
            //         channel.sendToQueue(queue, Buffer.from(msg))
            //     )
            // )
            // .catch((err) => log.error(err));
        },
        consumeFromQueue: (open, callback, queue = context.queue) => {
            return open.then(function (conn) {
                return conn.createChannel().then(function (ch) {
                    ch.assertQueue(queue, { durable: false }).then(function (
                        _qok
                    ) {
                        return ch.consume(queue, callback, { noAck: true });
                    });
                });
            });
            // .then(
            //     (connection) => connection.createChannel(),
            //     (err) => log.error(err)
            // )
            // .then((channel) =>
            //     channel.consume(queue, callback, {
            //         noAck: true,
            //     })
            // );
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
