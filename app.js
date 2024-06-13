const express = require("express");
const cors = require("cors");
const router = require("./routes");
const logger = require("morgan");
const { MORGAN_FORMAT } = require("./config/logger");
const helmet = require("helmet");
const { rateLimit } = require("./lib/rateLimit");

const app = express();

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

//* configuration to allow all origins and specific methods and headers.
app.use(
    cors({
        origin: "*",
        methods: "GET, POST, PUT, DELETE",
        allowedHeaders: "Content-Type, Authorization",
    })
);

//* Limit hit API from the same IP only 100 times per 15 minutes
app.use(
    rateLimit(
        15 * 60 * 1000,
        100,
        "Too many requests from this IP, please try again later.",
        true
    )
);

app.use(helmet());
app.use(express.json());
app.use(logger(MORGAN_FORMAT));
app.use(express.urlencoded({ extended: true }));

app.use(router);

//* Error Response Handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        status: false,
        message: err.message,
    });
});

//* 404 Response Handler
app.use((req, res) => {
    const url = req.url;
    const method = req.method;
    res.status(404).json({
        status: false,
        code: 404,
        method,
        url,
        message: "Not Found!",
    });
});

module.exports = app;
