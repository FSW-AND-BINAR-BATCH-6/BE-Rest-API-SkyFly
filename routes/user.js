const validator = require("../lib/validator");
const checkRole = require("../middlewares/checkrole");

const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const authentication = require("../middlewares/authentication");

const {
    userCreateSchema,
    userUpdateSchema,
} = require("../utils/joiValidation");

router
    .route("/")
    .get(authentication, userController.getAllUsers, )
    .post(authentication, validator(userCreateSchema), userController.createUser);
router
    .route("/:id")
    .get(userController.getUserById)
    .put(authentication, validator(userUpdateSchema), userController.updateUser)
    .delete(authentication, checkRole(["ADMIN"]), userController.deleteUser);

module.exports = router;
