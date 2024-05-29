const router = require("express").Router();
const swaggerUI = require("swagger-ui-express");
const swaggerDocument = require("../docs/swagger.json");

const airplane = require("./airline");
const auth = require("./auth");
const user = require("./user");
const transactionRoute = require("./transaction");
const flight = require("./flight");
const airport = require("./airports");
const flightSeat = require("./flightSeat");
const ticket = require("./ticket");

router.get("/documentation.json", (req, res) => res.send(swaggerDocument));
router.use(
    "/api-docs",
    swaggerUI.serve,
    swaggerUI.setup(swaggerDocument, {
        customCssUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css",
        customJs: [
            "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js",
            "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js",
        ],
    })
);

router.get("/api/v1", (req, res, next) => {
    res.status(200).json({
        status: true,
        message: "Welcome to API skyfly",
    });
});

router.use("/api/v1/airplane", airplane);
router.use("/api/v1/user", user);
router.use("/api/v1/transactions", transactionRoute);
router.use("/api/v1/airport", airport);
router.use("/api/v1/flight", flight);
router.use("/api/v1/auth", auth);
router.use("/api/v1/flightSeat", flightSeat);
router.use("/api/v1/ticket", ticket);

module.exports = router;
