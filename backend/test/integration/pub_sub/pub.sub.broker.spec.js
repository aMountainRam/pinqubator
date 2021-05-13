import { v4 as uuid } from "uuid";
import { expect } from "chai";
import broker from "../../../service/broker.service.js";
import { EventEmitter } from "events";

describe("attempt to pub/sub on rabbitmq broker", () => {
    const queue = uuid();
    const eventEmitter = new EventEmitter();
    before(
        "assert connection is alive, create consumer on random queue and init an event emitter",
        (done) => {
            expect(broker.connection.connection).to.not.be.undefined;
            broker.connection
                .consumeFromQueue(
                    (msg) => eventEmitter.emit("collected", msg),
                    queue
                )
                .then(() => {
                    done();
                });
        }
    );
    it("should produce/consume hundreds messages but read only once", (done) => {
        Array(256)
            .fill(0)
            .map((_, i) =>
                broker.connection.sendToQueue(`message ${i}`, queue)
            );
        eventEmitter.once("collected", (msg) => {
            expect(msg.content.toString()).to.match(/^message \d{1,3}$/);
            done();
        });
    });
});
