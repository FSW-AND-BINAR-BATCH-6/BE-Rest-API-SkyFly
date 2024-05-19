const express = require("express");

const router = express.Router();

const {
  getAllTicket,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
} = require("../controllers/ticket");

router.get("/", getAllTicket);
router.get("/:id", getTicketById);
router.post("/", createTicket);
router.put("/:id", updateTicket);
router.delete("/:id", deleteTicket);

module.exports = router;
