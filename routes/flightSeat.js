const router = require("express").Router();
const validator = require("../lib/validator");
const authentication = require("../middlewares/authentication");
const checkRole = require("../middlewares/checkrole");

const {
    getAllSeats,
    getSeatsByFlightId,
    createSeat,
    updateSeat,
    deleteSeat,
} = require("../controllers/flightSeat");
const {
    createSeatSchema,
    updateSeatSchema,
} = require("../utils/joiValidation");

router
    .route("/")
    .get(getAllSeats)
    .post(
        authentication,
        checkRole(["ADMIN"]),
        validator(createSeatSchema),
        createSeat
    );

router.route("/flight/:flightId").get(getSeatsByFlightId);

router
    .route("/:id")
    .put(
        authentication,
        checkRole(["ADMIN"]),
        validator(updateSeatSchema),
        updateSeat
    )
    .delete(authentication, checkRole(["ADMIN"]), deleteSeat);

module.exports = router;
