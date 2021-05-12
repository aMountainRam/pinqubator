import { expect } from "chai"

describe("checks the configuration is in place",() => {
    it("environment configuration should checkout", () => {
        expect(process.env.DBNAME).to.equal("test");
        expect(process.env.NODE_ENV).to.equal("test");
    })
})