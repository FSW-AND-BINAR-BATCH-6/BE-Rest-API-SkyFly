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
    redirectAuthorization,
    getUsers,
    getUserLoggedIn,
} = require("../controllers/auth");

const {
    RegisterSchema,
    LoginSchema,
    OTPSchema,
    PasswordSchema,
    forgetPasswordSchema,
} = require("../utils/joiValidation");
const authentication = require("../middlewares/authentication");

router.post("/register", validator(RegisterSchema), handleRegister);
router.post("/login", validator(LoginSchema), handleLogin);

router.get("/google", redirectAuthorization);
router.get("/google/callback", handleLoginGoogle);

router.put("/verified", validator(OTPSchema), verifyOTP);
router.post("/verified/resend-otp", resendOTP);

router.post(
    "/forgetPassword",
    validator(forgetPasswordSchema),
    sendResetPassword
);

router.put("/resetPassword", validator(PasswordSchema), resetPassword);

// dummy route to check all user account

router.get("/", getUsers);
router.get("/me", authentication, getUserLoggedIn);

module.exports = router;
