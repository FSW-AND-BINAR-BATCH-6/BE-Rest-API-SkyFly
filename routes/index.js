const router = require("express").Router();

const airplane = require("./airplane");

router.use("/api/v1/airplane", airplane);

module.exports = router;
