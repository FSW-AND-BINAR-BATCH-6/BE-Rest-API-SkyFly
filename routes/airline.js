const router = require("express").Router();
const authentication = require("../middlewares/authentication");
const checkRole = require("../middlewares/checkrole");

const {
    createNewAirline,
    updateAirline,
    getAllAirline,
    deleteAirline,
    getAirlineById,
} = require("../controllers/airline");
const validator = require("../lib/validator");
const {
    createAirlineSchema,
    updateAirlineSchema,
} = require("../utils/joiValidation");


router
    .route("/")
    .get(getAllAirline)
    .post(
        authentication,
        checkRole(["ADMIN"]),
        validator(createAirlineSchema),
        createNewAirline
    );
router
    .route("/:id")
    .get(getAirlineById)
    .put(
        authentication,
        checkRole(["ADMIN"]),
        validator(updateAirlineSchema),
        updateAirline
    )
    .delete(authentication, checkRole(["ADMIN"]), deleteAirline);

module.exports = router;
