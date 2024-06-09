const createHttpError = require("http-errors");

module.exports = (allowedRoles) => {
    return async (req, res, next) => {
        let role = req.user !== undefined ? req.uesr.role : "BUYER";
        try {
            const user = req.user;
            if (!user)
                return next(createHttpError(401, { message: "Unauthorized" }));
            if (!allowedRoles.includes(role)) {
                next(
                    createHttpError(403, {
                        message: "Your role does not have access permissions",
                    })
                );
            }
            next();
        } catch (error) {
            next(createHttpError(500, { message: error.message }));
        }
    };
};
