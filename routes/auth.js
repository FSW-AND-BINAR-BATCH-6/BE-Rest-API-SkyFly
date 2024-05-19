const router = require("express").Router();
const validator = require("../lib/validator");

const {
    handleRegister,
    handleLogin,
    verifyOTP,
    resendOTP,
    sendResetPassword,
    resetPassword,
    handleLoginGoogle,
    redirectAuthorization
} = require("../controllers/auth");

const {
    RegisterSchema,
    LoginSchema,
    OTPSchema,
    PasswordSchema,
} = require("../utils/joiValidation");


router.post("/register", validator(RegisterSchema), handleRegister);
router.post("/login", validator(LoginSchema), handleLogin);

router.get("/google", redirectAuthorization)
router.get("/google/callback", handleLoginGoogle)

router.put("/verified", validator(OTPSchema), verifyOTP);
router.post("/verified/resend-otp", resendOTP);

router.post("/forgetPassword", sendResetPassword);

router.put("/resetPassword", validator(PasswordSchema), resetPassword);

module.exports = router;
