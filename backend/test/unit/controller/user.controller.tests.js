import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import { userController } from "../../../controller/user.controller.js";
import httpMocks from "node-mocks-http";
import { User } from "../../../model/user.model.js";
chai.use(chaiAsPromised);

describe("unit tests on user controller", () => {
    const stubFind = sinon.stub(User, "find");
    let res;
    describe("200 OK tests", () => {
        beforeEach("setup", () => {
            res = httpMocks.createResponse();
        });
        it("should return a 200 with all stubbed users", async () => {
            stubFind
                .withArgs({})
                .resolves([
                    { username: "username1" },
                    { username: "username2" },
                ]);
            await userController.findAll(undefined, res);
            expect(res.statusCode).to.equals(200);
            expect(res._getData()).to.have.length(2);
        });
        it("should return a 200 with a selected user", async () => {
            let req = httpMocks.createRequest({
                params: { username: "username1" },
            });
            stubFind.resolves([{ username: "username1" }]);
            await userController.find(req, res);
            expect(res.statusCode).to.equals(200);
            expect(res._getData()).to.have.length(1);
        });
    });
    describe("400 Bad Request tests", () => {
        beforeEach("setup", () => {
            res = httpMocks.createResponse();
        });
        it("should return a rejected promise when find is called with no params", () => {
            let req = httpMocks.createRequest({ params: {} });
            expect(userController.find(req, res)).to.eventually.be.rejectedWith(
                Error
            );
            expect(res.statusCode).to.equal(400);
            expect(res._getData()).to.have.key("message");
        });
        it("should return a rejected promise and internal on broken findAll", () => {
            stubFind.withArgs({}).rejects();
            expect(
                userController.findAll(undefined, res)
            ).to.eventually.be.rejectedWith(Error);
        });
    });
});
