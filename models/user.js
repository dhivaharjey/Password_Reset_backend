import mongoose from "mongoose";
import bcrypt from "bcryptjs-react";
// import crypto from "crypto";
const userSchema = new mongoose.Schema({
  // name: {
  //   type: String,
  //   required: true,
  //   trim: true,
  // },
  userName: {
    type: String,
    required: true,
    maxlength: 32,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },

  passwordResetToken: String,
  passwordResetTokenExpires: Date,
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
  }
  next();
});
userSchema.methods.comparePassword = async function (password) {
  const passwordMatch = await bcrypt.compare(password, this.password);
  return passwordMatch;
};
// userSchema.methods.createPasswordResetToken = function () {
//   const resetToken = crypto.randomBytes(32);
//   this.passwordResetToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");
//   this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
//   return resetToken;
// };
const User = mongoose.model("User", userSchema);
export default User;
