const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const createHttpError = require("http-errors");
const { randomUUID } = require("crypto");
const user = require('../controllers/user');
const prisma = new PrismaClient();




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
    
    const data = req.body;

    try {

        const newUser = await prisma.user.create({
            data: {
                id: randomUUID, // Include this line if you are passing id in the request body
                name: data.name,
                phoneNumber: data.phoneNumber,
                role: data.role,
            },
        });

        res.status(201).json({
            status: true,
            message: "User created successfully",
            data: {
                id: newUser.id,
                name: newUser.name,
                phoneNumber: newUser.phoneNumber,
                role: newUser.role,
            },
        });
    } catch (err) {
        next(createHttpError(500, { message: err.message }));
    }
};


const updateUser = async (req, res, next) => {
    
    const { name, phoneNumber, role } = value;

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
                name,
                phoneNumber,
                role,
            },
        });

        res.status(201).json({
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
