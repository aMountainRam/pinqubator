import db from "../model/db.model.js";
import log from "../conf/log.conf.js";
import sizeOf from "image-size";
const Instant = db.instant;

const create = async (req, res) => {
    if (!req || !req.files || req.files.length !== 1 || !req.body) {
        res.status(400).send("Malformed request");
    } else {
        let instaObj = req.body;
        try {
            await db.user
                .create({ username: instaObj.username })
                .then((data) => {
                    instaObj.username = data._id;
                })
                .catch((_) =>
                    db.user
                        .findOne({ username: instaObj.username })
                        .then((data) => (instaObj.username = data._id))
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
                delete instaObj.image.buffer;
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

const findAll = (req, res) => {
    log.info(`GET ${req.body}`);
    res.status(200).send();
};

export const instantController = { create, findAll };
