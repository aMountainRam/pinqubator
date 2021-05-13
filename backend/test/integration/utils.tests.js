import mongoose from "mongoose";
import { User } from "../../model/user.model.js";
import { v4 as uuid } from "uuid";
import { Instant } from "../../model/instant.model.js";

export const twoUsers = [
    new User({ username: "u1" }),
    new User({ username: "u2" }),
];
export const instantWithoutUser = new Instant({
    username: mongoose.Types.ObjectId(),
    title: "title",
    image: {
        jobId: uuid(),
    },
    size: {
        width: 0,
        height: 0,
    },
    location: {
        type: "Point",
        coordinates: [0, 0],
    },
});
export const threeInsants = (res) => [
    new Instant({
        username: res[0]._id,
        title: "title",
        image: {
            jobId: uuid(),
        },
        size: {
            width: 0,
            height: 0,
        },
        location: {
            type: "Point",
            coordinates: [0, 0],
        },
    }),
    new Instant({
        username: res[1]._id,
        title: "title",
        image: {
            jobId: uuid(),
        },
        size: {
            width: 0,
            height: 0,
        },
        location: {
            type: "Point",
            coordinates: [0, 0],
        },
    }),
    new Instant({
        username: res[1]._id,
        title: "title",
        image: {
            jobId: uuid(),
        },
        size: {
            width: 0,
            height: 0,
        },
        location: {
            type: "Point",
            coordinates: [0, 0],
        },
    }),
];
