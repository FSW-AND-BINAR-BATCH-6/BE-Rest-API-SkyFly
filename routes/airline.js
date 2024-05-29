const express = require("express");
const multer = require("multer");

const router = express.Router();
const validator = require("../lib/validator")

const {
  createNewAirline,
    updateAirline,
    getAllAirline,
    deleteAirline,
    getAirlineById
} = require("../controllers/airline");

const {
  createAirplaneSchema,
  updateAirplaneSchema
} = require("../utils/airplanJoi")

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/", getAllAirline);
router.get("/:id", getAirlineById);
router.post("/", upload.single("image"), validator(createAirplaneSchema), createNewAirline);
router.put("/:id", upload.single("image"), validator(updateAirplaneSchema), updateAirline);
router.delete("/:id", deleteAirline);

module.exports = router;
