const { PrismaClient } = require("@prisma/client");
const { uploadFile } = require("../lib/supabase");
const { randomUUID } = require("crypto");
const createHttpError = require("http-errors");

const prisma = new PrismaClient();

const getAllAirports = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const showAll = req.query.showall || "false";
        const code = req.query.code;
        const name = req.query.name;
        const country = req.query.country;
        const city = req.query.city;
        const search = req.query.search;
        const continent = req.query.continent;

        const conditions = {};
        if (search) {
            conditions.OR = [
                {
                    code: { contains: search, mode: "insensitive" },
                },
                {
                    name: { contains: search, mode: "insensitive" },
                },
                {
                    country: { contains: search, mode: "insensitive" },
                },
                {
                    city: { contains: search, mode: "insensitive" },
                },
                {
                    continent: { contains: search, mode: "insensitive" },
                },
            ];
        }
        if (code) {
            conditions.code = { contains: code, mode: "insensitive" };
        }
        if (name) {
            conditions.name = { contains: name, mode: "insensitive" };
        }
        if (country) {
            conditions.country = { contains: country, mode: "insensitive" };
        }
        if (city) {
            conditions.city = { contains: city, mode: "insensitive" };
        }
        if (continent) {
            conditions.continent = { contains: continent, mode: "insensitive" };
        }

        let getAirports, count;

        if (showAll === "true") {
            getAirports = await prisma.airport.findMany({
                where: conditions,
            });
            count = getAirports.length;
        } else {
            getAirports = await prisma.airport.findMany({
                where: conditions,
                skip: offset,
                take: limit,
            });
            count = await prisma.airport.count({
                where: conditions,
            });
        }

        res.status(200).json({
            status: true,
            message: "All airports data retrieved successfully",
            totalItems: count,
            pagination:
                showAll === "true"
                    ? null
                    : {
                          totalPage: Math.ceil(count / limit),
                          currentPage: page,
                          pageItems: getAirports.length,
                          nextPage:
                              page < Math.ceil(count / limit) ? page + 1 : null,
                          prevPage: page > 1 ? page - 1 : null,
                      },
            data: getAirports.length !== 0 ? getAirports : "empty airport data",
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const getAirportById = async (req, res, next) => {
    const id = req.params.id;
    try {
        const getAirport = await prisma.airport.findUnique({
            where: {
                id: id,
            },
        });

        if (!getAirport)
            return next(createHttpError(404, { message: "Airport not found" }));

        res.status(200).json({
            status: true,
            message: "All airports data retrieved successfully",
            data: getAirport,
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const createNewAirport = async (req, res, next) => {
    try {
        const { name, code, country, city, continent } = req.body;
        const file = req.file;

        const getAirport = await prisma.airport.findUnique({
            where: {
                code: code,
            },
        });

        if (getAirport)
            return next(
                createHttpError(422, {
                    message: `Airport with code: ${code} already exist!`,
                })
            );

        let imageUrl;
        file
            ? (imageUrl = await uploadFile(file))
            : (imageUrl = "https://placehold.co/600x400");

        const newAirport = await prisma.airport.create({
            data: {
                id: randomUUID(),
                name,
                code,
                country,
                city,
                continent,
                image: imageUrl,
            },
        });

        res.status(201).json({
            status: true,
            message: "Airport created successfully",
            data: newAirport,
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const updateAirport = async (req, res, next) => {
    try {
        const { name, code, country, city, continent } = req.body;
        const file = req.file;

        const getAirport = await prisma.airport.findUnique({
            where: {
                id: req.params.id,
            },
        });
        if (!getAirport)
            return next(createHttpError(404, { message: "Airport not found" }));

        let imageUrl;
        !file
            ? (imageUrl = getAirport.image)
            : (imageUrl = await uploadFile(file));

        const updateAirport = await prisma.airport.update({
            where: {
                id: req.params.id,
            },
            data: {
                code,
                name,
                country,
                city,
                continent,
                image: imageUrl,
            },
        });

        res.status(201).json({
            status: true,
            message: "Airport updated successfully",
            data: updateAirport,
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

const deleteAirport = async (req, res, next) => {
    try {
        const getAirport = await prisma.airport.findFirst({
            where: {
                id: req.params.id,
            },
        });

        if (!getAirport)
            return next(createHttpError(404, { message: "Airport not found" }));

        await prisma.airport.delete({
            where: {
                id: req.params.id,
            },
        });

        res.status(200).json({
            status: true,
            message: "Airport deleted successfully",
        });
    } catch (error) {
        next(createHttpError(500, { message: error.message }));
    }
};

module.exports = {
    createNewAirport,
    updateAirport,
    getAllAirports,
    deleteAirport,
    getAirportById,
};
