const express = require("express");
const validator = require("../lib/validator");

const router = express.Router();

const {
    getAllFlight,
    getFlightById,
    createFlight,
    removeFlight,
    updateFlight
} = require('../controllers/flight');

const { createFlightSchema, updateFlightSchema } = require('../utils/joiValidation');

router.route("/")
    .get(getAllFlight)
    .post(validator(createFlightSchema), createFlight);

router.route("/:id")
    .get(getFlightById)
    .put(validator(updateFlightSchema), updateFlight)
    .delete(removeFlight);

module.exports = router