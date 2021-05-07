"use strict";
import fs from "fs";
import https from "https";
import express from "express";

const PORT = 8443;
const app = express();
app.get("/api", (req, res) => {
    res.send("Welcome");
});
https
    .createServer(
        {
            key: fs.readFileSync("ssl/backend.pinqubator.com.key"),
            cert: fs.readFileSync("ssl/backend.pinqubator.com.crt"),
            passphrase: fs.readFileSync("ssl/ssl_passwords.txt").toString(),
        },
        app
    )
    .listen(PORT, () => {
        console.log(`Running on port ${PORT}`);
    });
