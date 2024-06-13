const OTPAuth = require("otpauth");
const { generateTOTP, validateTOTP, getSeconds } = require("../../../utils/otp");

jest.mock("otpauth", () => {
    const originalModule = jest.requireActual("otpauth");
    const mockTOTP = {
        generate: jest.fn(),
        validate: jest.fn(),
        period: 180,
    };
    return {
        ...originalModule,
        TOTP: jest.fn(() => mockTOTP),
    };
});

describe("TOTP Functions", () => {
    let totp;

    beforeEach(() => {
        totp = new OTPAuth.TOTP();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("generateTOTP", () => {
        it("should generate a TOTP token", () => {
            const mockToken = "123456";
            totp.generate.mockReturnValue(mockToken);

            const token = generateTOTP();

            expect(totp.generate).toHaveBeenCalled();
            expect(token).toBe(mockToken);
        });
    });

    describe("validateTOTP", () => {
        it("should validate a TOTP token successfully", () => {
            const mockToken = "123456";
            totp.validate.mockReturnValue(true);

            const isValid = validateTOTP(mockToken);

            expect(totp.validate).toHaveBeenCalledWith({
                token: mockToken,
                window: 1,
            });
            expect(isValid).toBe(true);
        });

        it("should fail to validate an invalid TOTP token", () => {
            const mockToken = "123456";
            totp.validate.mockReturnValue(false);

            const isValid = validateTOTP(mockToken);

            expect(totp.validate).toHaveBeenCalledWith({
                token: mockToken,
                window: 1,
            });
            expect(isValid).toBe(false);
        });
    });

    describe("getSeconds", () => {
        it("should return the correct number of seconds remaining", () => {
            const now = Date.now();
            const mockSeconds = (totp.period * (1 - ((now / 1000 / totp.period) % 1))) | 0;
            
            jest.spyOn(Date, 'now').mockReturnValue(now);

            const seconds = getSeconds();

            expect(seconds).toBe(mockSeconds);
        });
    });
});
