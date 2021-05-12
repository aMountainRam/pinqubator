import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import { userController } from "../../../controller/user.controller.js";
import db from "../../../model/db.model.js";
import httpMocks from "node-mocks-http";
chai.use(chaiAsPromised);