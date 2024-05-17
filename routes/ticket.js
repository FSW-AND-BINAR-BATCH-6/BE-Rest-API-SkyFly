const express = require("express");
const router = express.Router();
const TicketController = require("../controllers/ticket");

router.post("/", TicketController.createTicket);
router.get("/:ticketId", TicketController.getTicketById);

module.exports = router;
