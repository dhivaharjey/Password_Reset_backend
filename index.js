import express from "express";
import cors from "cors";
import dontenv from "dotenv";
import connectDb from "./Database/db.js";
import userRouter from "./routers/user.js";
// import cookieParser from "cookie-parser";
dontenv.config();
const port = process.env.PORT;
const app = express();
app.use(cors());
app.use(express.json());
// app.use(cookieParser());
connectDb();
app.use("/user", userRouter);
app.listen(port, () => {
  console.log("App is running in the port", port);
});
