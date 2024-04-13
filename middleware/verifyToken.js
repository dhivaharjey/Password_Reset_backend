import User from "../models/user.js";
import crypto from "crypto";
export const verifyToken = async (req, res, next) => {
  const token = req.params.token;
  const tokenVerification = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  // console.log(tokenVerification);
  const user = await User.findOne({
    passwordResetToken: tokenVerification,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid Token or Expired" });
  }

  next();
};
