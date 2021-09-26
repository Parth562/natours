const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path} : ${err.value}.`;
    const error = new AppError(message, 400);
    return error;
};

const handleDuplicateFieldsDB = (err) => {
    const message = `Duplicate field ${{ ...err.keyPattern }}.  Please use another value`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join('.')}`;
    return new AppError(message, 400);
};

const handleJWTError = (err) => new AppError('Invalid token. Please login again', 401);

const sendErrorDev = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            error: err,
            stack: err.stack,
        });
    } else {
        res.status(err.statusCode).render('error', {
            title: 'Somethin went wrong',
            message: err.message,
        });
    }
};

const sendErrorProd = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational === true) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        } else {
            res.status(500).json({
                status: 'fail',
                message: 'Somethin went very wrong...',
            });
        }
    } else {
        if (err.isOperational === true) {
            res.status(err.statusCode).render('error', {
                title: 'Somethin went wrong',
                message: err.message,
            });
        } else {
            res.status(err.statusCode).render('error', {
                title: 'Somethin went wrong',
                message: 'please try again',
            });
        }
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'devlopment') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };

        error.message = err.message;

        if (error.name === 'CastError') {
            error = handleCastErrorDB(error);
        }

        if (error.code === 11000) {
            error = handleDuplicateFieldsDB(error);
        }

        if (error.name === 'ValidationError') {
            error = handleValidationErrorDB(error);
        }

        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            error = handleJWTError(error);
        }

        sendErrorProd(error, req, res);
    }
};
