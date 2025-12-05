const generateToken = require("../lib/generateToken");
const user = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.postSignup = async (req, res) => {
  const { email, password, userName } = req.body;
  console.log("Signup attempt:", { email, userName });

  if (!email || !password || !userName) {
    return res.status(400).json({
      message: "Please provide all the fields (email, password, userName)",
    });
  }

  try {
    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await user.create({
      userName,
      email,
      password: hashedPassword, // Fix: Use 'password' instead of 'hashedPassword'
    });

    await generateToken(newUser._id, res);
    console.log("Signup successful for user:", newUser.userName);

    return res
      .status(201)
      .json(newUser);
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Server error during signup" });
  }
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for email:", email);

    const existingUser = await user.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: "User doesn't exists" });
    }

    const isCorrectPassword = await bcrypt.compare(
      password,
      existingUser.password // Fix: Use 'password' instead of 'hashedPassword'
    );
    if (!isCorrectPassword) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    await generateToken(existingUser._id, res);
    console.log("Login successful for user:", existingUser.userName);

    return res
      .status(200)
      .json(existingUser );
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

exports.postLogout = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) res.status(401).json({ message: "Login First" });
    res.clearCookie("token");
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(401).json({ message: "Server Error" });
  }
};

exports.checkUser = async (req, res) => {
  try {
    const token = req.cookies.token;
    console.log("Checking user with cookies:", token);
    console.log("All cookies:", req.cookies);

    if (!token) {
      console.log("No token found in cookies");
      return res.status(401).json({ message: "Not a user" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    if (!decoded || !decoded.userId) {
      console.log("Invalid token or no userId in token");
      return res.status(401).json({ message: "Not a user" });
    }

    const userData = await user.findById(decoded.userId);
    console.log(
      "Found user data:",
      userData ? userData.userName : "No user found"
    );

    if (!userData) {
      return res.status(401).json({ message: "User not found" });
    }

    return res.status(200).json(userData);
  } catch (error) {
    console.error("CheckUser error:", error.message);
    return res.status(401).json({ message: "Not a user" });
  }
};
