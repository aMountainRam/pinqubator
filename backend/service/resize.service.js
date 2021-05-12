import sharp from "sharp";
import sizeOf from "image-size";

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
 * @param {*} log
 * @param {*} msg
 * @param {*} opts
 * @returns {Promise<Buffer>}
 */
export const resize = async (
    db,
    log,
    msg,
    opts = {
        width: WIDTH,
        height: HEIGHT,
        fit: sharp.fit.inside,
    }
) => {
    return await sharp(Buffer.from(msg.buffer.data))
        .resize(opts)
        .jpeg({ mozjpeg: true })
        .toBuffer()
        .then((buffer) => {
            try {
                const size = sizeOf(buffer);
                db.instant
                    .findOneAndUpdate(
                        { "image.jobId": msg.jobId },
                        { "image.buffer": buffer, size: size }
                    )
                    .catch((err) => log.error(err));
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
};
