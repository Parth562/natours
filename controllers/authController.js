const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
const { hash } = require('bcryptjs');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + 1000 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        domain: null,
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);

    const token = signToken(newUser._id);
    res.status(201).json({
        status: 'sucess',
        token,
        data: {
            newUser,
        },
    });
});

exports.signin = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please enter email and password!', 400));
    }
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Please enter a valid email and password', 401));
    }
    createSendToken(user, 200, res);
});

exports.logOut = (req, res) => {
    res.cookie('jwt', 'loggedoutdkfjhsdlkfskjdfhgdifghdifghkjdfh', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
    // 1) getting token and check if it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        return next(new AppError('You are not logged in. Please log in to get access', 400));
    }

    // 2) verification of token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
        return next(new AppError('USer does not exist', 401));
    }

    // 4) Check if password has been changed after the token was issued
    if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed the password. Please login again'));
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = freshUser;
    res.locals.user = freshUser;
    next();
});

exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            // 1) verification of token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

            // 2) Check if user still exists
            const freshUser = await User.findById(decoded.id);
            if (!freshUser) {
                return next();
            }

            // 3) Check if password has been changed after the token was issued
            if (freshUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            // put freshUser data to response.locals
            res.locals.user = freshUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) get user based on posted email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new AppError('User does not exist', 404));
    }

    // 2) Generate password reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send email to user
    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password ? click on the below link to change your password \n ${resetURL} \n If not ignore this email`;

    sendEmail({
        email: req.body.email,
        subject: 'Change your password',
        message,
    });

    res.status(200).json({
        status: 'success',
        message: 'check your email',
    });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    // 2) Check if user exists and Token hasn't expired
    if (!user) {
        return next(new AppError('Token is invalid or expired', 400));
    }

    // Change the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    // Log in the user
    const token = signToken(user._id);

    res.status(200).json({
        status: 'sucess',
        token,
    });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password is wrong.', 401));
    }

    // 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // User.findByIdAndUpdate will NOT work as intended!

    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
});
