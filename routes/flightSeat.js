const router = require("express").Router();
const validator = require("../lib/validator");

const {
    getAllSeats,
    getSeatsByFlightId,
    createSeat,
    updateSeat,
    deleteSeat,
} = require("../controllers/flightSeat");
const {
    createSeatSchema,
    updateSeatSchema,
} = require("../utils/joiValidation");

router
    .route("/")
    .get(getAllSeats)
    .post(validator(createSeatSchema), createSeat);

router.route("/:flightId").get(getSeatsByFlightId);

router
    .route("/:id")
    .put(validator(updateSeatSchema), updateSeat)
    .delete(deleteSeat);

module.exports = router;
