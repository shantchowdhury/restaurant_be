import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    // Extract token from the authorization header
    const token = req.headers.authorization?.split(" ")[1];

    // If no token is provided, respond with an error
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET || 'default-secret', (err, decoded) => {
        if (err) {
            return res.status(403).json({ success: false, message: "Invalid token" });
        }

        // Set userId from the decoded token
        req.userId = decoded.id; // Make sure 'id' corresponds to the key used in your JWT payload
        next(); // Proceed to the next middleware or route handler
    });
};

export default authMiddleware;
