const createHttpError = require("http-errors");
const airlineController = require("../../../controllers/airline");
const { PrismaClient } = require("@prisma/client");
const { randomUUID } = require("crypto");
const { uploadFile } = require("../../../lib/supabase");
const prisma = new PrismaClient();
const { unitTest } = require("./index");

jest.mock("@prisma/client", () => {
    const mPrismaClient = {
        airline: {
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

jest.mock("crypto", () => ({
    randomUUID: jest.fn(),
}));

jest.mock("../../../lib/supabase", () => ({
    uploadFile: jest.fn(),
}));

const serverFailed = async (
    req,
    res,
    next,
    prismaFunction,
    controllerFunction
) => {
    const errorMessage = "Internal Server Error";
    prismaFunction.mockRejectedValue(new Error(errorMessage));
    await controllerFunction(req, res, next);
    expect(next).toHaveBeenCalledWith(
        createHttpError(500, { message: errorMessage })
    );
};

describe("Airline API", () => {
    let req, res, next;

    const airlineDummyData = [
        {
            id: "GFL",
            code: "GA",
            name: "Garuda Indonesia",
            image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/1716536772224.png",
        },
    ];

    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("GetAllAirlines", () => {
        const req = {
            query: {
                page: "1",
                limit: "10",
            },
        };

        const getAllAirlines = [
            {
                description: "success",
                prisma: [prisma.airline.findMany, prisma.airline.count],
                dummyData: [airlineDummyData, 1],
                controller: airlineController.getAllAirline,
                req: req,
                statusOutcome: { status: true },
                code: 200,
            },
        ];

        getAllAirlines.forEach((test) => {
            it(test.description, async () => {
                await unitTest(
                    test.prisma,
                    test.controller,
                    test.dummyData,
                    test.req,
                    test.statusOutcome,
                    test.code,
                    null
                );
            });
        });

        it("Failed, 500", async () => {
            await serverFailed(
                req,
                res,
                next,
                prisma.airline.findMany,
                airlineController.getAllAirline
            );
        });
    });

    describe("getAirlineById", () => {
        const req = {
            params: {
                id: "1",
            },
        };
        const getAllAirlines = [
            {
                description: "success",
                prisma: [prisma.airline.findUnique],
                dummyData: [airlineDummyData],
                controller: airlineController.getAirlineById,
                req: req,
                statusOutcome: { status: true },
                code: 200,
            },
            {
                description: "Airline not found",
                prisma: [prisma.airline.findUnique],
                dummyData: [null],
                controller: airlineController.getAirlineById,
                req: req,
                statusOutcome: { status: false },
                code: 404,
                errorMessage: "Airline not found",
            },
        ];

        getAllAirlines.forEach((test) => {
            it(test.description, async () => {
                await unitTest(
                    test.prisma,
                    test.controller,
                    test.dummyData,
                    test.req,
                    test.statusOutcome,
                    test.code,
                    null,
                    test.errorMessage
                );
            });
        });

        it("Failed, 500", async () => {
            await serverFailed(
                req,
                res,
                next,
                prisma.airline.findUnique,
                airlineController.getAirlineById
            );
        });
    });

    describe("createNewAirline", () => {
        beforeEach(() => {
            req = {
                file: {
                    buffer: Buffer.from("test"),
                    mimetype: "image/jpg",
                },
                body: {
                    code: "GA",
                    name: "Garuda Indonesia",
                    image: "https://tnvdosywgayukanmlhqw.supabase.co/storage/v1/object/public/Final/public/airplanes/1716536772224.png",
                },
            };
        });

        it("Success", async () => {
            prisma.airline.create.mockResolvedValue(airlineDummyData);
            uploadFile.mockReturnThis(req.file);
            randomUUID.mockReturnThis("GFL");

            await airlineController.createNewAirline(req, res, next);
            expect(uploadFile).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: "Airline created successfully",
                data: airlineDummyData,
            });
        });

        it("Failed, 500", async () => {
            await serverFailed(
                req,
                res,
                next,
                prisma.airline.create,
                airlineController.createNewAirline
            );
        });
    });

    describe("updateAirline", () => {
        beforeEach(() => {
            req = {
                body: {
                    code: "GA",
                    name: "Garuda Indonesia",
                },
                params: {
                    id: "GFL",
                },
            };
        });

        const updateAirline = [
            {
                description: "success",
                prisma: [prisma.airline.findUnique, prisma.airline.update],
                dummyData: [airlineDummyData[0], airlineDummyData[0]],
                controller: airlineController.updateAirline,
                req: (req = {
                    body: {
                        code: "GA",
                        name: "Garuda Indonesia",
                    },
                    params: {
                        id: "1",
                    },
                }),
                statusOutcome: { status: true },
                code: 201,
            },
            {
                description: "Failed",
                prisma: [prisma.airline.findUnique],
                dummyData: [null],
                controller: airlineController.updateAirline,
                req: (req = {
                    body: {
                        code: "GA",
                        name: "Garuda Indonesia",
                    },
                    params: {
                        id: "1",
                    },
                }),
                statusOutcome: { status: false },
                code: 404,
                errorMessage: "Airline not found",
            },
        ];

        updateAirline.forEach((test) => {
            it(test.description, async () => {
                await unitTest(
                    test.prisma,
                    test.controller,
                    test.dummyData,
                    test.req,
                    test.statusOutcome,
                    test.code,
                    null,
                    test.errorMessage
                );
            });
        });

        it("Failed, 500", async () => {
            await serverFailed(
                req,
                res,
                next,
                prisma.airline.findUnique,
                airlineController.updateAirline
            );
        });
    });

    describe("deleteAirline", () => {
        const req = {
            params: {
                id: "GFL",
            },
        };

        const deleteAirlines = [
            {
                description: "success",
                prisma: [prisma.airline.findUnique, prisma.airline.delete],
                dummyData: [airlineDummyData, true],
                controller: airlineController.deleteAirline,
                req: req,
                statusOutcome: { status: true },
                code: 200,
            },
        ];

        deleteAirlines.forEach((test) => {
            it(test.description, async () => {
                await unitTest(
                    test.prisma,
                    test.controller,
                    test.dummyData,
                    test.req,
                    test.statusOutcome,
                    test.code,
                    null
                );
            });
        });

        it("Failed, 500", async () => {
            await serverFailed(
                req,
                res,
                next,
                prisma.airline.findUnique,
                airlineController.deleteAirline
            );
        });
    });
});
