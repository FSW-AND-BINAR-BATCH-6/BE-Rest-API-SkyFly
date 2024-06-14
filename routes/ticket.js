const router = require("express").Router();
const authentication = require("../middlewares/authentication");
const checkRole = require("../middlewares/checkrole");

const {
    getAllTicket,
    getTicketById,
    createTicket,
    updateTicket,
    deleteTicket,
    generateTicket,
} = require("../controllers/ticket");
const validator = require("../lib/validator");
const { TicketSchema, UpdateTicketSchema } = require("../utils/joiValidation");

router.get("/generate", authentication, generateTicket);

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
