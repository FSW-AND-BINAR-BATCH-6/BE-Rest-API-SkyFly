const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const createHttpError = require("http-errors");
const Joi = require("joi");
const user = require('../controllers/user');


const prisma = new PrismaClient();

// Skema validasi dengan Joi
const userSchema = Joi.object({
    name: Joi.string().required(),
    phoneNumber: Joi.string().optional(),
    role: Joi.string().required(),
});


const userUpdateSchema = Joi.object({
    id: Joi.string(),
    name: Joi.string(),
    phoneNumber: Joi.string().optional(),
    role: Joi.string().required(),
});


const getAllUsers = async (req, res, next) => {
    try {
        const user = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                phoneNumber: true,
                role: true,
            },
        });

        res.status(200).json({
            status: true,
            message: "All user data retrieved successfully",
            data: user,
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const getUserById = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
        });

        if (user) {
            res.status(200).json({
                status: true,
                message: "User data retrieved successfully",
                data: {
                    id: user.id,
                    name: user.name,
                    phoneNumber: user.phoneNumber,
                    role: user.role,
                },
            });
        } else {
            next(createHttpError(404, { message: "Id Not Found" }));
        }
    } catch (error) {
        next(createHttpError(500, { error: error.message }));
    }
};

const createUser = async (req, res, next) => {
    const { error, value } = userSchema.validate(req.body);
    if (error) return next(createHttpError(400, { message: error.details[0].message }));

    const { id, name, phoneNumber, role } = value;

    try {
        // Check if name already exists
        const existingUserByName = await prisma.user.findFirst({
            where: { name: name },
        });

        if (existingUserByName) {
            return next(createHttpError(400, { message: "Username already exists" }));
        }

        const newUser = await prisma.user.create({
            data: {
                id: req.body.id, // Include this line if you are passing id in the request body
                name,
                phoneNumber,
                role,
            },
        });

        res.status(200).json({
            status: true,
            message: "User created successfully",
            data: {
                id: newUser.id,
                name,
                phoneNumber,
                role,
            },
        });
    } catch (err) {
        next(createHttpError(500, { message: err.message }));
    }
};


const updateUser = async (req, res, next) => {
    const { error, value } = userUpdateSchema.validate(req.body);
    if (error) return next(createHttpError(400, { message: error.details[0].message }));

    const { name, phoneNumber, role } = value;

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
        });

        if (!user) {
            return next(createHttpError(404, { message: "Id Not Found" }));
        }

        // Check if the new name already exists for a different user
        if (name) {
            const existingUserByName = await prisma.user.findFirst({
                where: {
                    name: name,
                    NOT: {
                        id: req.params.id,
                    },
                },
            });

            if (existingUserByName) {
                return next(createHttpError(400, { message: "Username already exists" }));
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.params.id },
            data: {
                name,
                phoneNumber,
                role,
            },
        });

        res.status(200).json({
            status: true,
            message: "User updated successfully",
            data: {
                id: updatedUser.id,
                name: updatedUser.name,
                phoneNumber: updatedUser.phoneNumber,
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
