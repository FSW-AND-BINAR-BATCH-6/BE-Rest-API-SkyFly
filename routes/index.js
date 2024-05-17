const router = require("express").Router();

const airplane = require("./airplane");
const flight = require("./flight");

router.use("/api/v1/airplane", airplane);
router.use("/api/v1/flight", flight);

module.exports = router;
