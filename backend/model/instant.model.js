"use strict";

function instant(db) {
    return db.Schema(
        {
            username: {
                type: db.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            title: {
                type: String,
                required: true,
            },
            image: {
                buffer: Buffer,
                encoding: String,
                fieldname: String,
                originalname: String,
                mimetype: String,
                size: Number
            },
            size: {
                width: Number,
                height: Number,
            },
            location: {
                type: {
                    type: String,
                    enum: ["Point"],
                    required: true,
                },
                coordinates: {
                    type: [Number],
                    required: true,
                },
            },
        },
        { timestamps: true }
    );
}

export default (db) => db.model("Instant", instant(db));
