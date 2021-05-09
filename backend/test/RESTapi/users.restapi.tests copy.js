import { httpsServer as server } from "../../server.js";
import db from "../../model/db.model.js";
import chai, { assert } from "chai";
import chaiHttp from "chai-http";

// This line allows use with https
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

chai.use(chaiHttp);
describe("test https server startup", () => {
    beforeEach("clear instants collection", () => db.user.deleteMany({}));
    describe("/GET users", () => {
        it("should GET all users", (done) => {
            chai.request(server)
                .get("/api/users/")
                .end((_, res) => {
                    console.log(res.text);
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(Object.keys(res.body).length, 0);
                    done();
                });
        });
        it("should create a user and check collection size", (done) => {
            chai.request(server)
                .post("/api/users/")
                .set("Content-Type", "application/json")
                .send({ username: "username1" })
                .end((_, res) => {
                    assert.strictEqual(res.status, 200);
                });
            chai.request(server)
                .get("/api/users/")
                .end((_, res) => {
                    console.log(res.body);
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(Object.keys(res.body).length, 1);
                    assert.strictEqual(res.body[0].username,"username1");
                });
            done();
        });
        it("should create a user but being unable to create a second one", (done) => {
            chai.request(server)
                .post("/api/users/")
                .set("Content-Type", "application/json")
                .send({ username: "username1" })
                .end((_, res) => {
                    assert.strictEqual(res.status, 200);
                });
            chai.request(server)
                .post("/api/users/")
                .set("Content-Type", "application/json")
                .send({ username: "username1" })
                .end((err, _) => {
                    console.log(err);
                    assert.isNotNull(err);
                });
            done();
        })
    });
});
