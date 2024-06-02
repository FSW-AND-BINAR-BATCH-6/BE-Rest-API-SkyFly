const { PrismaClient } = require("@prisma/client");
const createHttpError = require("http-errors");
const { randomUUID } = require("crypto");
const prisma = new PrismaClient();

const getAllUsers = async (req, res, next) => {
    try {
        const search = req.query.search || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const users = await prisma.user.findMany({
            where: {
                name: {
                    contains: search,
                    mode: "insensitive", // Optional: to make the search case insensitive
                },
            },
            select: {
                id: true,
                name: true,
                phoneNumber: true,
                familyName: true,
                role: true,
                auth: {
                    select: {
                        id: true,
                        email: true,
                        isVerified: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
            skip: offset,
            take: limit,
        });

        const count = await prisma.user.count({
            where: {
                name: {
                    contains: search,
                    mode: "insensitive", // Optional: to make the search case insensitive
                },
            },
        });

        res.status(200).json({
            status: true,
            message: "All user data retrieved successfully",
            totalItems: count,
            pagination: {
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                pageItems: users.length,
                nextPage: page < Math.ceil(count / limit) ? page + 1 : null,
                prevPage: page > 1 ? page - 1 : null,
            },
            data: users.length !== 0 ? users : "No user data found",
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const getUserById = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            select: {
                id: true,
                name: true,
                phoneNumber: true,
                familyName: true,
                role: true,
                auth: {
                    select: {
                        id: true,
                        email: true,
                        isVerified: true,
                    },
                },
            },
            where: { id: req.params.id },
        });

        if (user) {
            res.status(200).json({
                status: true,
                message: "User data retrieved successfully",
                data: user,
            });
        } else {
            next(createHttpError(404, { message: "Id Not Found" }));
        }
    } catch (error) {
        next(createHttpError(500, { error: error.message }));
    }
};

const createUser = async (req, res, next) => {
    console.log(randomUUID());
    const data = req.body;

    try {
        const newUser = await prisma.user.create({
            data: {
                id: randomUUID(),
                name: data.name,
                phoneNumber: data.phoneNumber,
                familyName: data.familyName,
                role: data.role || "BUYER", // Default value for role
            },
        });

        res.status(201).json({
            status: true,
            message: "User created successfully",
            data: {
                id: newUser.id,
                name: newUser.name,
                phoneNumber: newUser.phoneNumber,
                familyName: newUser.familyName,
                role: newUser.role,
            },
        });
    } catch (err) {
        next(createHttpError(500, { message: err.message }));
    }
};

const updateUser = async (req, res, next) => {
    // const { name, phoneNumber, role } = value;
    const data = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
        });

        if (!user) {
            return next(createHttpError(404, { message: "Id Not Found" }));
        }

        // Check if the new name already exists for a different user

        const updatedUser = await prisma.user.update({
            where: { id: req.params.id },
            data: {
                name: data.name,
                phoneNumber: data.phoneNumber,
                familyName: data.familyName,
                role: "BUYER", // Ensures role is always 'BUYER'
            },
        });

        res.status(201).json({
            status: true,
            message: "User updated successfully",
            data: {
                id: updatedUser.id,
                name: updatedUser.name,
                phoneNumber: updatedUser.phoneNumber,
                familyName: updatedUser.familyName,
                role: updatedUser.role,
            },
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
        });

        if (!user) {
            return next(createHttpError(404, { message: "Id Not Found" }));
        }

        await prisma.user.delete({
            where: { id: req.params.id },
        });

        res.status(200).json({
            status: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        next(createHttpError(500, { error: error.message }));
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
};
