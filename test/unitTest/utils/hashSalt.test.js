const bcrypt = require("bcrypt");
const { secretHash, secretCompare } = require("../../../utils/hashSalt");

jest.mock("bcrypt");

describe("secretHash", () => {
    it("should hash a string with bcrypt", () => {
        const string = "mySecretPassword";
        const saltRounds = 10;
        const hashedString = "hashedPassword";
        process.env.SALT = saltRounds.toString();

        bcrypt.hashSync.mockReturnValue(hashedString);

        const result = secretHash(string);

        expect(bcrypt.hashSync).toHaveBeenCalledWith(string, saltRounds);
        expect(result).toBe(hashedString);
    });
});

describe("secretCompare", () => {
    it("should compare a string with a hashed string using bcrypt", () => {
        const string = "mySecretPassword";
        const hashedString = "hashedPassword";

        bcrypt.compareSync.mockReturnValue(true);

        const result = secretCompare(string, hashedString);

        expect(bcrypt.compareSync).toHaveBeenCalledWith(string, hashedString);
        expect(result).toBe(true);
    });

    it("should return false if the string does not match the hashed string", () => {
        const string = "mySecretPassword";
        const hashedString = "differentHashedPassword";

        bcrypt.compareSync.mockReturnValue(false);

        const result = secretCompare(string, hashedString);

        expect(bcrypt.compareSync).toHaveBeenCalledWith(string, hashedString);
        expect(result).toBe(false);
    });
});
