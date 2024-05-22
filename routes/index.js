const router = require("express").Router();
const swaggerUI = require("swagger-ui-express")
const swaggerDocument = require("../docs/swagger.json")

router.use("/api-docs", swaggerUI.serve)
router.use("/api-docs", swaggerUI.setup(swaggerDocument))

app.use(
	'/documentation',
	swaggerUI.serve,
	swaggerUI.setup(swaggerDocument, {
		customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
		customJs: ['https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js', 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js'],
	})
);

const airplane = require('./airplane');
const user = require('./user')

router.get('/api/v1', (req, res, next) => {
	res.status(200).json({
		status: true,
		message: 'Welcome to API skyfly',
	});
});
const auth = require("./auth")

router.use('/api/v1/airplane', airplane);
router.use("/api/v1/auth", auth);
router.use("/api/v1/user",user);

module.exports = router;
