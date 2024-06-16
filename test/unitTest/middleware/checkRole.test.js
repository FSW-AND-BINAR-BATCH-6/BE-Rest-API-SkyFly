const createHttpError = require("http-errors");
const checkRole = require("../../../middlewares/checkrole");

describe("Role Middleware", () => {
    let req, res, next;

    beforeEach(() => {
        req = { user: undefined };
        res = {};
        next = jest.fn();
    });

    it("Success", async () => {
        req.user = {
            role: "ADMIN",
        };
        const mCheckRole = checkRole(["ADMIN"]);
        await mCheckRole(req, res, next);
        expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it("Unauthorized", async () => {
        req.user = undefined;
        const mCheckRole = checkRole(["ADMIN"]);
        await mCheckRole(req, res, next);
        expect(next).toHaveBeenCalledWith(
            createHttpError(401, { message: "Unauthorized" })
        );
    });

    it("invalid Role", async () => {
        req.user = {
            role: "BUYER",
        };
        const mCheckRole = checkRole(["ADMIN"]);
        await mCheckRole(req, res, next);
        expect(next).toHaveBeenCalledWith(
            createHttpError(403, {
                message: "Your role does not have access permissions",
            })
        );
    });
});
