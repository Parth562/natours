const mongoose = require('mongoose');
const User = require('./userModel');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: [true, 'Name must be unique'],
            trim: true,
            minlength: [10, 'Tour name must be at least 10 character'],
            maxlength: [40, 'A Tour name must have atmost 40 char'],
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration'],
        },
        difficulty: {
            type: String,
            required: [true, 'A tour must have a difficulty'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty must be easy , medium or difficult',
            },
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a group size'],
        },
        price: {
            type: Number,
            required: [true, 'A tour mus t have a price..'],
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be greater than equal to 1'],
            max: [5, 'Rating must be less than equal to 5s'],
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (val) {
                    return val < this.price;
                },
                message: 'Discount should be less than regular price',
            },
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a summary'],
        },
        description: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have an image cover'],
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false,
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false,
            select: false,
        },
        startLocation: {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point'],
            },
            coordinates: [Number],
            address: String,
            description: String,
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point'],
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number,
            },
        ],
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// Virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id',
});

tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// tourSchema.pre('save', async function (next) {
//     const guidePromises = this.guides.map(async (id) => await User.findById(id));
//     this.guides = await Promise.all(guidePromises);
//     next();
// });

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    next();
});

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt',
    });
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
