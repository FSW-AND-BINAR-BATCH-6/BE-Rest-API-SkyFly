const router = require("express").Router();

const airplane = require("./airplane");
const ticket = require("./ticket");

router.use("/api/v1/airplane", airplane);
router.use("/api/v1/ticket", ticket);

module.exports = router;
