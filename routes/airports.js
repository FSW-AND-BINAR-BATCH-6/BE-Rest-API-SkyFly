const router = require("express").Router();
const validator = require("../lib/validator");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const {
    createNewAirport,
    updateAirport,
    getAllAirports,
    deleteAirport,
    getAirportById,
} = require("../controllers/airport");
const {
    createAirportSchema,
    updateAirportSchema,
} = require("../utils/joiValidation");

router
    .route("/")
    .get(getAllAirports)
    .post(upload.none(), validator(createAirportSchema), createNewAirport);
router
    .route("/:id")
    .get(getAirportById)
    .put(upload.none(), validator(updateAirportSchema), updateAirport)
    .delete(deleteAirport);

module.exports = router;
