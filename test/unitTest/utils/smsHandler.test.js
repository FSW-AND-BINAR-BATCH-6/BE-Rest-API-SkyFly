const https = require("follow-redirects").https;
const { smsHandler } = require("../../../utils/smsHandler");

jest.mock("follow-redirects", () => ({
    https: {
        request: jest.fn(),
    },
}));

describe("smsHandler", () => {
    const phoneNumber = "1234567890";
    const OTPToken = "123456";
    const urlTokenVerification = "http://example.com/verify";

    const postData = JSON.stringify({
        messages: [
            {
                destinations: [{ to: phoneNumber }],
                from: "Sky Fly Production",
                text: `Verify your account with Sky Fly Production.\n\nOTP: ${OTPToken}\n\nTo protect your account, please do not give the OTP to anyone\n\nFollow the following link to verify your account:\n${urlTokenVerification}`,
            },
        ],
    });

    let mockRequest;
    let mockResponse;

    beforeEach(() => {
        mockRequest = {
            write: jest.fn(),
            end: jest.fn(),
        };
        mockResponse = {
            on: jest.fn().mockImplementation((event, callback) => {
                if (event === "data") {
                    callback(Buffer.from("response data"));
                }
                if (event === "end") {
                    callback();
                }
            }),
        };

        https.request.mockImplementation((options, callback) => {
            callback(mockResponse);
            return mockRequest;
        });

        process.env.SMS_API_KEY = "testApiKey";
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should send an SMS with the correct data", () => {
        smsHandler(phoneNumber, OTPToken, urlTokenVerification);

        expect(https.request).toHaveBeenCalledWith(
            {
                method: "POST",
                hostname: "9l6dx4.api.infobip.com",
                path: "/sms/2/text/advanced",
                headers: {
                    Authorization: `App ${process.env.SMS_API_KEY}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                maxRedirects: 20,
            },
            expect.any(Function)
        );

        expect(mockRequest.write).toHaveBeenCalledWith(postData);
        expect(mockRequest.end).toHaveBeenCalled();
    });

    it("should log the response data on success", () => {
        const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

        smsHandler(phoneNumber, OTPToken, urlTokenVerification);

        expect(mockResponse.on).toHaveBeenCalledWith("data", expect.any(Function));
        expect(mockResponse.on).toHaveBeenCalledWith("end", expect.any(Function));

        expect(consoleLogSpy).toHaveBeenCalledWith("response data");

        consoleLogSpy.mockRestore();
    });

    it("should log the error on failure", () => {
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
        const errorMessage = "Request failed";

        mockResponse.on.mockImplementation((event, callback) => {
            if (event === "error") {
                callback(new Error(errorMessage));
            }
        });

        smsHandler(phoneNumber, OTPToken, urlTokenVerification);

        expect(mockResponse.on).toHaveBeenCalledWith("error", expect.any(Function));
        expect(consoleErrorSpy).toHaveBeenCalledWith(new Error(errorMessage));

        consoleErrorSpy.mockRestore();
    });
});
