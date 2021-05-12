import { expect } from "chai";
import httpMocks from "node-mocks-http";
import sinon from "sinon";
import log from "../../../conf/log.conf.js";
import { handleInternal } from "../../../utils/messages.utils.js";

describe("check branches into handleInternal", () => {
    let spyLogError = sinon.spy(log, "error");
    beforeEach("setup", () => {
        spyLogError.resetHistory();
    });
    it("should go for bad request on a non-Mongo-duplicate throw", () => {
        let res = httpMocks.createResponse();
        let err = { code: 11000, name: "MongoError" };
        handleInternal(err, res, log);
        expect(res.statusCode).is.equal(400);
        expect(spyLogError.calledOnce);
    });
    it("should go for internal server error on many cases", () => {
        let res = httpMocks.createResponse();
        let err = {};
        handleInternal(err, res, log);
        expect(res.statusCode).is.equal(500);
        expect(spyLogError.calledOnce);
    });
});
