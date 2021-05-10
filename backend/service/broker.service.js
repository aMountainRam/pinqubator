import amqp from "amqplib";

let broker;
export function brokerFactory(context, sslContext, log) {
    broker = {
        connectionString: `amqps://${context.host}:${context.port}`,
        openConnection: () =>
            amqp.connect(`amqps://${context.host}:${context.port}`, {
                ca: sslContext.ca,
                key: sslContext.key,
                cert: [sslContext.cert],
                passphrase: sslContext.passphrase,
            }),
        sendToQueue: (open, msg) => {
            return open.then((connection) => {
                connection.createChannel().then((channel) => {
                    let queue = context.queue;
                    channel.assertQueue(queue, {
                        durable: false,
                    });
                    channel.sendToQueue(queue, Buffer.from(msg));
                    log.debug(" [x] Sent to %s", msg);
                });
            });
        },
        consumeFromQueue: (open, callback) => {
            return open.then((connection) => {
                connection.createChannel().then((channel) => {
                    let queue = context.queue;
                    channel.consume(queue, callback, {
                        noAck: true,
                    });
                });
            });
        },
    };
    return broker;
}
export default broker;
