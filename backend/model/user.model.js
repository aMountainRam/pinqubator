"use strict";

function user(db) {
    return db.Schema(
        {
            username: {
                type: String,
                required: true,
                unique: true,
            },
        },
        { timestamps: true }
    );
}

export default (db) => db.model("User", user(db));
