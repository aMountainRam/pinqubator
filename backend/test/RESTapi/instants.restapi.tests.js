import { httpsServer as server } from "../../server.js";
import fs from "fs";
import db from "../../model/db.model.js";
import chai, { expect } from "chai";
import chaiHttp from "chai-http";

// This line allows use with https
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const resources = "test/resources";

let files = fs.readdirSync(resources);
chai.use(chaiHttp);
describe("upload of multiple image files", () => {
    beforeEach("clear instants and user collections", () => {
        db.mongoose.connection.db.dropCollection("instants");
        db.mongoose.connection.db.dropCollection("users");
    });
    it("should upload all resources but store on DB only images which are smaller than 140x140px", async () => {
        await Promise.allSettled(
            files.map(async (filename, i) => {
                let username = `username${i}`;
                let res = await chai
                    .request(server)
                    .post("/api/instants/")
                    .set("Content-Type", "multipart/form-data")
                    .attach(
                        "image",
                        fs.readFileSync(`${resources}/${filename}`),
                        filename
                    )
                    .field("username", username)
                    .field("lat", "0")
                    .field("long", "0")
                    .field("title", "title1")
                    .field("timestamp", new Date().toISOString());
                expect(res.statusCode).to.equal(200);
                return res;
            })
        );
        db.user.countDocuments({}, (_, count) => {
            expect(count).to.equal(4);
        });
        db.instant.countDocuments({}, (_, count) => {
            expect(count).to.equal(4);
        });
        db.instant
            .find({ image: { $exists: true } })
            .then((data) => expect(data).to.have.lengthOf(2));
    });
});
