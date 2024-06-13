const router = require("express").Router();
const authentication = require("../middlewares/authentication");
const checkRole = require("../middlewares/checkrole");

const {
    generateTicket,
    getAllTicket,
    getTicketById,
    createTicket,
    updateTicket,
    deleteTicket,
} = require("../controllers/ticket");
const validator = require("../lib/validator");
const { TicketSchema, UpdateTicketSchema } = require("../utils/joiValidation");

router.route("/generate").get(authentication, generateTicket);

router
    .route("/")
    .get(getAllTicket)
    .post(authentication, validator(TicketSchema), createTicket);

router
    .route("/:id")
    .get(authentication, getTicketById)
    .put(authentication, validator(UpdateTicketSchema), updateTicket)
    .delete(authentication, checkRole(["ADMIN"]), deleteTicket);

module.exports = router;
