
const express = require('express');
const router = express.Router();
const userController = require('../controllers/AdminLog');

router.post("/signup-check", userController.checkMember);
router.post("/signup-request", userController.signupRequest);
router.post("/verify-otp", userController.verifyOtp);
router.post("/reset-password", userController.resetPassword);

router.post('/complete-signup', userController.completeSignup);

//  LogIn user (or) Admin
router.post('/login', userController.login);

router.get("/users", userController.getUsers);

router.get("/users/cemetery-managers", userController.getCemeteryManagers);

router.put("/users/update-role", userController.updateUserRole);

// Admin creates user with roles before signup
router.post("/users/create-by-admin", userController.createUserByAdmin);


module.exports = router;


