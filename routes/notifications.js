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

router
    .route("/")
    .get(authentication, getNotifications)
    .post(authentication, createNewNotifications);
router
    .route("/:id")
    .get(authentication, getNotificationsById)
    .delete(authentication, deleteNotifications)
    .put(authentication, updateNotifications)

module.exports = router;
