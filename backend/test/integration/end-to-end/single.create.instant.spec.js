import fs from "fs";
import httpsServer from "../../../service/https.server.service.js";
import chai, { expect } from "chai";
import chaiHttp from "chai-http";
import { User } from "../../../model/user.model.js";
import { Instant } from "../../../model/instant.model.js";
import { StatusCodes } from "http-status-codes";
import { resizeEvent } from "../../../service/resize.service.js";
chai.use(chaiHttp);

describe("end-to-end flow to create an instant", () => {
    let u = "username";
    before("reset users and instants tables", (done) => {
        if(Instant.find.restore) {
            Instant.find.restore()
        }
        if(Instant.findOneAndUpdate.restore){
            Instant.findOneAndUpdate.restore();
        }
        User.deleteMany({}).then(() => {
            Instant.deleteMany({}).then(() => {
                done();
            });
        });
    });
    after("check whether a user was created", (done) => {
        User.countDocuments({ username: u }, (_, count) => {
            expect(count).to.equal(1);
            done();
        });
    });
    it("perform and end-to-end creation with resize", (done) => {
        chai.request(httpsServer)
            .post("/api/instants")
            .set("Content-Type", "multipart/form-data")
            .type("form")
            .field("username", u)
            .field("title", "title")
            .field("lat", "0")
            .field("long", "0")
            .attach(
                "image",
                fs.readFileSync("test/resources/big_pic.png"),
                "big_pic.png"
            )
            .end(async (_1, res) => {
                expect(res.status).to.equal(StatusCodes.OK);
                expect(res.body).to.be.empty;
                resizeEvent.once("saved", (id) => {
                    chai.request(httpsServer)
                        .get(`/api/instants/${u}`)
                        .end((_2, re) => {
                            let obj = JSON.parse(re.text)[0].image;
                            expect(obj.jobId).is.equal(id);
                            expect(obj.buffer).is.not.undefined;
                            done();
                        });
                });
            });
    });
});
