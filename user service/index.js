const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectdb = require("./lib/db");
const userRouter = require("./routes/userRouter");

require("dotenv").config();

const app = express();

app.use(cookieParser()); // Add cookie parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cors()); // Disabled - CORS handled by Nginx

app.use("/auth", userRouter);

app.listen(8002, async () => {
  try {
    console.log("Connecting to MongoDB...");
    await connectdb();
    console.log(`listening to port 8002`);
  } catch (error) {
    console.error("error in starting the user service ", error);
  }
});
