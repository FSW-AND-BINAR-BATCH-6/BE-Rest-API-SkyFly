const createHttpError = require("http-errors");


const unitTest = async (
    prisma,
    controller,
    dummyData,
    req,
    statusOutcome,
    code,
    json,
    errorMessage,
    testFunction,
    testFunctionValue
) => {
    res = {
        status: jest.fn().mockReturnThis(),
        jeson: jest.fn(),
    };
    next = jest.fn();
    let count = 0;

    if (statusOutcome) {
        for (const prismaModel of prisma) {
            prismaModel.mockResolvedValue(dummyData[count]);
            count++;
        }
        if (testFunction) {
            for (const test of testFunction) {
                test.mockReturnThis(testFunctionValue[count]);
                count++;
            }
        }
        await controller(req, res, next);
        if (statusOutcome.status) {
            expect(res.status).toHaveBeenCalledWith(code);
        } else if (!statusOutcome.status) {
            console.log(errorMessage);
            expect(next).toHaveBeenCalledWith(
                createHttpError(code, { message: errorMessage })
            );
        }
        if (json) {
            expect(res.json).toHaveBeenCalledWith(json);
        }
    }
};

module.exports = { unitTest };
