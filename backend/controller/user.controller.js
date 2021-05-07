"use strict"
import db from "../model/db.model.js";
import log from "../conf/log.conf.js";
const User = db.user;

const create = (req, res) => {
    if (req.body) {
        const user = new User(req.body);
        user.save(user).then(() => res.status(200).send()).catch((err) => res.status(400).send(err));
    } else {
        res.status(400).send();
    }
    log.info(`POST ${req.body.thing}`);
};

const findAll = (_, res) => {
    User.find({}).then(data => {
        if(!data) {
            res.status(404).send({message: "No user found"});
        } else {
            res.status(200).send(data);
        }
    }).catch(err => res.status(500).send(err))
};

export const userController = { create, findAll };