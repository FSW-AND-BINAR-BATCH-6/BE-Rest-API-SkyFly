const router = require("express").Router();
const authentication = require("../middlewares/authentication");
const checkRole = require("../middlewares/checkrole");

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

router.route("/")
    .get(getAllFlight)
    .post(
        authentication,
        checkRole(["ADMIN"]),
        validator(createFlightSchema),
        createFlight
    );

router.route("/favorite-destination")
    .get(getFavoriteDestinations);

router.route("/:id")
    .get(getFlightById)
    .put(
        authentication,
        checkRole(["ADMIN"]),
        validator(updateFlightSchema),
        updateFlight
    )
    .delete(
        authentication,
        checkRole(["ADMIN"]),
        removeFlight
    );

module.exports = router;
