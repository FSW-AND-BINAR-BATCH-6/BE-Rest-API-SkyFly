const notificationsController = require("../../../controllers/notifications");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

jest.mock("@prisma/client", () => {
    const mPrismaClient = {
        notifications: {
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findFirst: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

jest.mock("crypto", () => ({
    randomUUID: jest.fn(),
}));

// const serverFailed = async (
//     req,
//     res,
//     next,
//     prismaFunction,
//     controllerFunction
// ) => {
//     const errorMessage = "Internal Server Error";
//     prismaFunction.mockRejectedValue(new Error(errorMessage));
//     await controllerFunction(req, res, next);
//     expect(next).toHaveBeenCalledWith(
//         createHttpError(500, { message: errorMessage })
//     );
// };

describe("Notifications API", () => {
    let res, next;

    const notificationsDummyData = [
        {
            id: "1",
            type: "Promotions",
            title: "Diskon 50% buat kamu, iya kamu 😘",
            content:
                "Dapatkan potongan 50% dalam pembelian tiket!, promo ini berlaku untuk semua penerbangan",
            date: "2030-01-01T00:00:00.000Z",
        },
        {
            id: "2",
            type: "Warning",
            title: "Pesawat kamu sudah mau berangkat!",
            content:
                "Jangan sampai ketinggalan pesawat! ayo buruan Check-in, pesawat kamu akan berangkat sebentar lagi",
            date: "2030-01-01T00:00:00.000Z",
        },
        {
            id: "3",
            type: "Information",
            title: "Pemberitahuan penerbangan",
            content:
                "Penerbangan anda ke Bali akan segera berangkat 2 jam lagi. ayo buruan ke gerbang keberangkatan",
            date: "2030-01-01T00:00:00.000Z",
        },
        {
            id: "4",
            type: "Update",
            title: "Pembaruan Aplikasi",
            content:
                "Ada update baru loh buat aplikasi kami. Nikmati fitur baru sekarang!",
            date: "2030-01-01T00:00:00.000Z",
        },
    ];

    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            jeson: jest.fn(),
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    const unitTest = async (
        prisma,
        controller,
        dummyData,
        req,
        statusOutcome,
        code,
        json
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
                console.log(count);
            }
            await controller(req, res, next);
            expect(res.status).toHaveBeenCalledWith(code);
            if (json) {
                expect(res.json).toHaveBeenCalledWith(json);
            }
        }
    };

    describe("getNotifications", () => {
        const getNotifications = [
            {
                description: "success",
                prisma: [
                    prisma.notifications.findMany,
                    prisma.notifications.count,
                ],
                dummyData: [notificationsDummyData[0], 1],
                controller: notificationsController.getNotifications,
                req: (req = {
                    query: {
                        page: "1",
                        limit: "10",
                    },
                }),
                statusOutcome: { status: true },
                code: 200,
            },
        ];

        getNotifications.forEach((test) => {
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
    });

    describe("getNotificationsById", () => {
        const getNotificationsById = [
            {
                description: "success",
                prisma: [prisma.notifications.findUnique],
                dummyData: [notificationsDummyData[0]],
                controller: notificationsController.getNotificationsById,
                req: (req = {
                    params: {
                        id: "1",
                    },
                }),
                statusOutcome: { status: true },
                code: 200,
            },
        ];

        getNotificationsById.forEach((test) => {
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
    });

    describe("createNewNotifications", () => {
        const createNotifications = [
            {
                description: "success",
                prisma: [
                    prisma.notifications.findUnique,
                    prisma.notifications.create,
                ],
                dummyData: [
                    notificationsDummyData[0],
                    notificationsDummyData[0],
                ],
                controller: notificationsController.createNewNotifications,
                req: (req = {
                    body: {
                        type: notificationsDummyData[0].type,
                        title: notificationsDummyData[0].title,
                        content: notificationsDummyData[0].content,
                    },
                }),
                statusOutcome: { status: true },
                code: 201,
            },
        ];

        createNotifications.forEach((test) => {
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
    });

    describe("updateNotifications", () => {
        const updateNotifications = [
            {
                description: "success",
                prisma: [
                    prisma.notifications.findUnique,
                    prisma.notifications.update,
                ],
                dummyData: [
                    notificationsDummyData[0],
                    notificationsDummyData[0],
                ],
                controller: notificationsController.updateNotifications,
                req: (req = {
                    body: {
                        type: notificationsDummyData[0].type,
                        title: notificationsDummyData[0].title,
                        content: notificationsDummyData[0].content,
                    },
                    params: {
                        id: "1"
                    }
                }),
                statusOutcome: { status: true },
                code: 201,
            },
        ];

        updateNotifications.forEach((test) => {
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
    });

    describe("deleteNotifications", () => {
        const deleteNotifications = [
            {
                description: "success",
                prisma: [
                    prisma.notifications.findUnique,
                    prisma.notifications.delete,
                ],
                dummyData: [
                    notificationsDummyData[0],
                    true
                ],
                controller: notificationsController.deleteNotifications,
                req: (req = {
                    params: {
                        id: "1"
                    }
                }),
                statusOutcome: { status: true },
                code: 200,
            },
        ];

        deleteNotifications.forEach((test) => {
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
    });
});
