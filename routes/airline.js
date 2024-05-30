const router = require("express").Router();
const multer = require("multer");

const {
    createNewAirline,
    updateAirline,
    getAllAirline,
    deleteAirline,
    getAirlineById,
} = require("../controllers/airline");
const validator = require("../lib/validator");
const {
    createAirplaneSchema,
    updateAirplaneSchema,
} = require("../utils/joiValidation");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router
    .route("/")
    .get(getAllAirline)
    .post(
        upload.single("image"),
        validator(createAirplaneSchema),
        createNewAirline
    );
router
    .route("/:id")
    .get(getAirlineById)
    .put(upload.single("image"), validator(updateAirplaneSchema), updateAirline)
    .delete(deleteAirline);

module.exports = router;
