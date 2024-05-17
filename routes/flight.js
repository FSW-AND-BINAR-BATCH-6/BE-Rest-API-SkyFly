const express = require("express");

const router = express.Router();

const {
    getAllFlight,
    getFlightById,
    createFlight,
} = require('../controllers/flight');

router.get("/", getAllFlight);
router.get("/:id", getFlightById)
router.post("/", createFlight)

module.exports = router