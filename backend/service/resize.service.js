import sharp from "sharp";
import sizeOf from "image-size";

export const resize = (db, log, msg) => {
    log.info(msg.jobId);
    sharp(Buffer.from(msg.buffer.data))
        .resize({
            width: 140,
            height: 140,
            fit: sharp.fit.inside,
        })
        .jpeg({ mozjpeg: true })
        .toBuffer()
        .then((buffer) => {
            const size = sizeOf(buffer);
            db.instant.findOneAndUpdate(
                { "image.jobId": msg.jobId },
                { "image.buffer": buffer, "size": size }
            ).catch(err => log.error(err));
        })
        .catch((err) => log.error(err));
};
