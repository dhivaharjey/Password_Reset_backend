import express from "express";
import {
  forgotPassword,
  loginUser,
  registerUser,
  resetPassword,
} from "../controllers/user.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", verifyToken, resetPassword);
router.get("/verify-token/:token", verifyToken, (req, res) => {
  return res
    .status(200)
    .json({ status: true, message: "Token is verified and Valid Token " });
});

export default router;
