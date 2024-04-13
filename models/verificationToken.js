import mongoose from "mongoose";
import bcrypt from "bcrypt";

const verificationTokenSchema = new mongoose.Schema({
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
verificationTokenSchema.pre("save", async function (next) {
  if (this.isModified("token")) {
    const hashedToken = await bcrypt.hash(this.token, 10);
    this.token = hashedToken;
  }
  next();
});
verificationTokenSchema.methods.comparePassword = async function (token) {
  const tokenMatch = await bcrypt.compare(token, this.token);
  return tokenMatch;
};
const verificationToken = mongoose.model(
  "verificationToken",
  verificationTokenSchema
);
export default verificationToken;
