'use strict';
import express from "express";
const PORT = 8080;
const app = express();
app.get("/api",(req,res) => {
    res.send("Welcome");
});
app.listen(PORT,() => {
    console.log(`Running on port ${PORT}`);
});