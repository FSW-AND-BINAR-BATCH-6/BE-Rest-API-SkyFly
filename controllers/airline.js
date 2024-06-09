const { PrismaClient } = require("@prisma/client");
const { uploadFile } = require("../lib/supabase");
const {randomUUID} = require("crypto");
const createHttpError = require("http-errors");

const prisma = new PrismaClient();

const getAllAirline = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit

        const getAirline = await prisma.airline.findMany({
            skip: offset,
            take: limit
        });

        const count = await prisma.airline.count()

        res.status(200).json({
          status: true,
          message: "All airline data retrieved successfully",
          totalItems: count,
          pagination: {
            totalPage: Math.ceil(count/limit),
            currentPage: page,
            pageItems: getAirline.length,
            nextPage: page < Math.ceil(count/limit) ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null
          },
          data: getAirline.length !== 0 ? getAirline : "empty product data"
        });
      } catch (error) {
        next(createHttpError(500, {message: error.message}));
      }
}

const getAirlineById = async (req, res, next) => {
    try {
        const id = req.params.id
        const getAirline = await prisma.airline.findUnique({
            where: {
                id: id
            }
        })    

        if(!getAirline) return next(createHttpError(404, {message: "Airline not found"}))
        res.status(200).json({
            status: true,
            message: "All airline data retrieved successfully",
            data: getAirline
        })
    } catch (error) {
        next(createHttpError(500, {message: error.message}))
    }
}

const createNewAirline = async (req, res, next) => {
    try {
        const {name, code} = req.body;
        const file = req.file;

        let imageUrl
        file ? imageUrl = await uploadFile(file) : imageUrl = "https://placehold.co/600x400"

        const newAirline = await prisma.airline.create({
            data: {
                id: randomUUID(),
                name: name,
                code: code,
                image: imageUrl
            }
        })

        res.status(201).json({
            status: true,
            message: "Airline created successfully",
            data: newAirline
        })
    } catch (error) {
        next(createHttpError(500, {message: error.message}))
    }
}

const updateAirline = async (req, res, next) => {
    try {
        const {name, code} = req.body;
        
        const file = req.file;
        const getAirline = await prisma.airline.findUnique({
            where: {
                id: req.params.id
            }
        })

        if(!getAirline) return next(createHttpError(404, {message: "Airline not found"}))
        !file ? imageUrl = getAirline.image : imageUrl = await uploadFile(file)
        
        const updateAirline = await prisma.airline.update({
            where: {
                id: req.params.id
            },
            data:{
                code,
                name,
                image: imageUrl
            }
        });

        res.status(201).json({
            status: true,
            message:  "Airline updated successfully",
            data: updateAirline
        })

    } catch (error) {
        next(createHttpError(500, {message: error.message}))
    }
}

const deleteAirline = async (req, res, next) => {
    try {
        const getAirline = await prisma.airline.findUnique({
            where: {
                id: req.params.id
            }
        })

        if(!getAirline) return next(createHttpError(404, {message: "Airline not found"}))
        
        await prisma.airline.delete({
            where: {
                id: req.params.id
            }
        })
        
        res.status(200).json({
            status: true,
            message: "Airline deleted successfully"
        })
    } catch (error) {
        next(createHttpError(500, {message: error.message}))
    }
}

module.exports = {
    createNewAirline,
    updateAirline,
    getAllAirline,
    deleteAirline,
    getAirlineById
}