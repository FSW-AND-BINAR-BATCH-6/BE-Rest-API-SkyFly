const router = require("express").Router();
const validator = require("../lib/validator");
const multer = require("multer");
const authentication = require("../middlewares/authentication");
const checkRole = require("../middlewares/checkrole");


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
    .post(authentication, checkRole(["ADMIN"]), upload.none(), validator(createAirportSchema), createNewAirport);
router
    .route("/:id")
    .get(getAirportById)
    .put(authentication, checkRole(["ADMIN"]), upload.none(), validator(updateAirportSchema), updateAirport)
    .delete(authentication, checkRole(["ADMIN"]), deleteAirport);

module.exports = router;
