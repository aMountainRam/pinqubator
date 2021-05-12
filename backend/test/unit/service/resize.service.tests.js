import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import db from "../../../model/db.model.js";
import { resize } from "../../../service/resize.service.js";
import smallestJpeg from "smallest-jpeg";
import sizeOf from "image-size";
chai.use(chaiAsPromised);

const log = {
    error: (msg) => {},
};
let findOneAndUpdate = sinon.stub(db.instant, "findOneAndUpdate");
describe("", () => {
    findOneAndUpdate.resolves();
    it("should break on bad image buffer", () => {
        expect(
            resize(db, log, { buffer: { data: [] } })
        ).to.eventually.rejectedWith(Error);
    });
    it("should break on unresizable buffer", async () => {
        let buffer = await resize(db, log, {buffer: {data: [...smallestJpeg]}})
        expect(sizeOf(buffer)).to.have.property("width",140);
    })
});
