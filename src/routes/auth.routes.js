const express = require('express');
const router = express.Router();
const UserController = require('../controller/UserController');
const ContactController = require('../controller/ContactController');
const authorizationMiddleware = require('../misc/middlewares/authorization-middleware'); // ✅ your middleware

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);
router.post('/refresh-token', UserController.refreshToken);

router.patch('/update-password', authorizationMiddleware(), UserController.updatePassword);
router.patch('/update-profile', authorizationMiddleware(), UserController.updateProfile);
router.patch('/set-user-status', authorizationMiddleware(['ADMIN']), UserController.setUserStatus);

router.get('/users', authorizationMiddleware(['ADMIN']), UserController.getAllUsers);
router.get('/profile/:id', UserController.getUserById);

// Contact form route (public - no authentication required)
router.post('/contact', ContactController.sendContactForm);

module.exports = router;
