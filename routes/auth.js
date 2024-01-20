const express = require('express');
const authController = require('../controller/authcontroller.js');

const router = express.Router();

const { protect } = require('../middleware/aauth');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// router.post('/register', upload.single('photo'), authController.register);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
//router.get('/token', authController.sendTokenResponse);
router.get('/me', protect, authController.getMe);
router.put('/updatedetails', protect, authController.updateDetails);
router.put('/updatepassword', protect, authController.updatePassword);
router.post('/forgotpassword', authController.forgotPassword);
router.put('/resetpassword/:resettoken', authController.resetPassword);

module.exports = router;
