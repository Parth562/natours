const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review Can not be empty'],
            minlength: 5,
            trim: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'A review must belong to a Tour'],
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'A review must have an author'],
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

reviewSchema.pre(/^find/, function (next) {
    this.populate({ path: 'user', select: 'name photo' });

    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
