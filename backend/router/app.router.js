"use strict";
import { Router } from "express";
import { instantController } from "../controller/instant.controller.js";
import { resizeController } from "../controller/resize.controller.js";
import { userController } from "../controller/user.controller.js";

const router = new Router();
router.get("/instants",instantController.findAll)
router.post("/instants",instantController.create);
router.get("/instants/:username",instantController.findByUsername);
router.get("/users",userController.findAll)
router.post("/users",userController.create);
router.get("/users/:username",userController.find);
router.post("/resize",resizeController.resize);

export default router;
