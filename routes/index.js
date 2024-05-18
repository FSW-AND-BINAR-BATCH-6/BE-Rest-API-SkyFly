const router = require('express').Router();

const airplane = require('./airplane');
const flight = require("./flight");

router.get('/api/v1', (req, res, next) => {
	res.status(200).json({
		status: true,
		message: 'Welcome to API skyfly',
	});
});


router.use('/api/v1/airplane', airplane);
router.use("/api/v1/flight", flight);

module.exports = router;
