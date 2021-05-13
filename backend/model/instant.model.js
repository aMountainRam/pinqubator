"use strict";
import mongoose from "mongoose";

const InstantSchema = mongoose.Schema(
        {
            username: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            title: {
                type: String,
                required: true,
            },
            image: {
                jobId: String,
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

export const Instant = mongoose.model("Instant", InstantSchema);
