const express = require("express");
const multer = require("multer");

const router = express.Router();
const validator = require("../lib/validator")

const {
    createNewAirport,
    updateAirport,
    getAllAirports,
    deleteAirport,
    getAirportById
} = require("../controllers/airport")

const {
    createAirportSchema,
    updateAirportSchema
} = require("../utils/joiValidation")

router.get("/", getAllAirports);
router.get("/:id", getAirportById);
router.post("/", validator(createAirportSchema), createNewAirport)
router.put("/:id", validator(updateAirportSchema), updateAirport);
router.delete("/:id", deleteAirport)

module.exports = router;
