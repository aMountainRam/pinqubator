import db from "../model/db.model.js";
import log from "../conf/log.conf.js";
import sizeOf from "image-size";
import { v4 as uuidv4 } from "uuid";
import { broker } from "../server.js";
const Instant = db.instant;
const User = db.user;

const create = async (req, res) => {
    if (!req || !req.files || req.files.length !== 1 || !req.body) {
        res.status(400).send("Malformed request");
    } else {
        let instaObj = req.body;
        try {
            await User.create({ username: instaObj.username })
                .then((data) => {
                    instaObj.username = data._id;
                })
                .catch((_) =>
                    User.findOne({ username: instaObj.username }).then(
                        (data) => (instaObj.username = data._id)
                    )
                );

            let location = {
                type: "Point",
                coordinates: [
                    Number.parseFloat(req.body.lat),
                    Number.parseFloat(req.body.long),
                ],
            };
            delete instaObj.lat;
            delete instaObj.long;
            instaObj.location = location;
            const size = sizeOf(req.files[0].buffer);
            if (size.width <= 140 && size.height <= 140) {
                instaObj.size = size;
                instaObj.image = req.files[0];
            } else {
                instaObj.image = req.files[0];
                instaObj.image.jobId = uuidv4();
                let buffer = instaObj.image.buffer;
                delete instaObj.image.buffer;
                broker.sendToQueue(
                    broker.openConnection(),
                    JSON.stringify({
                        jobId: instaObj.image.jobId,
                        buffer,
                    })
                );
                // here to schedule a job !!
            }
            const instant = new Instant(instaObj);
            instant
                .save(instant)
                .then(() => res.status(200).send())
                .catch(() => {
                    res.status(400).send("Malformed request");
                });
        } catch (_) {
            res.status(400).send("Malformed request");
        }
    }
};

const findByUsername = (req, res) => {
    if (!req.params || !req.params.username) {
        res.status(400).send("Malformed request");
    } else {
        let username = req.params.username;
        User.findOne({ username: username })
            .sort({ timestamp: "desc" })
            .then((u) =>
                Instant.find({ username: u._id })
                    .then((data) => {
                        res.status(200).send(data);
                    })
                    .catch((err) => {
                        log.error(err);
                        res.status(400).send();
                    })
            )
            .catch(() => {
                res.status(400).send(`Cannot find ${username}`);
                log.error(`From: ${req.url} - Cannot find ${username}`);
            });
    }
};

const findAll = (_, res) => {
    Instant.find({})
        .then((data) => {
            res.status(200).send(data);
        })
        .catch((err) => {
            log.error(err);
            res.status(400).send();
        });
};

export const instantController = { create, findAll, findByUsername };
