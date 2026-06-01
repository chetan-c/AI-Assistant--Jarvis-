import genToken from "../config/token.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs"; // fixed typo in import

// SIGN UP
export const signUp = async (req, res) => {
  try {
    console.log("Signup Request Received:", req.body);
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields (name, email, password) are required" });
    }

    const existEmail = await User.findOne({ email });
    if (existEmail) {
      return res.status(400).json({ message: "Email already exists!" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      password: hashedPassword,
      email,
    });

    const token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: "strict",
      secure: false, // Set to true if using HTTPS
    });

    console.log("User created successfully:", user._id);
    return res.status(201).json(user);

  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ message: "Sign up error", error: error.message });
  }
};



// LOGIN
export const Login = async (req, res) => {
  try {
    console.log("Login Request Received:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: "strict",
      secure: false,
    });

    console.log("Login successful for user:", user.email);
    return res.status(200).json(user);

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Login error", error: error.message });
  }
};


export const logOut = async (req, res) => {
  try {
    res.clearCookie("token"); 
    return res.status(200).json({ message: "Logout successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Logout error: ${error}` });
  }
};
