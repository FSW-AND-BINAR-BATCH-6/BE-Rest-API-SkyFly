const router = require("express").Router();
const {
    getAllTicket,
    getTicketById,
    createTicket,
    updateTicket,
    deleteTicket,
} = require("../controllers/ticket");
const validator = require("../lib/validator");
const { TicketSchema, UpdateTicketSchema } = require("../utils/joiValidation");

router.route("/").get(getAllTicket).post(validator(TicketSchema), createTicket);
router
    .route("/:id")
    .get(getTicketById)
    .put(validator(UpdateTicketSchema), updateTicket)
    .delete(deleteTicket);

module.exports = router;
