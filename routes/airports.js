const router = require("express").Router();
const validator = require("../lib/validator");
const authentication = require("../middlewares/authentication");
const checkRole = require("../middlewares/checkrole");

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
    .post(
        authentication,
        checkRole(["ADMIN"]),
        validator(createAirportSchema),
        createNewAirport
    );
router
    .route("/:id")
    .get(getAirportById)
    .put(
        authentication,
        checkRole(["ADMIN"]),
        validator(updateAirportSchema),
        updateAirport
    )
    .delete(authentication, checkRole(["ADMIN"]), deleteAirport);

module.exports = router;
