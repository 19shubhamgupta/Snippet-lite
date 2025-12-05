const jwt = require("jsonwebtoken");

const generateToken = async (userId, res) => {
  try {
    const token = await jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("Generated token for userId:", userId);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax", // Allow cross-site requests
      secure: false, // Set to false for localhost
    });

    console.log("Cookie set with token");
    return token;
  } catch (error) {
    console.error("Error generating token: ", error);
  }
};
module.exports = generateToken;
