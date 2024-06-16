// const { randomUUID } = require("crypto");
// const crypto = require("crypto"); 
// const {coreApi, snap, iris} = require("../../../config/coreApiMidtrans")
// const createHttpError = require("http-errors");
// const {
//     dataCustomerDetail,
//     dataItemDetail,
//     totalPrice,
// } = require("../../../utils/parameterMidtrans");
// const { unescape } = require("querystring");
// const { PrismaClient } = require("@prisma/client");
// const { checkSeatAvailability } = require("../../../utils/checkSeat");
// const {
//     extractFirstData,
//     extractSecondData,
// } = require("../../../utils/extractItems");
// const prisma = new PrismaClient();

// jest.mock("@prisma/client", () => {
//     const mPrismaClient = {
//         $transaction: jest.fn(),
//         flightSeat: {
//             findMany: jest.fn()
//         }
//     }
// })