"use strict"
import mongoose from "mongoose";
import instant from "./instant.model.js";
import user from "./user.model.js";

const db = {
    mongoose,
    instant: instant(mongoose),
    user: user(mongoose),
}

export default db;