const router = require("express").Router();
const multer = require("multer");
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

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router
    .route("/")
    .get(getAllAirline)
    .post(
        authentication,
        checkRole(["ADMIN"]),
        upload.single("image"),
        validator(createAirlineSchema),
        createNewAirline
    );
router
    .route("/:id")
    .get(getAirlineById)
    .put(
        authentication,
        checkRole(["ADMIN"]),
        upload.single("image"),
        validator(updateAirlineSchema),
        updateAirline
    )
    .delete(authentication, checkRole(["ADMIN"]), deleteAirline);

module.exports = router;
