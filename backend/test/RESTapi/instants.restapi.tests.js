import { httpsServer as server } from "../../server.js";
import fs from "fs";
import db from "../../model/db.model.js";
import chai, { assert } from "chai";
import chaiHttp from "chai-http";
import jpeg from "smallest-jpeg";

// This line allows use with https
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

chai.use(chaiHttp);
describe("test https server startup", () => {
    beforeEach("clear instants collection", () => {
        db.user.deleteMany({});
        db.instant.deleteMany({});
    });
    describe("create an instant", () => {
        it("should GET all users", (done) => {
            chai.request(server)
                .post("/api/instants/")
                .set("Content-Type", "multipart/form-data")
                .attach("image", fs.readFileSync("test/resources/star.png"), "star.png")
                .field("username", "username1")
                .field("lat", "0")
                .field("long", "0")
                .field("title", "title1")
                .field("timestamp", new Date().toISOString())
                .end((_, res) => {
                    assert.strictEqual(res.status, 200);
                    done();
                });
        });
    });
});
