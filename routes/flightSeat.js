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

const {
    createFlightSeatSchema,
    updateFlightSeatSchema,
} = require("../utils/joiValidation");

router
    .route("/")
    .get(getAllFlightSeats)
    .post(validator(createFlightSeatSchema), createFlightSeat);

router.route("/available/:flightId").get(getAvailableFlightSeats);

router
    .route("/:id")
    .get(getFlightSeatById)
    .put(validator(updateFlightSeatSchema), updateFlightSeat)
    .delete(deleteFlightSeat);

router.route("/book/:id").put(bookFlightSeat);

module.exports = router;
