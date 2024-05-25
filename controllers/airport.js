const { PrismaClient } = require("@prisma/client");
const {randomUUID} = require("crypto");
const createHttpError = require("http-errors")

const prisma = new PrismaClient();

const getAllAirports = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit

        const getAirports = await prisma.airport.findMany({
            skip: offset,
            take: limit
        });

        const count = await prisma.airport.count()

        res.status(200).json({
          status: true,
          message: "all Airport data retrieved successfully",
          data: getAirports.length !== 0 ? getAirports : "Empty",
          pagination: {
            totalPage: Math.ceil(count/limit),
            currentPage: page,
            pageItems: getAirports.length,
            nextPage: page < Math.ceil(count/limit) ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null
          }
        });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
}

const getAirportById = async (req, res, next) => {
    const id = req.params.id
    try {
        const getAirport = await prisma.airport.findUnique({
            where: {
                id: id
            }
        })    

        if(!getAirport) return next(createHttpError(404, {message: "Airport not found"}))

        res.status(200).json({
            status: true,
            message: "all Airports data retrieved successfully",
            data: getAirport
        })
    } catch (error) {
        next(createHttpError(500, {message: error.message}))
    }
}

const createNewAirport = async (req, res, next) => {
    const {name, code, country, city} = req.body;
    console.log(req.body)

    try {
        const newAirport = await prisma.airport.create({
            data: {
                id: randomUUID(),
                name: name,
                code: code,
                country: country,
                city: city
            }
        })

        res.status(201).json({
            status: true,
            message: "Airport created successfully",
            data: newAirport
        })

    } catch (error) {
        next(createHttpError(500, {message: error.message}))
    }
}

const updateAirport = async (req, res, next) => {
    const {name, code, country, city} = req.body;
    
    try {
        const getAirport = await prisma.airport.findUnique({
            where: {
                id: req.params.id
            }
        })

        if(!getAirport) return next(createHttpError(404, {message: "Airport not found"}))
        
        const updateAirport = await prisma.airport.update({
            where: {
                id: req.params.id
            },
            data:{
                code,
                name,
                country,
                city
            }
        });

        res.status(201).json({
            status: true,
            message:  "Airport updated successfully",
            data: updateAirport
        })

    } catch (error) {
        next(createHttpError(500, {message: error.message}))
    }
}

const deleteAirport = async (req, res, next) => {
    try {
        const getAirport = await prisma.airport.findFirst({
            where: {
                id: req.params.id
            }
        })

        if(!getAirport) return next(createHttpError(404, {message: "Airport not found"}))
        
        await prisma.airport.delete({
            where: {
                id: req.params.id
            }
        })
        
        res.status(200).json({
            status: true,
            message: "Airport deleted successfully"
        })
    } catch (error) {
        next(createHttpError(500, {message: error.message}))
    }
}

module.exports = {
    createNewAirport,
    updateAirport,
    getAllAirports,
    deleteAirport,
    getAirportById
}