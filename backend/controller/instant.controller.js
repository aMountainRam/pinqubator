import db from "../model/db.model.js";
import log from "../conf/log.conf.js";
import sizeOf from "image-size";
import { v4 as uuidv4 } from "uuid";
import { broker } from "../server.js";
import {
    handleInternal,
    internalServerError,
    malformedError,
} from "../utils/messages.utils.js";
import { StatusCodes } from "http-status-codes";
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

/**
 * Returns all instants uploaded by a given user
 * @param {*} req
 * @param {*} res
 * @returns {Promise<any>}
 */
const findByUsername = async (req, res) => {
    if (req.params && req.params.username) {
        let username = req.params.username;
        return await User.findOne({ username: username })
            .then((u) => {
                if (u && u._id) {
                    return Instant.find({ username: u._id })
                        .sort({ createdAt: "desc" })
                        .then((data) => {
                            res.status(StatusCodes.OK).send(data);
                            return data;
                        })
                        .catch((err) => {
                            throw new Error(err);
                        });
                } else {
                    let data = [];
                    res.status(StatusCodes.OK).send(data);
                    return Promise.resolve(data);
                }
            })
            .catch((err) => internalServerError(err, res, log));
    } else {
        res.status(StatusCodes.BAD_REQUEST).send(
            malformedError("username is required")
        );
        return await Promise.reject();
    }
};

/**
 * Returns all instants currently available on the
 * database
 * @param {*} _
 * @param {*} res
 * @returns {Promise<any>}
 */
const findAll = async (_, res) => {
    return await Instant.find({})
        .sort({ createdAt: "desc" })
        .then((data) => {
            res.status(StatusCodes.OK).send(data);
            return data;
        })
        .catch((err) => handleInternal(err, res, log));
};

export const instantController = { create, findAll, findByUsername };
