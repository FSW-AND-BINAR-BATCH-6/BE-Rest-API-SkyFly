const router = require("express").Router();

const airplane = require("./airplane");
const flightSeat = require("./flightSeat");
const flight = require("./flight");

router.use("/api/v1/airplane", airplane);
router.use("/api/v1/flightSeat", flightSeat);
router.use("/api/v1/flight", flight);

module.exports = router;
