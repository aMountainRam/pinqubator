import { expect } from "chai";
import httpMocks from "node-mocks-http";
import { handleInternal } from "../../../utils/messages.utils.js";
import { spyLogError } from "../../test.config.js";
import log4js from "log4js";
const log = log4js.getLogger("default");

describe("check branches into handleInternal", () => {
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
