const router = require("express").Router();
const swaggerUI = require("swagger-ui-express")
const swaggerDocument = require("../docs/swagger.json")

router.use("/api-docs", swaggerUI.serve)
router.use("/api-docs", swaggerUI.setup(swaggerDocument))

const airplane = require("./airplane");

router.use("/api/v1/airplane", airplane);

module.exports = router;
