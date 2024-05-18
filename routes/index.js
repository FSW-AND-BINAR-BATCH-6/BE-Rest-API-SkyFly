const router = require("express").Router();

const airplane = require("./airplane");
const auth = require("./auth")

router.use("/api/v1/airplane", airplane);
router.use("/api/v1/auth", auth);

module.exports = router;
