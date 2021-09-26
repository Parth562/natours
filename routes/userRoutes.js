const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const userRouter = express.Router();

userRouter.route('/signup').post(authController.signup);
userRouter.route('/login').post(authController.signin);
userRouter.route('/logout').get(authController.logOut);

userRouter.route('/forgotPassword').post(authController.forgotPassword);
userRouter.route('/resetPassword/:token').patch(authController.resetPassword);

userRouter.use(authController.protect);

userRouter.patch(
    '/updateMe',
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe
);
userRouter.delete('/deleteMe', userController.deleteMe);
userRouter.patch('/updateMyPassword', authController.updatePassword);

userRouter.route('/').get(userController.getAllUsers).post(userController.createUser);
userRouter
    .route('/:id')
    .get(userController.getUserById)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = userRouter;
