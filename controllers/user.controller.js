import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloud.js";

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, cnic, role } = req.body;
        const file = req.file; // Multer se aayega agar form-data use kiya

        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({ message: "All fields are required", success: false });
        }

        const existingUser = await User.findOne({ $or: [{ email }] });
        if (existingUser) {
            const field = existingUser.email === email ? "Email" : "CNIC";
            return res.status(400).json({ message: `${field} already exists`, success: false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // --- SAFE FILE UPLOAD LOGIC ---
        let profilePhotoUrl = "";

        if (file) {
            // Agar file upload hui hai (form-data), toh Cloudinary par bhejein
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            profilePhotoUrl = cloudResponse.secure_url;
        } else if (req.body.profilePhoto) {
            // Agar file nahi hai par JSON mein dummy URL hai, toh use le lein
            profilePhotoUrl = req.body.profilePhoto;
        }

        await User.create({
            fullname,
            email,
            phoneNumber,
            cnic,
            password: hashedPassword,
            role,
            profile: { 
                profilePhoto: profilePhotoUrl 
            }
        });

        return res.status(201).json({ 
            message: `Account created for ${fullname}`, 
            success: true 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", success: false });
    }
};

// --- 2. LOGIN ---
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role) {
            return res.status(400).json({ message: "All fields are required", success: false });
        }

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Incorrect email or password", success: false });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect email or password", success: false });
        }

        // Role verify karein (Student/Recruiter)
        if (user.role !== role) {
            return res.status(403).json({ message: "Invalid role for this account", success: false });
        }

        const tokenData = { userId: user._id };
        const token = jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        return res.status(200).cookie("token", token, { 
            maxAge: 1 * 24 * 60 * 60 * 1000, 
            httpOnly: true, 
            sameSite: 'strict' 
        }).json({
            message: `Welcome back ${user.fullname}`,
            user: { _id: user._id, fullname: user.fullname, email: user.email, role: user.role, profile: user.profile },
            success: true
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", success: false });
    }
};

// --- 3. LOGOUT ---
export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out successfully",
            success: true
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", success: false });
    }
};

// --- 4. UPDATE PROFILE ---
export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;
        const file = req.file;
        const userId = req.id; 

        let user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found", success: false });

        if (fullname) user.fullname = fullname;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (bio) user.profile.bio = bio;
        if (skills) user.profile.skills = skills.split(",");

        if (file) {
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            user.profile.resume = cloudResponse.secure_url;
            user.profile.resumeOriginalName = file.originalname;
        }

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            user: { _id: user._id, fullname: user.fullname, email: user.email, role: user.role, profile: user.profile },
            success: true
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating profile", success: false });
    }
};