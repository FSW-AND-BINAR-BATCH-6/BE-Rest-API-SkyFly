const express = require("express");
const router = express.Router();
const FlightController = require("../controllers/flight");

router.get("/:flightId", FlightController.getFlightById);
router.post("/", FlightController.createFlight);

module.exports = router;
