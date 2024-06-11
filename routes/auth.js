const router = require("express").Router();
const {
    handleRegister,
    handleLogin,
    verifyOTP,
    resendOTP,
    sendResetPassword,
    resetPassword,
    handleLoginGoogle,
    redirectAuthorization,
    getUserLoggedIn,
    sendOTPSMS,
    updateUserLoggedIn,
} = require("../controllers/auth");
const authentication = require("../middlewares/authentication");
const validator = require("../lib/validator");
const {
    RegisterSchema,
    LoginSchema,
    OTPSchema,
    PasswordSchema,
    forgetPasswordSchema,
    updateUserLoginSchema,
} = require("../utils/joiValidation");

router.post("/register", validator(RegisterSchema), handleRegister);
router.post("/login", validator(LoginSchema), handleLogin);

router.get("/google", redirectAuthorization);
router.get("/google/callback", handleLoginGoogle);

router.put("/verified", validator(OTPSchema), verifyOTP);
router.post("/verified/resend-otp", resendOTP);
router.post("/verified/resendSMS-otp", sendOTPSMS);

router.post(
    "/forgetPassword",
    validator(forgetPasswordSchema),
    sendResetPassword
);

router.put("/resetPassword", validator(PasswordSchema), resetPassword);

// loggedIn action
router.get("/me", authentication, getUserLoggedIn);
router.patch(
    "/me",
    authentication,
    validator(updateUserLoginSchema),
    updateUserLoggedIn
);

module.exports = router;
