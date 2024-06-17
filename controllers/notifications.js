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
            // where: {
            //     userId: req.user.id,
            // },
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
                pageItems: getAllNotifications.length,
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

const getNotificationsById = async (req, res, next) => {
    try {
        const getNotifications = await prisma.notifications.findUnique({
            where: {
                id: req.params.id,
            },
        });

        if (!getNotifications)
            return next(
                createHttpError(404, { message: "Notification data not found" })
            );

        res.status(200).json({
            status: true,
            message: "Notification data retrived successfully",
            data: getNotifications,
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const createNewNotifications = async (req, res, next) => {
    try {
        const { type, title, content } = req.body;
        const createNotifications = await prisma.notifications.create({
            data: {
                id: randomUUID(),
                type: type,
                notificationsTitle: title,
                notificationsContent: content,
                date: new Date(),
            },
        });

        res.status(201).json({
            status: true,
            message: "Notifications created successfully",
            data: createNotifications,
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const updateNotifications = async (req, res, next) => {
    try {
        const { type, title, content } = req.body;
        const notificationId = req.params.id;

        const getNotifications = await prisma.notifications.findUnique({
            where: {
                id: notificationId,
            },
        });

        if (!getNotifications)
            return next(
                createHttpError(404, { message: "Notifications not found" })
            );
        const updateNotifications = await prisma.notifications.update({
            where: {
                id: notificationId,
            },
            data: {
                type: type,
                notificationsTitle: title,
                notificationsContent: content,
                date: new Date(),
            },
        });

        res.status(201).json({
            status: true,
            message: "Airline updated successfully",
            data: updateNotifications,
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const deleteNotifications = async (req, res, next) => {
    try {
        const getNotifications = await prisma.notifications.findUnique({
            where: {
                id: req.params.id,
            },
        });

        if (!getNotifications)
            return next(
                createHttpError(404, { message: "Notifications not found" })
            );

        await prisma.notifications.delete({
            where: {
                id: req.params.id,
            },
        });

        res.status(200).json({
            status: true,
            message: "Notifications deleted successfully",
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

module.exports = {
    getNotifications,
    getNotificationsById,
    createNewNotifications,
    updateNotifications,
    deleteNotifications,
};
