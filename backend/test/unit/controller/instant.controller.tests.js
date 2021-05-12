import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import httpMocks from "node-mocks-http";
import moment from "moment";
import { instantController } from "../../../controller/instant.controller.js";
import db from "../../../model/db.model.js";
chai.use(chaiAsPromised);

describe("unit tests on instant controller", () => {
    let res;
    let find = sinon.stub(db.instant, "find");
    let userFindOne = sinon.stub(db.user, "findOne");
    describe("200 OK tests", () => {
        let arr = [
            {
                _id: 0,
                username: 0,
                createdAt: new Date(),
            },
            {
                _id: 1,
                username: 1,
                createdAt: moment().add(1, "days").toDate(),
            },
            {
                _id: 2,
                username: 0,
                createdAt: moment().subtract(1, "days").toDate(),
            },
        ];
        beforeEach("setup", () => {
            res = httpMocks.createResponse();
        });
        it("should return a 200 with all instants", () => {
            find.withArgs({}).returns({
                sort: () => {
                    arr.sort(
                        (a, b) => b.createdAt.valueOf() - a.createdAt.valueOf()
                    );
                    return Promise.resolve(arr);
                },
            });
            instantController.findAll(undefined, res).then((data) => {
                expect(data[0]._id).to.equal(1);
                expect(data).to.be.an("array").to.have.lengthOf(3);
            });
        });
        it("should return a 200 with instants of a given user", async () => {
            const reqOptions = { params: { username: "username" } };
            let req = httpMocks.createRequest(reqOptions);
            userFindOne
                .withArgs(reqOptions.params)
                .resolves({ username: "username", _id: 0 });

            find.withArgs({ username: 0 }).returns({
                sort: () => {
                    let fArr = arr.filter((i) => i.username === 0);
                    fArr.sort(
                        (a, b) => b.createdAt.valueOf() - a.createdAt.valueOf()
                    );
                    return Promise.resolve(fArr);
                },
            });
            let output = await instantController.findByUsername(req, res);
            expect(output).to.be.lengthOf(2);
        });
    });
    describe("400 Bad Request tests", () => {
        beforeEach("setup", () => {
            res = httpMocks.createResponse();
        });
        it("should return a bad request on improper param at findByUsername", () => {
            let req = httpMocks.createRequest({ params: {} });
            expect(
                instantController.findByUsername(req, res)
            ).to.eventually.rejectedWith(Error);
        });
    });
    describe("500 Internal Error tests", () => {
        beforeEach("setup", () => {
            res = httpMocks.createResponse();
        });
        it("findByUsername: should break on user findOne throw", async () => {
            let reqOptions = { params: { username: "username" } };
            let req = httpMocks.createRequest(reqOptions);
            userFindOne.withArgs(reqOptions.params).rejects();
            await instantController.findByUsername(req, res);
            expect(res.statusCode).to.equal(500);
            expect(res._getData()).to.have.key("message")
        });
        it("findByUsername: should break on instant find throw", async () => {
            let reqOptions = { params: { username: "username" } };
            let req = httpMocks.createRequest(reqOptions);
            userFindOne.withArgs(reqOptions.params).resolves({_id:0});
            find.withArgs({username: 0}).returns({
                sort: () => Promise.reject()
            });
            await instantController.findByUsername(req,res);
            expect(res.statusCode).to.equal(500);
            expect(res._getData()).to.have.key("message")
        })
    });
});

describe("unit tests on instant create",() => {
})