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
    .get(authentication, checkRole(["ADMIN"]), userController.getAllUsers,)
    .post(authentication, checkRole(["ADMIN"]), validator(userCreateSchema), userController.createUser);
router
    .route("/:id")
    .get(authentication, checkRole(["ADMIN"]), userController.getUserById)
    .put(authentication, checkRole(["ADMIN"]), validator(userUpdateSchema), userController.updateUser)
    .delete(authentication, checkRole(["ADMIN"]), userController.deleteUser);

module.exports = router;
