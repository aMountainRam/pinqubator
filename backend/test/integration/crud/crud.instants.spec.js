import { Instant } from "../../../model/instant.model.js";
import { User } from "../../../model/user.model.js";
import { expect } from "chai";
import { instantWithoutUser, threeInsants, twoUsers } from "../utils.tests.js";

describe("CRUD operations on 'instants'", () => {
    let extCount = 0;
    // remove tables
    beforeEach((done) => {
        Instant.deleteMany({}).then(() => {
            extCount = 0;
            User.deleteMany({}).then(() => {
                done();
            });
        });
    });
    afterEach((done) => {
        Instant.countDocuments({}, function (_, count) {
            expect(count).to.be.equal(extCount);
            done();
        });
    });
    it("should create and instant", (done) => {
        const instant = instantWithoutUser;
        instant.save().then(() => {
            expect(instant.isNew).to.be.false;
            extCount = 1;
            done();
        });
    });
    it("should create 3 instants and 2 different users", (done) => {
        User.insertMany(twoUsers)
            .then((res) => {
                expect(res.length).is.equal(2);
                return res;
            })
            .then((res) => {
                Instant.insertMany(threeInsants(res)).then(() => {
                    extCount = 3;
                    done();
                });
            });
    });
    it("removes all instants created", (done) => {
        User.insertMany(twoUsers)
            .then((res) => {
                expect(res.length).is.equal(2);
                return res;
            })
            .then((res) => {
                Instant.insertMany(threeInsants(res)).then(() => {
                    extCount = 3;
                    Instant.deleteOne({ username: twoUsers[0]._id }).then(
                        () => {
                            extCount = 2;
                            done();
                        }
                    );
                });
            });
    });
});
