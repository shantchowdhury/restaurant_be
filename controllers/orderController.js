import pkg from 'jsonwebtoken';
const { verify } = pkg;

import authMiddleware from "../middleware/auth.js";
import orderModel from "../models/orderModel.js";
import userModel from '../models/userModel.js';
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();
// Initialize Stripe using the environment variable
const stripe = new Stripe('sk_test_51O3ZxLCI6CQUDpsba9nxADPmkmW3PWIlTnBIrHuoel6mlmWAarELshZegqxeAfQgRIruKGtJ6dAk8kQ4zL8TaAvv00w1nzAKNZ'); // Use correct import and initialization

// Placing user order for frontend
const placeOrder = async (req, res) => {
    const frontend_url = "http://localhost:5174"; // Ensure this points to your frontend

    try {
        console.log("Placing order...");

        // Create a new order in the database
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
        });

        // Save the order
        await newOrder.save();
        console.log("Order saved in the database:", newOrder);

        // Clear the user's cart data after placing the order
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });
        console.log("User's cart data cleared.");

        // Prepare line items for Stripe checkout
        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: "BDT", // Ensure currency is set to Bangladeshi Taka
                product_data: {
                    name: item.name,
                },
                unit_amount: item.price * 100, // Stripe expects amount in the smallest currency unit (i.e., paisa)
            },
            quantity: item.quantity,
        }));

        // Adding delivery charges as a line item
        line_items.push({
            price_data: {
                currency: "BDT",
                product_data: {
                    name: "Delivery Charges",
                },
                unit_amount: 10 * 100, // Delivery charge in BDT (10 BDT)
            },
            quantity: 1,
        });

        console.log("Line items prepared for Stripe checkout:", line_items);

        // Create a Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: 'payment',
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`, // Redirect to frontend on success
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`, // Redirect to frontend on cancel
        });

        console.log("Stripe session created:", session);

        // Send the session URL back to the client
        res.json({ success: true, session_url: session.url });

    } catch (error) {
        // Log the error for debugging
        console.error("Error placing the order:", error);

        // Respond with an error message
        res.json({ success: false, message: "Error placing the order" });
    }
};
const verifyOrder = async (req, res) => {
    const { orderId, success } = req.query;  // Ensure you're reading from req.query for GET
    console.log("Order verification:", { orderId, success });

    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Paid" });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Not Paid" });
        }
    } catch (error) {
        console.error("Error verifying the order:", error);
        res.json({ success: false, message: "Error verifying the order" });
    }
};

// user orders for frontend
const userOrders = async (req, res) => {
    try {
        // Use req.userId set by authMiddleware
        const orders = await orderModel.find({ userId: req.userId }); // Now using req.userId
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error retrieving orders" });
    }
};

// Listing orders for admin panel
const listOrders = async (req,res) =>{
    try {
        const orders =await orderModel.find({});
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}
// api for updating order status
const updateStatus = async (req,res) =>{
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status})
        res.json({success:true,message:"Status Updated"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

export { placeOrder,verifyOrder,userOrders,listOrders,updateStatus};
