import { v4 as uuid } from "uuid";
import mongoose from "mongoose";
import { Instant } from "../../../model/instant.model.js";
import { User } from "../../../model/user.model.js";
import { expect } from "chai";

describe("create and instant", () => {
    let extCount = 0;
    // remove tables
    beforeEach((done) => {
        mongoose.connection.db.dropDatabase().then(() => {
            extCount = 0;
            done();
        });
    });
    afterEach((done) => {
        Instant.countDocuments({}, function (_, count) {
            expect(count).to.be.equal(extCount);
            done();
        });
    });
    it("should create and instant", (done) => {
        const instant = new Instant({
            username: mongoose.Types.ObjectId(),
            title: "title",
            image: {
                jobId: uuid(),
            },
            size: {
                width: 0,
                height: 0,
            },
            location: {
                type: "Point",
                coordinates: [0, 0],
            },
        });
        instant.save().then(() => {
            expect(instant.isNew).to.be.false;
            extCount = 1;
            done();
        });
    });
    it("should create 3 instants and 2 different users", (done) => {
        const u1 = new User({ username: "u1" });
        const u2 = new User({ username: "u2" });
        User.insertMany([u1, u2])
            .then((res) => {
                expect(res.length).is.equal(2);
                return res;
            })
            .then((res) => {
                const i1 = new Instant({
                    username: res[0]._id,
                    title: "title",
                    image: {
                        jobId: uuid(),
                    },
                    size: {
                        width: 0,
                        height: 0,
                    },
                    location: {
                        type: "Point",
                        coordinates: [0, 0],
                    },
                });
                const i2 = new Instant({
                    username: res[1]._id,
                    title: "title",
                    image: {
                        jobId: uuid(),
                    },
                    size: {
                        width: 0,
                        height: 0,
                    },
                    location: {
                        type: "Point",
                        coordinates: [0, 0],
                    },
                });
                const i3 = new Instant({
                    username: res[1]._id,
                    title: "title",
                    image: {
                        jobId: uuid(),
                    },
                    size: {
                        width: 0,
                        height: 0,
                    },
                    location: {
                        type: "Point",
                        coordinates: [0, 0],
                    },
                });

                Instant.insertMany([i1, i2, i3]).then(() => {
                    extCount = 3;
                    done();
                });
            });
    });
});
