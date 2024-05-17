const express = require("express");
const router = express.Router();
const FlightSeatController = require("../controllers/flightSeat");

router.post("/", FlightSeatController.createFlightSeat);
router.get("/:flightId/available", FlightSeatController.getAvailableSeats);
router.put("/book/:seatId", FlightSeatController.bookSeat);
router.put("/occupy/:seatId", FlightSeatController.occupySeat);

module.exports = router;
