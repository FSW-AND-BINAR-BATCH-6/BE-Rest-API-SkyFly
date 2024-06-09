const router = require("express").Router();

const {
    bankTransfer,
    creditCard,
    gopay,
    getTransaction,
    updateTransaction,
    createTransaction,
    notification,
    getAllTransaction,
} = require("../controllers/transaction");
const authentication = require("../middlewares/authentication");

router.use((req, res, next) => {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept, Authorization"
    );
    next();
});

router.post("/payment", authentication, createTransaction);
router.post("/bank", authentication, bankTransfer);
router.post("/creditcard", authentication, creditCard);
router.post("/gopay", authentication, gopay);
router.get("/status/:orderId", authentication, getTransaction);
router.post("/notification", notification);
router.put("/status/:orderId", authentication, updateTransaction);

// dashboard action
router.get("/", getAllTransaction);

module.exports = router;
