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
    getTransactionById,
    deleteTransaction,
    deleteTransactionDetail,
} = require("../controllers/transaction");

const authentication = require("../middlewares/authentication");

router.use((req, res, next) => {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept, Authorization"
    );
    next();
});

const validator = require("../lib/validator");
const {
    BankSchema,
    CCSchema,
    GopaySchema,
    SnapSchema,
} = require("../utils/joiValidation");

router.post(
    "/payment",
    authentication,
    validator(SnapSchema),
    createTransaction
);
router.post("/bank", authentication, validator(BankSchema), bankTransfer);
router.post("/creditcard", authentication, validator(CCSchema), creditCard);
router.post("/gopay", authentication, validator(GopaySchema), gopay);
router.get("/status/:orderId", authentication, getTransaction);
router.post("/notification", notification);
router.put("/status/:orderId", authentication, updateTransaction);

router.post("/create", createTransaction)

// dashboard action
router.get("/", getAllTransaction);
router.get("/:id", getTransactionById)
router.put("/:id", updateTransaction)
router.delete("/:id", deleteTransaction)
router.delete("/transactionDetail/:id", deleteTransactionDetail)

module.exports = router;
