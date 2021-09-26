const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../models/tourModel');
const APIfeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

// UPLOADING IMAGES
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image!!Please upload images only', 400), false);
    }
};
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
    // 1). imageCover
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`);

    // 2). images
    req.body.images = [];

    await Promise.all(
        req.files.images.map(async (file, idx) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${idx + 1}.jpeg`;
            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${filename}`);

            req.body.images.push(filename);
        })
    );
    next();
});

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
    // EXECUTE QUERY
    const features = new APIfeatures(Tour.find(), req.query).filter().sort().selectField().page();
    const tours = await features.query;

    res.status(200).json({
        status: 'sucess',
        requestTime: req.requestTime,
        results: tours.length,
        data: tours,
    });
});

exports.getTourById = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id).populate('reviews');

    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
        status: 'sucess',
        requestTime: req.requestTime,
        data: tour,
    });
});
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id);

//     if (!tour) {
//         return next(new AppError('No tour found with that ID', 404));
//     }

//     res.status(200).json({
//         status: 'successfully deleted',
//         data: null,
//     });
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
            $group: {
                _id: '$difficulty',
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRatings: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        },
        {
            $sort: { avgPrice: 1 },
        },
    ]);
    res.status(200).json({
        status: 'success',
        stats,
    });
});
