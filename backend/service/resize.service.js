import sharp from "sharp";
import sizeOf from "image-size";
import log4js from "log4js";
import { Instant } from "../model/instant.model.js";

const log = log4js.getLogger("default");

const WIDTH = 140;
const HEIGHT = 140;

/**
 * Resizes a given image stored in `msg`
 * to fit inside `WIDTH` and `HEIGHT`
 * defaulted to 140x140 pixels.
 *
 * Once done it uses `db` to update an instant
 *
 * @param {*} db
 * @param {*} msg
 * @param {*} opts
 * @returns {Promise<Buffer>}
 */
export const resize = (
    msg,
    opts = {
        width: WIDTH,
        height: HEIGHT,
        fit: sharp.fit.inside,
    }
) =>
    sharp(Buffer.from(msg.buffer.data))
        .resize(opts)
        .jpeg({ mozjpeg: true })
        .toBuffer()
        .then((buffer) => {
            try {
                const size = sizeOf(buffer);
                Instant.findOneAndUpdate(
                    { "image.jobId": msg.jobId },
                    { "image.buffer": buffer, size: size }
                ).catch((err) => log.error(err));
            } catch (err) {
                log.error(err);
                return Promise.reject(err);
            }
            return buffer;
        })
        .catch((err) => {
            log.error(err);
            return Promise.reject(err);
        });
