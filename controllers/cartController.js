import userModel from "../models/userModel.js";

// Helper function to find user
const findUserById = async (userId) => {
    return await userModel.findById(userId);
};

// Add items to user cart
const addToCart = async (req, res) => {
    const { itemId } = req.body; // Destructure itemId from request body
    const userId = req.userId; // Get userId from the middleware

    // Validate itemId
    if (!itemId) {
        return res.status(400).json({ success: false, message: "Missing itemId" });
    }

    try {
        const userData = await findUserById(userId);

        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Initialize cartData if not present
        let cartData = userData.cartData || {};

        // Update cart data
        cartData[itemId] = (cartData[itemId] || 0) + 1;

        // Update user document and return the updated user data
        const updatedUser = await userModel.findByIdAndUpdate(userId, { cartData }, { new: true });

        res.json({ success: true, message: "Item added to cart", cartData: updatedUser.cartData });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ success: false, message: "An error occurred while adding to cart" });
    }
};

// Remove items from user cart
const removeFromCart = async (req, res) => {
    const { itemId } = req.body; // Destructure itemId from request body
    const userId = req.userId; // Get userId from the middleware

    // Validate itemId
    if (!itemId) {
        return res.status(400).json({ success: false, message: "Missing itemId" });
    }

    try {
        const userData = await findUserById(userId);

        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Initialize cartData if not present
        let cartData = userData.cartData || {};

        // Check if the item is in the cart
        if (cartData[itemId]) {
            cartData[itemId] -= 1;

            // If quantity becomes 0, remove the item from the cart
            if (cartData[itemId] <= 0) {
                delete cartData[itemId];
            }

            // Update user document and return the updated cart data
            const updatedUser = await userModel.findByIdAndUpdate(userId, { cartData }, { new: true });
            res.json({ success: true, message: "Item removed from cart", cartData: updatedUser.cartData });
        } else {
            res.status(404).json({ success: false, message: "Item not in cart" });
        }
    } catch (error) {
        console.error("Error removing from cart:", error);
        res.status(500).json({ success: false, message: "An error occurred while removing from cart" });
    }
};

// Fetch user cart data
const getCart = async (req, res) => {
    const userId = req.userId; // Get userId from the middleware

    if (!userId) {
        return res.status(400).json({ success: false, message: "Missing userId" });
    }

    try {
        const userData = await findUserById(userId);

        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const cartData = userData.cartData || {};
        res.json({ success: true, cartData });
    } catch (error) {
        console.error("Error fetching cart data:", error);
        res.status(500).json({ success: false, message: "An error occurred while fetching cart data" });
    }
};

export { addToCart, removeFromCart, getCart };
