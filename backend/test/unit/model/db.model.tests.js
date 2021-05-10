import db from "../../../model/db.model.js";
import { assert } from "chai";

describe("test db free properties", () => {
    it("should return the connection string", () => {
        assert.strictEqual(
            db.connectionString({ host: "host", port: "port", name: "name" }),
            "mongodb://host:port/name"
        );
    });
});
