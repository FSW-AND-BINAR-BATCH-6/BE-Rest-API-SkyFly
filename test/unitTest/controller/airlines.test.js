const createHttpError = require("http-errors");
const airlineController = require("../../../controllers/airline");
const { PrismaClient } = require("@prisma/client");
const { randomUUID } = require("crypto");
const { uploadFile } = require("../../../lib/supabase");
const prisma = new PrismaClient();

jest.mock("@prisma/client", () => {
    const mPrismaClient = {
        airline: {
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
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
        beforeEach(() => {
            req = {
                query: {
                    page: "1",
                    limit: "10",
                },
            };
        });

        it("Success", async () => {
            const totalItems = 1;

            prisma.airline.findMany.mockResolvedValue(airlineDummyData);
            prisma.airline.count.mockResolvedValue(totalItems);

            await airlineController.getAllAirline(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200),
                expect(res.json).toHaveBeenCalledWith({
                    status: true,
                    message: "All airline data retrieved successfully",
                    totalItems,
                    pagination: {
                        totalPage: 1,
                        currentPage: 1,
                        pageItems: 1,
                        nextPage: null,
                        prevPage: null,
                    },
                    data: airlineDummyData,
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
        beforeEach(() => {
            req = {
                params: {
                    id: "1",
                },
            };
        });

        it("Success", async () => {
            prisma.airline.findUnique.mockResolvedValue(airlineDummyData);

            await airlineController.getAirlineById(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: true,
                message: "All airline data retrieved successfully",
                data: airlineDummyData,
            });
        });

        it("Failed, 404", async () => {
            prisma.airline.findUnique.mockResolvedValue(null);

            await airlineController.getAirlineById(req, res, next);
            expect(next).toHaveBeenCalledWith(
                createHttpError(404, { message: "Airline not found" })
            );
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

        it("Success", async () => {
            prisma.airline.findUnique.mockResolvedValue(airlineDummyData);
            prisma.airline.update.mockResolvedValue(airlineDummyData);

            await airlineController.updateAirline(req, res, next);
            expect(uploadFile).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it("Failed, 404", async () => {
            prisma.airline.findUnique.mockResolvedValue(null);

            await airlineController.updateAirline(req, res, next);
            expect(prisma.airline.update).not.toHaveBeenCalled();
            expect(uploadFile).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(
                createHttpError(404, { message: "Airline not found" })
            );
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
        beforeEach(() => {
            req = {
                params: {
                    id: "GFL",
                },
            };
        });

        it("Success", async () => {
            prisma.airline.findUnique.mockResolvedValue(airlineDummyData);
            prisma.airline.findUnique.mockReturnThis();

            await airlineController.deleteAirline(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
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
