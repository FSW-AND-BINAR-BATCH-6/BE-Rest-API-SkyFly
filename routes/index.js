const express = require('express');
const router = express.Router();

const airplane = require('./airplane');
const user = require("./user");

router.get('/api/v1', (req, res, next) => {
	res.status(200).json({
		status: true,
		message: 'Welcome to API skyfly',
	});
});
const auth = require("./auth")

router.use('/api/v1/airplane', airplane);
router.use("/api/v1/auth", auth);
router.use("/api/v1/user", user);

module.exports = router;
