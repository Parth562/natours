const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const stripe = require('stripe')(
    'sk_test_51JdRIKSBodr645W00AYzocKHvyYrp3sRru8ks8Z4KO9J2YoUcVEBgJlfK8SBeUL54Mp99gowp5rtewy5dYQqnPPL00dRdtWg4S'
);
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.getCheckOutSession = catchAsync(async (req, res, next) => {
    // 1) get the currently booked tour
    const tour = await Tour.findById(req.params.tourId);

    // 2) Create cheackout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${tour._id}&user=${
            req.user.id
        }&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                name: `${tour.name} tour`,
                description: tour.summary,
                images: ['#'],
                amount: tour.price * 100,
                currency: 'inr',
                quantity: 1,
            },
        ],
    });
    res.status(200).json({
        status: 'success',
        session,
    });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    const { tour, user, price } = req.query;

    if (!tour || !user || !price) return next();

    await Booking.create({ tour, user, price });

    res.redirect(req.originalUrl.split('?')[0]);
});
