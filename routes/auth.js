const router = require("express").Router();
const validator = require("../lib/validator");

const {
    handleRegister,
    handleLogin,
    verifyOTP,
    resendOTP,
} = require("../controllers/auth");
const {
    RegisterSchema,
    LoginSchema,
    OTPSchema,
} = require("../utils/joiValidation");

router.post("/register", validator(RegisterSchema), handleRegister);
router.post("/login", validator(LoginSchema), handleLogin);
router.post("/verified", validator(OTPSchema), verifyOTP);
router.post("/verified/resend-otp", resendOTP);
// router.get('/verified', Validator(otpSchema), verifyOtp); // get otp verification page

module.exports = router;
