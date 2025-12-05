const jwt = require("jsonwebtoken");

const validateToken = (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log("Validating token:", req.cookies);
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId)
      return res.status(401).json({ message: "Unauthorized" });

    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

module.exports = validateToken;
