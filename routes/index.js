const router = require("express").Router();

const airplane = require("./airplane");
const ticket = require("./ticket");

router.get("/api/v1", (req, res, next) => {
    res.status(200).json({
        status: true,
        message: "Welcome to API skyfly",
    });
});
const auth = require("./auth");

router.use("/api/v1/airplane", airplane);
router.use("/api/v1/ticket", ticket);
router.use("/api/v1/auth", auth);

module.exports = router;
