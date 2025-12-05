const express = require("express");
const cors = require("cors");
const connectdb = require("./lib/db");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const executeRouter = require("./routes/executeRouter");
const { initializeBroker } = require("./controllers/executecontroller");

dotenv.config();
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", executeRouter);

app.get("/health", (req, res) => {
  res.json({ service: "execution", status: "healthy", port: 8003 });
});

app.listen(8003, async () => {
  try {
    initializeBroker();
    console.log(`listening to port 8003`);
  } catch (error) {
    console.error("error in starting the user service ", error);
  }
});
