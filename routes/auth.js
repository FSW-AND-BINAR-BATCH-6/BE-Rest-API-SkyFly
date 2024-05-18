const router = require("express").Router()
const {
    handleRegister,
    handleLogin
} = require("../controllers/auth")


router.post("/", handleRegister)
router.post("/login", handleLogin)

module.exports = router