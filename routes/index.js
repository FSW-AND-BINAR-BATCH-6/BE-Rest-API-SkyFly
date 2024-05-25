const router = require('express').Router();

const airplane = require('./airline');

router.get('/api/v1', (req, res, next) => {
	res.status(200).json({
		status: true,
		message: 'Welcome to API skyfly',
	});
});
const auth = require("./auth")
const airport = require('./airports')

router.use('/api/v1/airplane', airplane);
router.use("/api/v1/auth", auth);
router.use("/api/v1/airport", airport);

module.exports = router;
