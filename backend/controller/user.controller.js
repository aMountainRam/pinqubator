"use strict";
import db from "../model/db.model.js";
import log from "../conf/log.conf.js";
import { handleInternal, malformedError } from "../utils/messages.utils.js";
import { StatusCodes } from "http-status-codes";

const User = db.user;

/**
 * Creates a new user if `username` field is not
 * a duplicate of an already existing user
 * @param {*} req
 * @param {*} res
 * @returns {Promise<any>}
 */
const create = async (req, res) => {
    if (req.body) {
        const user = new User(req.body);
        return await user
            .save(user)
            .then((u) => {
                res.status(200).send();
                return u;
            })
            .catch((err) => {
                handleInternal(err, res, log);
            });
    } else {
        res.status(StatusCodes.BAD_REQUEST).send(
            malformedError("username is required")
        );
        return await Promise.reject();
    }
};

/**
 * Returns all users currently available on the
 * database
 * @param {*} _
 * @param {*} res
 * @returns {Promise<any>}
 */
const findAll = async (_, res) => {
    return await User.find({})
        .then((data) => {
            res.status(200).send(data);
            return data;
        })
        .catch((err) => handleInternal(err, res, log));
};

/**
 * Returns a user if present according with a given `username`
 * @param {*} req
 * @param {*} res
 * @returns {Promise<any>}
 */
const find = async (req, res) => {
    if (req.params && req.params.username) {
        return await User.find({ username: req.params.username })
            .then((data) => {
                res.status(StatusCodes.OK).send(data);
                return data;
            })
            .catch((err) => handleInternal(err, res, log));
    } else {
        res.status(StatusCodes.BAD_REQUEST).send(
            malformedError("username is required")
        );
        return await Promise.reject();
    }
};

export const userController = { create, findAll, find };
