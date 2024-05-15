const express = require("express");
const multer = require("multer");

const router = express.Router();

const {
  getAllAirplane,
  getAirplaneById,
  createAirplane,
  updateAirplane,
  deleteAirplane,
} = require("../controllers/airplane");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/", getAllAirplane);
router.get("/:id", getAirplaneById);
router.post("/create", upload.single("image"), createAirplane);
router.put("/update/:id", upload.single("image"), updateAirplane);
router.delete("/delete/:id", deleteAirplane);

module.exports = router;
