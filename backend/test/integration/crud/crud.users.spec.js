import { User } from "../../../model/user.model.js";
import { expect } from "chai";

describe("CRUD operations on 'users'", () => {
    let extCount = 0;
    // remove tables
    beforeEach((done) => {
        User.deleteMany({}).then(() => {
            extCount = 0;
            done();
        });
    });
    afterEach((done) => {
        User.countDocuments({}, function (_, count) {
            expect(count).to.equal(extCount);
            done();
        });
    });
    it("should create a new user", (done) => {
        User.create({ username: "u" }).then(() => {
            extCount = 1;
            done();
        });
    });
    it("should not create a user twice, test on unique index", (done) => {
        User.create({ username: "a" })
            .then(() => {
                extCount = 1;
            })
            .then(() => {
                expect(User.create({ username: "a" }))
                    .to.eventually.rejectedWith(Error)
                    .then(() => done());
            });
    });
});
