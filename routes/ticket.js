routes;

const express = require("express");
const validator = require("../lib/validator");

const router = express.Router();

const {
  getAllTicket,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
} = require("../controllers/ticket");

const {
  TicketSchema,
  UpdateTicketSchema,
} = require("../utils/ticketJoiValidation");

router.get("/", getAllTicket);
router.get("/:id", getTicketById);
router.post("/", validator(TicketSchema), createTicket);
router.put("/:id", validator(UpdateTicketSchema), updateTicket);
router.delete("/:id", deleteTicket);

module.exports = router;
