const midtransClient = require("midtrans-client");
require("dotenv/config");

const coreApi = new midtransClient.CoreApi({
    isProduction: false,
    serverKey: process.env.SANDBOX_SERVER_KEY,
    clientKey: process.env.SANDBOX_CLIENT_KEY,
});

const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.SANDBOX_SERVER_KEY,
    clientKey: process.env.SANDBOX_CLIENT_KEY,
});

const iris = new midtransClient.Iris({
    isProduction: false,
    serverKey: process.env.SANDBOX_SERVER_KEY,
    clientKey: process.env.SANDBOX_CLIENT_KEY,
});

module.exports = { coreApi, snap, iris };
