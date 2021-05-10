import { expect } from "chai";
import logger from "../conf/log.conf.js";
import { brokerFactory } from "../service/broker.service.js";
import fs from "fs";

const sslContext = {
    key: fs.readFileSync("ssl/backend.pinqubator.com.key"),
    cert: fs.readFileSync("ssl/backend.pinqubator.com.crt"),
    ca: fs.readFileSync("ssl/pinqubator-ca.pem"),
    passphrase: fs.readFileSync("ssl/ssl_passwords.txt").toString(),
};

const broker = brokerFactory(
    { host: "localhost", port: "5671", queue: "resizetest" },
    sslContext,
    logger
);
describe("attempt connection to rabbitmq broker", () => {
    it("should use tls protocol to connect", () => {
        expect(broker.connectionString).to.contain("amqps");
    });
    it("should produce/consume hundreds messages", () => {
        Array(256)
            .fill(0)
            .forEach((_, i) =>
                broker.sendToQueue(broker.openConnection(), `message ${i}`)
            );
        broker.consumeFromQueue(broker.openConnection(), (msg) => {
            expect(msg.content.toString()).to.match(/^message \d{1,3}$/);
        });
    });
});
