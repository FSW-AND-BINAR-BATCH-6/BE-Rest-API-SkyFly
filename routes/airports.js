const router = require("express").Router();
const validator = require("../lib/validator");
const authentication = require("../middlewares/authentication");
const multer = require("multer");
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

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router
    .route("/")
    .get(getAllAirports)
    .post(
        authentication,
        checkRole(["ADMIN"]),
        upload.single("image"),
        validator(createAirportSchema),
        createNewAirport
    );
router
    .route("/:id")
    .get(getAirportById)
    .put(
        authentication,
        checkRole(["ADMIN"]),
        upload.single("image"),
        validator(updateAirportSchema),
        updateAirport
    )
    .delete(authentication, checkRole(["ADMIN"]), deleteAirport);

module.exports = router;
