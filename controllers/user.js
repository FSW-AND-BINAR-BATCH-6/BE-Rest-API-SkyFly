const { PrismaClient } = require("@prisma/client");
const createHttpError = require("http-errors");
const { randomUUID } = require("crypto");
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const { secretHash } = require("../utils/hashSalt");

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
        const { name, phoneNumber, familyName, role, email, password, isVerified } = req.body;

        const checkEmail = await prisma.auth.findUnique({
            where: { email },
            include: { user: true },
        });

        if (checkEmail) {
            return next(createHttpError(409, { message: "Email has already been taken" }));
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Menggunakan bcrypt langsung tanpa perlu fungsi async secretHash

        const newUser = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    id: randomUUID(), // Generate random UUID for user ID
                    name,
                    phoneNumber,
                    familyName,
                    role: role,
                    auth: {
                        create: {
                            id: randomUUID(), // Generate random UUID for auth ID
                            email,
                            password: hashedPassword,
                            otpToken: null,
                            isVerified: isVerified,
                            secretToken: null,
                        },
                    },
                },
                include: {
                    auth: true, // Sertakan informasi auth untuk mendapatkan isVerified
                },
            });
            return user;
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
                isVerified: newUser.auth.isVerified, // Ambil isVerified dari informasi auth
            },
        });
    } catch (err) {
        next(createHttpError(500, { message: err.message }));
    }
};



const updateUser = async (req, res, next) => {
    try {
        const { name, phoneNumber, familyName, role, password, isVerified } = req.body;
        const userId = req.params.id;

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
            },
        });

        let hashedPassword;
        let data = {
            isVerified,
        };
        if (password) {
            hashedPassword = await secretHash(password);
            data = {
                password: hashedPassword,
                isVerified: isVerified,
            };
            await prisma.$transaction(async (tx) => {
                let cekAuth = await tx.auth.getAllUsers({
                    where: {
                        userId: userId
                    }
                });
                console.log(cekAuth);
                await tx.auth.update({
                    where: {
                        userId: userId
                    },
                    data: data
                });
            });

        }

        return userUpdate;
    });
    console.log(res.data);

        res.status(200).json({
            status: true,
            message: "User updated successfully",
            data: {
                id: updatedUser.id,
                name: updatedUser.name,
                phoneNumber: updatedUser.phoneNumber,
                familyName: updatedUser.familyName,
                role: updatedUser.role,
                isVerified: updatedUser.isVerified,
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
