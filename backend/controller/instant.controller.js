import db from "../model/db.model.js";
import log from "../conf/log.conf.js";
const Instant = db.instant;

const create = (req, res) => {
    if (req.body) {
        const instant = new Instant(req.body);
        instant.save(instant).then(() => res.status(200).send()).catch((err) => res.status(400).send(err));
    } else {
        res.status(400).send();
    }
    log.info(`POST ${req.body.thing}`);
};

const findAll = (req, res) => {
    log.info(`GET ${req.body}`);
    res.status(200).send();
};

export const instantController = { create, findAll };
