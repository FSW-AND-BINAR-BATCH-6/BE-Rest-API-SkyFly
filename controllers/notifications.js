const { PrismaClient } = require("@prisma/client");
const { randomUUID } = require("crypto");
const createHttpError = require("http-errors");

const prisma = new PrismaClient();

const getNotifications = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const getAllNotifications = await prisma.notifications.findMany({
            where: {
                uid: req.user.id,
            },
            skip: offset,
            take: limit,
        });

        const count = await prisma.notifications.count();

        res.status(200).json({
            status: true,
            message: "All notifications data retrived successfully",
            totalItems: count,
            pagination: {
                totalPage: Math.ceil(count / limit),
                currentPage: page,
                pageItems: getAirline.length,
                nextPage: page < Math.ceil(count / limit) ? page + 1 : null,
                prevPage: page > 1 ? page - 1 : null,
            },
            data:
                getAllNotifications.length !== 0
                    ? getAllNotifications
                    : "empty notifications data",
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};
