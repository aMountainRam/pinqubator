"use strict";
import log4js from "log4js";
import sizeOf from "image-size";
import { v4 as uuidv4 } from "uuid";
import broker from "../service/broker.service.js";
import {
    handleInternal,
    malformedError,
    serialize,
} from "../utils/messages.utils.js";
import { StatusCodes } from "http-status-codes";
import { User } from "../model/user.model.js";
import { Instant } from "../model/instant.model.js";

const log = log4js.getLogger("default");
/**
 * Sets coordinates inside `obj`
 * @param {*} obj
 * @param {*} coordinates
 */
const setLocation = (obj, { lat, long }) => {
    let location = {
        type: "Point",
        coordinates: [Number.parseFloat(lat), Number.parseFloat(long)],
    };
    delete obj.lat;
    delete obj.long;
    obj.location = location;
};

/**
 * Retuns a promise after sending request
 * to the broker to queue a resize job
 * @param {*} id
 * @param {*} buffer
 * @returns {Promise<any>}
 */
const sendToQueue = (jobId, buffer) =>
    broker.connection.sendToQueue(serialize({ jobId, buffer }));

/**
 * Sets image properties onto `obj` where
 * the image is given into `files` with a given
 * buffer. On return such buffer is sent via `sent`
 * to a broker for a resize job.
 *
 * Resize job is triggered only when either image dimension
 * is larger than 140 pixels.
 *
 * @param {*} obj
 * @param {*} file
 * @param {*} send
 * @returns {Promise<any>}
 */
const setSize = (obj, file, send) => {
    const size = sizeOf(file.buffer);
    const uuid = uuidv4();
    obj.image = file;
    obj.image.jobId = uuid;

    if (size.width <= 140 && size.height <= 140) {
        obj.size = size;
        return Promise.resolve();
    } else {
        let buffer = obj.image.buffer;
        delete obj.image.buffer;
        return send(uuid, buffer);
    }
};

/**
 * Create an instant. The request must contain:
 *  1. a username `username`
 *  2. a file with an image `image`
 *  3. a title `title`
 *  4. a latitude `lat`
 *  5. a longitude `long`
 *
 * In case of successful request, the image buffer is
 * sent to an asynchronous job to be rescaled
 * in order to fit 140x140 pixels if needed.
 *
 * Meanwhile instant is saved and later the scheduled
 * job will update its content
 *
 * @param {*} req
 * @param {*} res
 * @returns {Promise<any>}
 */
const create = async (req, res) => {
    if (req.body && req.files && req.files.length === 1) {
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

            // compute image size
            return await setSize(instaObj, req.files[0], sendToQueue)
                .then(() => {
                    // handle geolocation
                    setLocation(instaObj, req.body);
                    let instant = new Instant(instaObj);
                    return instant
                        .save(instant)
                        .then((i) => {
                            res.status(StatusCodes.OK).send();
                            return i;
                        })
                        .catch((err) => {
                            handleInternal(err, res, log);
                            throw new Error(err);
                        });
                })
                .catch((err) => {
                    throw new Error(err);
                });
        } catch (err) {
            handleInternal(err, res, log);
            return Promise.reject();
        }
    } else {
        res.status(StatusCodes.BAD_REQUEST).send(
            malformedError("username is required")
        );
        return Promise.reject();
    }
};

/**
 * Returns all instants uploaded by a given user
 * @param {*} req
 * @param {*} res
 * @returns {Promise<any>}
 */
const findByUsername = (req, res) => {
    if (req.params && req.params.username) {
        let username = req.params.username;
        return User.findOne({ username: username })
            .then((u) => {
                if (u && (u.hasOwnProperty("_id") || u._id)) {
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
            .catch((err) => handleInternal(err, res, log));
    } else {
        res.status(StatusCodes.BAD_REQUEST).send(
            malformedError("username is required")
        );
        return Promise.reject();
    }
};

/**
 * Returns all instants currently available on the
 * database
 * @param {*} _
 * @param {*} res
 * @returns {Promise<any>}
 */
const findAll = (_, res) =>
    Instant.find({})
        .sort({ createdAt: "desc" })
        .then((data) => {
            res.status(StatusCodes.OK).send(data);
            return data;
        })
        .catch((err) => handleInternal(err, res, log));

export const instantController = { create, findAll, findByUsername };
