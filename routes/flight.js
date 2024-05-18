const express = require("express");

const router = express.Router();

const {
    getAllFlight,
    getFlightById,
    createFlight,
    removeFlight,
    updateFlight
} = require('../controllers/flight');

router.route("/")
    .get(getAllFlight)
    .post(createFlight);

router.route("/:id")
    .get(getFlightById)
    .put(updateFlight)
    .delete(removeFlight);
    
module.exports = router