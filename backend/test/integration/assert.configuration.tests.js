import { expect } from "chai"

describe("checks the configuration is in place",() => {
    it("environment configuration should checkout", () => {
        expect(process.env.DBHOST).is.not.undefined;
        expect(process.env.DBPORT).is.not.undefined;
        expect(process.env.BROKERHOST).is.not.undefined;
        expect(process.env.BROKERPORT).is.not.undefined;
    })
})