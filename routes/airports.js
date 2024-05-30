const router = require("express").Router();
const validator = require("../lib/validator");
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
    .post(validator(createAirportSchema), createNewAirport);
router
    .route("/:id")
    .get(getAirportById)
    .put(validator(updateAirportSchema), updateAirport)
    .delete(deleteAirport);

module.exports = router;
