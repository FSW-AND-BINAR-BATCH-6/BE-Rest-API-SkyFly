const express = require("express");
const validator = require("../lib/validator");
const router = express.Router();

const {
    getAllFlightSeats,
    getAvailableFlightSeats,
    getFlightSeatById,
    createFlightSeat,
    updateFlightSeat,
    deleteFlightSeat,
    bookFlightSeat,
} = require("../controllers/flightSeat");

const { createFlightSeatSchema } = require("../utils/joiValidation");

router
    .route("/")
    .get(getAllFlightSeats)
    .post(validator(createFlightSeatSchema), createFlightSeat);

router.route("/available/:flightId").get(getAvailableFlightSeats);

router
    .route("/:id")
    .get(getFlightSeatById)
    .put(updateFlightSeat)
    .delete(deleteFlightSeat);

router.route("/book/:id").post(bookFlightSeat);

module.exports = router;
