import assert from "assert";

describe("just a silly test", () => {
    let a = 1;
    let b = 2;
    beforeEach(() => {
        a = 1;
        b = 2;
    });
    it("should check a sum", () => assert.strictEqual(a + b, 3));
    it("should check assignment", () => {
        b = 4;
        assert.strictEqual(a + b, 5);
    });
    it("should check a sum", () => assert.strictEqual(a + b, 3));
});
