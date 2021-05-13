import sinon from "sinon";
import chai, { expect } from "chai";
import chaiHttp from "chai-http";
import mongoose from "mongoose";
import { User } from "../../../model/user.model.js";
import httpsServer from "../../../service/https.server.service.js";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import { Instant } from "../../../model/instant.model.js";
chai.use(chaiHttp);
const any = sinon.match.any;

describe("inspect instant controller", () => {
    beforeEach("assert db",(done) => {
        sinon.createSandbox();
        expect(mongoose.connection).to.not.be.undefined;
        done();
    });
    afterEach(() => {
        sinon.restore();
    })
    describe("POST instant", () => {
        let currentInstants = 0;
        sinon
            .stub(User, "create")
            .withArgs(any)
            .resolves({ _id: mongoose.Types.ObjectId().toHexString() });
        beforeEach("checks documents in instants", (done) => {
            Instant.countDocuments({},(_,count) => {
                currentInstants = count;
                done();
            })
        });
        it("should return OK on instant creation", (done) => {
            chai.request(httpsServer)
                .post("/api/instants")
                .set("Content-Type", "multipart/form-data")
                .type("form")
                .field("username", "username")
                .field("title", "title")
                .field("lat", "0")
                .field("long", "0")
                .attach("image", fs.readFileSync("test/resources/small_star.png"),"small_star.png")
                .end((_, res) => {
                    expect(res.status).to.equal(StatusCodes.OK);
                    expect(res.body).to.be.empty;
                    done();
                });
        });
        it("should return Bad Request on instant without file", (done) => {
            chai.request(httpsServer)
                .post("/api/instants")
                .set("Content-Type", "multipart/form-data")
                .type("form")
                .field("username", "username")
                .field("title", "title")
                .field("lat", "0")
                .field("long", "0")
                .end((_, res) => {
                    expect(res.status).to.equal(StatusCodes.BAD_REQUEST);
                    done();
                });
        });
        it("should retrieve all instants", (done) => {
            chai.request(httpsServer)
            .get("/api/instants")
            .end((_,res) => {
                expect(res.status).to.equal(StatusCodes.OK);
                expect(res.body).to.have.lengthOf(currentInstants);
                done();
            });
        });
    });
});
