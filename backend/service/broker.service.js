import amqp from "amqplib";

export function brokerFactory(context, sslContext, log) {
    return {
        connectionString: `amqps://${context.host}:${context.port}`,
        openConnection: () =>
            amqp.connect(`amqps://${context.host}:${context.port}`, {
                ca: sslContext.ca,
                key: sslContext.key,
                cert: [sslContext.cert],
                passphrase: sslContext.passphrase,
            }),
        sendToQueue: (open, msg, queue = context.queue) => {
            return open
                .then((connection) => connection.createChannel())
                .then((channel) =>
                    channel
                        .assertQueue(queue, { durable: true })
                        .then(() =>
                            channel.sendToQueue(queue, Buffer.from(msg))
                        )
                )
                .catch((err) => log.error(err));
        },
        consumeFromQueue: (open, callback, queue = context.queue) => {
            return open
                .then((connection) => connection.createChannel())
                .then((channel) =>
                    channel.consume(queue, callback, {
                        noAck: true,
                    })
                );
        },
    };
}
export function consumerFactory(broker,callback,log) {
    return broker.consumeFromQueue(broker.openConnection(), (msg) => {
        const jsonMessage = JSON.parse(msg.content.toString());
        log.info(jsonMessage.jobId);
        callback(jsonMessage);
    });
}
