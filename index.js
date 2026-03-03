import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoutes from "./routes/user.route.js";
import companyRoutes from "./routes/company.route.js";
import jobRoutes from "./routes/job.route.js";
import applicationRoutes from "./routes/application.route.js";

// 1. Config load karein
dotenv.config();

const app = express();

// 2. CORS Options (Behtar hai ise .env se connect karein)
const corsOptions = {
  origin: ["https://job-portal-frontend-seven-sable.vercel.app"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// 3. Middlewares (Inhe hamesha Routes se upar rakhein)
app.use(cors(corsOptions)); // Sabse pehle CORS taaki request block na ho
app.options('*', cors(corsOptions));
app.use(express.json());    // Body parse karne ke liye
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

connectDB();

// 4. Routes
app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "Hello World!", 
    timestamp: new Date().toISOString(), 
    success: true 
  });
});

app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// 5. Port aur Server Start
const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});