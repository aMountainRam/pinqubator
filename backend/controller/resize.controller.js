import log4js from "log4js";
import { StatusCodes } from "http-status-codes";
import sizeOf from "image-size";
import { resizeService } from "../service/resize.service.js";
import { handleInternal, malformedError } from "../utils/messages.utils.js";
const log = log4js.getLogger("default");

const resize = async (res, req) => {
    if (req.files && req.files.length === 1) {
        let file = req.files[0];
        const { width, height, type } = sizeOf(file);
        if (width > 140 || height > 140) {
            await resizeService({ buffer: { data: file } },(d)=>d).then(
                (buffer) => {
                    file = buffer;
                }
            ).catch(err => handleInternal(err,res,log));
        }
        type && typeof type === "string" && res.setHeader("Content-Type", type);
        res.status(StatusCodes.OK).send(file);
    } else {
        res.status(StatusCodes.BAD_REQUEST).send(
            malformedError("username is required")
        );
        return Promise.reject();
    }
};
export const resizeController = { resize };
