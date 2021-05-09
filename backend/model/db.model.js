"use strict"
import mongoose from "mongoose";
import instant from "./instant.model.js";
import user from "./user.model.js";

const db = {
    connectionString: (context) => `mongodb://${context.host}:${context.port}/${context.name}`,
    connect: (context) => mongoose.connect(`mongodb://${context.host}:${context.port}/${context.name}`,context.options),
    mongoose,
    instant: instant(mongoose),
    user: user(mongoose),
}

export default db;