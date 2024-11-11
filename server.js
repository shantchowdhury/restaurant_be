import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from './routes/foodRouter.js';
import userRouter from "./routes/userRoute.js";
import "dotenv/config";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

// App config
const app = express();
const port = 4000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // Add both origins
    credentials: true // If you're sending cookies or authorization headers
}));


// Database connection
connectDB();

// API endpoints
app.use("/api/food", foodRouter);
app.use("/images", express.static('uploads'));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

app.get("/", (req, res) => {
    res.send("API Working");
});

app.listen(port, () => {
    console.log(`Server Started on http://localhost:${port}`);
});
