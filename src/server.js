const express = require('express');
const morgan = require('morgan');

const app = express();
const apiRouter = require('./resources/api.router');

function middlewareForAllowOrigin(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
}

app.use('/api/', [
    middlewareForAllowOrigin,
    express.json(),
    express.urlencoded({ extended: true }),

    // Hanlde
    apiRouter
]);

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

module.exports = app; 