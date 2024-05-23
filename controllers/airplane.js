const { PrismaClient } = require("@prisma/client");
const { uploadFile } = require("../lib/supabase");

const prisma = new PrismaClient();

const getAllAirplane = async (req, res) => {
  try {
    const airplane = await prisma.airplane.findMany();
    res.status(200).json({
      status: true,
      message: "all airplane data retrieved successfully",
      data: airplane,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAirplaneById = async (req, res) => {
  try {
    const airplane = await prisma.airplane.findUnique({
      where: { id: req.params.id },
    });
    res.status(200).json({
      status: true,
      message: "airplane data retrieved successfully",
      data: airplane,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createAirplane = async (req, res) => {
  const { code, name } = req.body;
  const file = req.file;

  try {
    const imageUrl = await uploadFile(file);

    const newAirplane = await prisma.airplane.create({
      data: {
        code,
        name,
        image: imageUrl,
      },
    });
    res.status(200).json({
      status: true,
      message: "airplane created successfully",
      data: newAirplane,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateAirplane = async (req, res) => {
  const { code, name } = req.body;
  const file = req.file;

  try {
    const imageUrl = await uploadFile(file);

    const airplane = await prisma.airplane.findUnique({
      where: { id: req.params.id },
    });

    if (!airplane) {
      return res.status(404).json({ message: "Airplane not found" });
    }

    const updatedAirplane = await prisma.airplane.update({
      where: { id: req.params.id },
      data: {
        code,
        name,
        image: imageUrl,
      },
    });
    res.status(200).json({
      status: true,
      message: "airplane updated successfully",
      data: updatedAirplane,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteAirplane = async (req, res) => {
  try {
    await prisma.airplane.delete({
      where: { id: req.params.id },
    });
    res.status(200).json({
      status: true,
      message: "airplane deleted successfully",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getAllAirplane,
  getAirplaneById,
  createAirplane,
  updateAirplane,
  deleteAirplane,
};
