const { PrismaClient } = require("@prisma/client");
const { uploadFile } = require("../lib/supabase");
const {randomUUID} = require("crypto");
const createHttpError = require("http-errors")

const prisma = new PrismaClient();

const getAllAirplane = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit

        const getAirplane = await prisma.airplane.findMany({
            skip: offset,
            take: limit
        });

        const count = await prisma.airplane.count()

        res.status(200).json({
          status: true,
          message: "all airplane data retrieved successfully",
          data: getAirplane.length !== 0 ? getAirplane : "Empty",
          pagination: {
            totalPage: Math.ceil(count/limit),
            currentPage: page,
            pageItems: getAirplane.length,
            nextPage: page < Math.ceil(count/limit) ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null
          }
        });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
}

const getAirplaneById = async (req, res, next) => {
    const id = req.params.id
    try {
        const getAirplane = await prisma.airplane.findUnique({
            where: {
                id: id
            }
        })    

        if(!getAirplane) return next(createHttpError(404, {message: "Airplane not found"}))
        res.status(200).json({
            status: true,
            message: "all airplane data retrieved successfully",
            data: getAirplane
        })
    } catch (error) {
        next(createHttpError(500, {message: error.message}))
    }
}

const createNewAirplane = async (req, res, next) => {
    const {name, code} = req.body;
    console.log(req.body)
    const file = req.file;

    try {
        let imageUrl
        if(file){
            imageUrl = await uploadFile(file)
        }

        const newAirplane = await prisma.airplane.create({
            data: {
                id: randomUUID(),
                name: name,
                code: code,
                image: imageUrl
            }
        })

        res.status(201).json({
            status: true,
            message: "Airplane created successfully",
            data: newAirplane
        })
    } catch (error) {
        next(createHttpError(500, {message: error.message}))
    }
}

const updateAirplane = async (req, res, next) => {
    const {name, code} = req.body;
    
    const file = req.file;

    try {
        const getAirplane = await prisma.airplane.findUnique({
            where: {
                id: req.params.id
            }
        })

        let file = getAirplane.image
        if(file) imageUrl = await uploadFile(file)

        if(!getAirplane) return next(createHttpError(404, {message: "Airplane not found"}))
        
        const updateAirPlane = await prisma.airplane.update({
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
            message:  "Airplane updated successfully",
            data: updateAirPlane
        })

    } catch (error) {
        next(createHttpError(500, {message: error.message}))
    }
}

const deleteAirplane = async (req, res, next) => {
    try {
        const getAirplane = await prisma.airplane.findFirst({
            where: {
                id: req.params.id
            }
        })

        if(!getAirplane) return next(createHttpError(404, {message: "Airplane not found"}))
        
        await prisma.airplane.delete({
            where: {
                id: req.params.id
            }
        })
        
        res.status(200).json({
            status: true,
            message: "Airplane deleted successfully"
        })
    } catch (error) {
        next(createHttpError(500, {message: error.message}))
    }
}

module.exports = {
    createNewAirplane,
    updateAirplane,
    getAllAirplane,
    deleteAirplane,
    getAirplaneById
}