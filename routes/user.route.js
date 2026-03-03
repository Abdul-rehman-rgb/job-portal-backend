import express from 'express';  
import { login, register, updateProfile, logout } from '../controllers/user.controller.js';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { singleUpload } from '../middleware/multer.js'; // Multer middleware

const router = express.Router();

// --- 1. REGISTER (With File Upload) ---
router.route("/register").post(singleUpload, register);

// --- 2. LOGIN ---
router.route("/login").post(login);

// --- 3. LOGOUT ---
router.route("/logout").get(logout); // Logout usually GET request hoti hai

// --- 4. UPDATE PROFILE (Protected Route + File Upload) ---
router.route("/profile/update").put(isAuthenticated, singleUpload, updateProfile);

export default router;