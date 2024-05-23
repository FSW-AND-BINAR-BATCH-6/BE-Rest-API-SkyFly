const express = require("express");
const multer = require("multer");

const router = express.Router();
const validator = require("../lib/validator")

const {
  createNewAirplane,
  updateAirplane,
  getAllAirplane,
  deleteAirplane,
  getAirplaneById
} = require("../controllers/airplane");

const {
  createAirplaneSchema,
  updateAirplaneSchema
} = require("../utils/airplanJoi")

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/", getAllAirplane);
router.get("/:id", getAirplaneById);
router.post("/", upload.single("image"), validator(createAirplaneSchema), createNewAirplane);
router.put("/:id", upload.single("image"), validator(updateAirplaneSchema), updateAirplane);
router.delete("/:id", deleteAirplane);

module.exports = router;
