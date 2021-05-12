import { StatusCodes } from "http-status-codes";
export const malformedError = (msg) => {
    return { message: `Malformed request caused by: ${msg}.` };
};
export const internalServerError = () => {
    return { message: "Oops! An error occured." };
};
const mongoErrors = {
    11000: "duplicate key error",
};
export const handleInternal = (err, res, log) => {
    if (
        err &&
        err.name === "MongoError" &&
        Object.keys(mongoErrors).includes(err.code.toString())
    ) {
        res.status(StatusCodes.BAD_REQUEST).send(
            malformedError(mongoErrors[err.code])
        );
    } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(
            internalServerError()
        );
    }
    log.error(err);
};
