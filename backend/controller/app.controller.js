"use strict";
import log from "../conf/log.conf.js";
import { instantController } from "./instant.controller.js";
import { userController } from "./user.controller.js";
function router(app) {
    try {
        app.route("/instants/")
            .get(instantController.findAll)
            .post(instantController.create);
        app.route("/instants/:username").get(instantController.findByUsername);
        app.route("/users/")
            .get(userController.findAll)
            .post(userController.create);
        app.route("/users/:username").get(userController.find);
    } catch (err) {
        log.error(err);
    }
}

export default (app) => router(app);
