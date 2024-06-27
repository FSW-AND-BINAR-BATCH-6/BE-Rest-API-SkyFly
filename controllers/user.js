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
            data: users,
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
            return next(createHttpError(404, { message: "User Not Found" }));
        }
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const createUser = async (req, res, next) => {
    try {
        const { name, phoneNumber, familyName, role, isVerified } = req.body;
        const newUser = await prisma.user.create({
            data: {
                id: randomUUID(),
                name: name,
                phoneNumber: phoneNumber,
                familyName: familyName,
                role: role || "BUYER", // Nilai default untuk role
                isVerified: isVerified || false, // Mengambil nilai dari body permintaan, default ke false
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
                isVerified: newUser.isVerified,
            },
        });
    } catch (err) {
        next(createHttpError(500, { message: err.message }));
    }
};

const updateUser = async (req, res, next) => {
    try {
        const { name, phoneNumber, familyName, role, password } = req.body;
        const userId = req.params.id;
        // Hash kata sandi baru jika ada
        let hashedPassword;
        if (password) {
            hashedPassword = await secretHash(password);
        }

        // Lakukan transaksi untuk memastikan konsistensi data
        const updatedUser = await prisma.$transaction(async (tx) => {
            // Perbarui data pengguna
            const userUpdate = await tx.user.update({
                where: { id: userId },
                data: {
                    name,
                    phoneNumber,
                    familyName,
                    role,
                    isVerified: true,
                },
            });

            // Perbarui kata sandi jika ada
            if (hashedPassword) {
                await tx.auth.update({
                    where: { userId: userId },
                    data: { password: hashedPassword },
                });
            }

            return userUpdate;
        });

        res.status(200).json({
            status: true,
            message: "User updated successfully",
            data: {
                name: updatedUser.name,
                phoneNumber: updatedUser.phoneNumber,
                familyName: updatedUser.familyName,
                role: updatedUser.role,
                isVerified: true,
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
            return next(createHttpError(404, { message: "User Not Found" }));
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
