const router = require("express").Router();
const { getNotifications } = require("../controllers/notifications");
const authentication = require("../middlewares/authentication");
const checkRole = require("../middlewares/checkrole");

router.route("/").get(authentication, getNotifications)

module.exports = router;