const validator = require("../lib/validator");

const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const { userCreateSchema, userUpdateSchema } = require("../utils/joiValidation");

// Routes for user management
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.post("/", validator(userCreateSchema), userController.createUser);
router.put("/:id", validator(userUpdateSchema), userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
