const validator = require("../lib/validator");

const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const {
    userCreateSchema,
    userUpdateSchema,
} = require("../utils/joiValidation");

router
    .route("/")
    .get(userController.getAllUsers)
    .post(validator(userCreateSchema), userController.createUser);
router
    .route("/:id")
    .get(userController.getUserById)
    .put(validator(userUpdateSchema), userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
