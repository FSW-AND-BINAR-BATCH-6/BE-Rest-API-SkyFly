const router = require("express").Router();
const checkRole = require("../middlewares/checkrole");

const {
    createTicketTest,
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
    getAllTransactionByUserLoggedIn,
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
    updateTransactionSchema,
} = require("../utils/joiValidation");

router.post("/test", createTicketTest);
router.get("/status/:orderId", authentication, getTransaction);
router.get("/", authentication, getAllTransactionByUserLoggedIn);
router.post(
    "/payment",
    authentication,
    validator(SnapSchema),
    createTransaction
);
router.post("/bank", authentication, validator(BankSchema), bankTransfer);
router.post("/creditcard", authentication, validator(CCSchema), creditCard);
router.post("/gopay", authentication, validator(GopaySchema), gopay);
router.post("/notification", notification);
router.put("/status/:orderId", authentication, updateTransaction);

router.post("/create", createTransaction);

// dashboard action
router.get("/admin", authentication, checkRole(["ADMIN"]), getAllTransaction);
router.get("/:id", authentication, getTransactionById);
router.put(
    "/:id",
    authentication,
    checkRole(["ADMIN"]),
    validator(updateTransactionSchema),
    updateTransaction
);
router.delete("/:id", authentication, checkRole(["ADMIN"]), deleteTransaction);
router.delete(
    "/transactionDetail/:id",
    authentication,
    checkRole(["ADMIN"]),
    deleteTransactionDetail
);

module.exports = router;
