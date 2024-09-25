import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from './routes/user.routes.js'; // Ensure this path is correct

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes declaration
app.use("/api/v1/users", userRoutes); // Use userRoutes instead of userRouter

// http://localhost:8000/api/v1/users/register

export { app };
