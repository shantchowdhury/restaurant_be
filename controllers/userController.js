import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// Function to generate a JWT token
const createToken = (id) => {
  const secretKey = process.env.JWT_SECRET || 'default-secret';  // Fallback to 'default-secret'

  // Log JWT secret only in development mode
  if (process.env.NODE_ENV !== 'production') {
    console.log("JWT_SECRET:", secretKey);  // For debugging only
  }

  return jwt.sign({ id }, secretKey, { expiresIn: '1h' });  // Token expires in 1 hour
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Find the user by email
    const user = await userModel.findOne({ email });

    // If the user doesn't exist
    if (!user) {
      return res.status(404).json({ success: false, message: "User doesn't exist" });
    }

    // Compare the input password with the hashed password in the DB
    const isMatch = await bcrypt.compare(password, user.password);

    // If passwords don't match
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Create a JWT token for the user
    const token = createToken(user._id);

    // Return success response with the token
    return res.status(200).json({ success: true, token });
    
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};

// Register user
const registerUser = async (req, res) => {
  const { name, password, email } = req.body;
  
  try {
    // Checking if the user already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Validating email format & strong password
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email" });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }

    // Hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword
    });

    const user = await newUser.save();
    const token = createToken(user._id);
    return res.status(201).json({ success: true, token });
    
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};

// Export both loginUser and registerUser
export { loginUser, registerUser };
