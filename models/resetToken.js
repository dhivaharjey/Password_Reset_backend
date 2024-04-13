import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const resetTokenSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: 3600,
    default: Date.now(),
  },
  // randomStringExpires: Date,
});
resetTokenSchema.pre("save", async function (next) {
  if (this.isModified("token")) {
    const hashedToken = await bcryptjs.hash(this.token, 10);
    this.token = hashedToken;
  }
  next();
});
resetTokenSchema.methods.comparePassword = async function (token) {
  const tokenMatch = await bcryptjs.compare(token, this.token);
  return tokenMatch;
};
const ResetToken = mongoose.model("resetToken", resetTokenSchema);
export default ResetToken;
