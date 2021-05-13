import sinon from "sinon";
import log4js from "log4js";
log4js.configure({
    appenders: { console: { type: "console" } },
    categories: {
        default: { appenders: ["console"], level: "fatal" },
    },
});

export const spyLogError = sinon.spy(log4js.getLogger("default"), "error");

class Stub {
    constructor(obj,methodName) {
        this.original = obj[methodName];
        this.stub = sinon.stub(obj,methodName);
    }
}
import {User} from  "../model/user.model.js"
import {Instant} from  "../model/instant.model.js"
export const stubs = { userfind: new Stub(User,"find"), insantfind: new Stub(Instant,"find") };