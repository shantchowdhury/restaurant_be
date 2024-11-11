import express from "express";
import authMiddleware from "../middleware/auth.js";
import { placeOrder, verifyOrder, userOrders, listOrders, updateStatus } from "../controllers/orderController.js";

const orderRouter = express.Router();

// Route to place an order
orderRouter.post('/place', authMiddleware, placeOrder);

// Route to verify an order 
orderRouter.get('/verify', authMiddleware, verifyOrder);

// Route to get user orders (use GET for fetching data)
orderRouter.post('/userorders', authMiddleware, userOrders);

orderRouter.get('/list',listOrders)

orderRouter.post("/status",updateStatus)

export default orderRouter;
