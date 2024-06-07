const router = require("express").Router();
const {
    bankTransfer,
    creditCard,
    gopay,
    getTransaction,
    updateTransaction,
    createTransaction,
    notification,
} = require("../controllers/transaction");

router.use((req, res, next) => {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept, Authorization"
    );
    next();
});

router.post("/payment", createTransaction);
router.post("/bank", bankTransfer);
router.post("/creditcard", creditCard);
router.post("/gopay", gopay);
router.get("/status/:orderId", getTransaction);
router.post("/notification", notification);
router.put("/status/:orderId", updateTransaction);

module.exports = router;
