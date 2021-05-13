import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import { resize } from "../../../service/resize.service.js";
import smallestJpeg from "smallest-jpeg";
import sizeOf from "image-size";
import { Instant } from "../../../model/instant.model.js";
chai.use(chaiAsPromised);

const log = {
    error: (msg) => {},
};
let findOneAndUpdate = sinon.stub(Instant, "findOneAndUpdate");
describe("", () => {
    findOneAndUpdate.resolves();
    it("should break on bad image buffer", () => {
        expect(
            resize({ buffer: { data: [] } })
        ).to.eventually.rejectedWith(Error);
    });
    it("should break on unresizable buffer", async () => {
        let buffer = await resize({buffer: {data: [...smallestJpeg]}})
        expect(sizeOf(buffer)).to.have.property("width",140);
    })
});
