const express = require("express");
const multer = require("multer");

const router = express.Router();

// const airplaneController = require("../controllers/airplane")

const {
  getAllAirplane,
  getAirplaneById,
  createAirplane,
  updateAirplane,
  deleteAirplane,
} = require("../controllers/airplane");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



router.route("/")
  .get(getAllAirplane)
  .post(upload.single("image"), createAirplane);

router.route("/:id")
  .get(getAirplaneById)
  .put(upload.single("image"), updateAirplane)
  .delete(deleteAirplane);


module.exports = router;
