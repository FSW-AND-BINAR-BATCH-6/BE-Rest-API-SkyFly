const router = require("express").Router();
const {
    bankTransfer,
    creditCard,
    gopay,
    getTransaction,
    updateTransaction,
} = require("../controllers/transaction");

router.use((req, res, next) => {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept, Authorization"
    );
    next();
});

router.get("/status/:orderId", getTransaction);
router.post("/bank", bankTransfer);
router.post("/creditcard", creditCard);
router.post("/gopay", gopay);
router.put("/status/:orderId", updateTransaction);

module.exports = router;
