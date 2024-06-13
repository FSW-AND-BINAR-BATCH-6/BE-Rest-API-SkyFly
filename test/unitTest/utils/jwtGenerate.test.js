const jwt = require("jsonwebtoken");
const { generateJWT } = require("../../../utils/jwtGenerate");

jest.mock("jsonwebtoken");

describe("generateJWT", () => {
    const payload = {
        id: "Togenashi",
        name: "Togeari",
        role: "BUYER",
        familyName: "Family",
        phoneNumber: "628123456789",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("success", () => {
        jwt.sign.mockReturnValue("tokenMockup");
        const token = generateJWT(payload);
        expect(token).toBe("tokenMockup");
    });
});
