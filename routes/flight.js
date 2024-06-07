const router = require("express").Router();
const {
    getAllFlight,
    getFlightById,
    createFlight,
    removeFlight,
    updateFlight,
    getFavoriteDestinations,
} = require("../controllers/flight");
const validator = require("../lib/validator");
const {
    createFlightSchema,
    updateFlightSchema,
} = require("../utils/joiValidation");

router
    .route("/")
    .get(getAllFlight)
    .post(validator(createFlightSchema), createFlight);
router
    .route("/:id")
    .get(getFlightById)
    .put(validator(updateFlightSchema), updateFlight)
    .delete(removeFlight);
router
    .route("/favorite-destination")
    .get(getFavoriteDestinations);

module.exports = router;
