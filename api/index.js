import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import listingRouter from "../api/routes/listing.route.js"

//configuration
dotenv.config();
const app = express();
app.use(express.json()); // allow server to json data
app.use(cookieParser())

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("MongoDB connection Error", err);
  });

app.listen(3000, () => {
  console.log("Server is runnig on PORT 3000!!!!");
});

//api routing authentication
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listing", listingRouter)

//middle ware for handlinf error
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).
  json({
    success: false,
    message,
    statusCode,
  });
});
