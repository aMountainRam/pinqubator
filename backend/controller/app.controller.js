"use strict";
import { instantController } from "./instant.controller.js";
import { userController } from "./user.controller.js";
function router(app) {
    app.route("/instants/")
        .get(instantController.findAll)
        .post(instantController.create);
    app.route("/instants/:username")
        .get(instantController.findByUsername);
    app.route("/users/")
        .get(userController.findAll)
        .post(userController.create);
}

export default (app) => router(app);
