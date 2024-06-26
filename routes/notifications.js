const router = require("express").Router();
const {
    getNotifications,
    getNotificationsById,
    deleteNotifications,
    createNewNotifications,
    updateNotifications,
} = require("../controllers/notifications");
const authentication = require("../middlewares/authentication");
const checkRole = require("../middlewares/checkrole");

const validator = require("../lib/validator");
const {
    createNotificationsSchema,
    updateNotificationsSchema,
} = require("../utils/joiValidation");

router
    .route("/")
    .get(authentication, getNotifications)
    .post(
        authentication,
        checkRole(["ADMIN"]),
        validator(createNotificationsSchema),
        createNewNotifications
    );
router
    .route("/:id")
    .get(authentication, getNotificationsById)
    .delete(authentication, checkRole(["ADMIN"]), deleteNotifications)
    .put(
        authentication,
        checkRole(["ADMIN"]),
        validator(updateNotificationsSchema),
        updateNotifications
    );

module.exports = router;
