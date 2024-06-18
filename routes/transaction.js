const router = require("express").Router();
const checkRole = require("../middlewares/checkrole");

const {
    bankTransfer,
    creditCard,
    gopay,
    getTransaction,
    updateTransaction,
    notification,
    getAllTransaction,
    getTransactionById,
    deleteTransaction,
    deleteTransactionDetail,
    getAllTransactionByUserLoggedIn,
    snapPayment,
} = require("../controllers/transaction");

const authentication = require("../middlewares/authentication");

router.use((req, res, next) => {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept, Authorization"
    );
    next();
});

router.get("/status/:orderId", authentication, getTransaction);
router.get("/", authentication, getAllTransactionByUserLoggedIn);

// payment
router.post("/payment", authentication, snapPayment);
router.post("/bank", authentication, bankTransfer);
router.post("/creditcard", authentication, creditCard);
router.post("/gopay", authentication, gopay);
router.post("/notification", notification);

router.put("/status/:orderId", authentication, updateTransaction);

// dashboard action
router.get("/admin", authentication, checkRole(["ADMIN"]), getAllTransaction);
router.get("/:id", authentication, getTransactionById);
router.put("/:id", authentication, checkRole(["ADMIN"]), updateTransaction);
router.delete("/:id", authentication, checkRole(["ADMIN"]), deleteTransaction);
router.delete(
    "/transactionDetail/:id",
    authentication,
    checkRole(["ADMIN"]),
    deleteTransactionDetail
);

module.exports = router;
