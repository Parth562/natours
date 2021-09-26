const path = require('path');
const express = require('express');
const morgan = require('morgan');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const tourRouter = require('./routes/tourRoutes.js');
const userRouter = require('./routes/userRoutes.js');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

//start express engine
const app = express();

app.use(cors());

app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.cookies);
    next();
});

app.use(morgan('dev'));

// PREVENT PARAMETER POLLUTION
app.use(hpp());

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
