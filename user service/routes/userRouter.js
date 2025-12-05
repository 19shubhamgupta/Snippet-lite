const validateToken = require("../../snippet service/middlewares/validateToken");
const { postSignup, postLogin ,postLogout , checkUser } = require("../controllers/userController");

const express = require("express");

const userRouter = express.Router();

userRouter.post("/signup", postSignup);
userRouter.post("/login", postLogin);
userRouter.post("/logout", postLogout);
userRouter.get("/check",  checkUser);


module.exports = userRouter;