"use strict";

function user(db) {
    return db.Schema({
        username: {
            type: String,
            required: true,
        },
    });
}

export default (db) => db.model("User", user(db));
