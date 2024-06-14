const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const nodeMailer = require("../../../lib/nodeMailer");
const { generateSecretEmail } = require("../../../utils/emailHandler");

jest.mock("@prisma/client", () => {
    const mPrismaClient = {
        auth: {
            update: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

jest.mock("jsonwebtoken", () => ({
    verify: jest.fn(),
}));

jest.mock("../../../lib/nodeMailer", () => ({
    getHtml: jest.fn(),
    sendEmail: jest.fn(),
}));

describe("generateSecretEmail", () => {
    const prisma = new PrismaClient();
    const payload = {
        email: "togeari@example.com",
        token: "validToken",
        otp: "123456",
        emailTitle: "Verification",
    };
    const dataUrl = { token: "validToken" };
    const type = "verify";
    const template = "verificationTemplate";
    const baseUrl = "http://localhost";
    process.env.JWT_SIGNATURE_KEY = "testKey";
    process.env.BASE_URL = baseUrl;

    beforeEach(() => {
        jwt.verify.mockReturnValue(payload);
        prisma.auth.update.mockResolvedValue({});
        nodeMailer.getHtml.mockResolvedValue("<html></html>");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should update the auth record, generate HTML and send email", async () => {
        const urlTokenVerification = `${baseUrl}/auth/${type}?token=${dataUrl.token}`;

        const result = await generateSecretEmail(dataUrl, type, template);

        expect(jwt.verify).toHaveBeenCalledWith(dataUrl.token, process.env.JWT_SIGNATURE_KEY);
        expect(prisma.auth.update).toHaveBeenCalledWith({
            where: { email: payload.email },
            data: { secretToken: payload.token },
        });
        expect(nodeMailer.getHtml).toHaveBeenCalledWith(template, {
            email: payload.email,
            OTPToken: payload.otp,
            urlTokenVerification,
        });
        expect(nodeMailer.sendEmail).toHaveBeenCalledWith(
            payload.email,
            `${payload.emailTitle} | SkyFly Team C1`,
            "<html></html>"
        );
        expect(result).toBe(urlTokenVerification);
    });

    it("should throw an error if jwt verification fails", async () => {
        jwt.verify.mockImplementationOnce(() => {
            throw new Error("Invalid token");
        });

        await expect(generateSecretEmail(dataUrl, type, template)).rejects.toThrow("Invalid token");

        expect(prisma.auth.update).not.toHaveBeenCalled();
        expect(nodeMailer.getHtml).not.toHaveBeenCalled();
        expect(nodeMailer.sendEmail).not.toHaveBeenCalled();
    });

    it("should throw an error if prisma update fails", async () => {
        prisma.auth.update.mockImplementationOnce(() => {
            throw new Error("Database update failed");
        });

        await expect(generateSecretEmail(dataUrl, type, template)).rejects.toThrow("Database update failed");

        expect(nodeMailer.getHtml).not.toHaveBeenCalled();
        expect(nodeMailer.sendEmail).not.toHaveBeenCalled();
    });

    it("should throw an error if getHtml fails", async () => {
        nodeMailer.getHtml.mockImplementationOnce(() => {
            throw new Error("Failed to generate HTML");
        });

        await expect(generateSecretEmail(dataUrl, type, template)).rejects.toThrow("Failed to generate HTML");

        expect(prisma.auth.update).toHaveBeenCalled();
        expect(nodeMailer.sendEmail).not.toHaveBeenCalled();
    });

    it("should throw an error if sendEmail fails", async () => {
        nodeMailer.sendEmail.mockImplementationOnce(() => {
            throw new Error("Failed to send email");
        });

        await expect(generateSecretEmail(dataUrl, type, template)).rejects.toThrow("Failed to send email");

        expect(prisma.auth.update).toHaveBeenCalled();
        expect(nodeMailer.getHtml).toHaveBeenCalled();
    });
});
