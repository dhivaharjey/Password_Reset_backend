import User from "../models/user.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { Console } from "console";
dotenv.config();
export const registerUser = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    const registeredUser = await User.findOne({ email });
    if (registeredUser) {
      return res.status(401).json({
        status: false,
        message: "Email or User Already Exists!! Log In",
      });
    }
    // const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      userName,
      email,
      password,
      // password: hashedPassword,
    });
    await newUser.save();

    res
      .status(200)
      .json({ status: true, message: "Regitered Successfully!!!", newUser });
    // sendError(res, "Regitered Successfully!!!");
  } catch (error) {
    res.status(500).json({ Error: "Internal server errors" });
  }
};
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Invalid User Email or User Not Found!!",
      });
      // return sendError(res, "Invalid User Email or User Not Found!!");
    }

    // const passwordMatch = await bcrypt.compare(password, user.password);
    const isMatched = await user.comparePassword(password);
    if (!isMatched) {
      // return sendError(res, "Invalid Password");
      return res
        .status(401)
        .json({ status: false, message: "Invalid Password" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "5h",
    });
    user.token = token;
    user.save();
    res.cookie("token", token, { httpOnly: true, maxAge: 360000 });
    res.status(200).json({
      status: true,
      message: "Login Successfully!!",
      data: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server errors" });
    console.log(error);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ status: false, message: "User not found or  Invalid User!!" });
    }
    if (
      user.passwordResetTokenExpires &&
      user.passwordResetTokenExpires > Date.now()
    ) {
      const timeLeft = Math.ceil(
        (user.passwordResetTokenExpires - Date.now()) / (1000 * 60)
      ); // Convert milliseconds to minutes
      if (timeLeft < 60) {
        return res.status(401).json({
          status: false,
          message: `Already Token is sent ,Please try again after ${timeLeft} minutes`,
        });
      } else {
        const hoursLeft = Math.ceil(timeLeft / 60);
        return res.status(401).json({
          status: false,
          message: `Please try again after ${hoursLeft} hours`,
        });
      }
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const resetTokenExpires = Date.now() + 10 * 60 * 1000;
    console.log(hashedToken, resetToken);
    // const resetToken = user.createReset;
    user.passwordResetToken = hashedToken;
    user.passwordResetTokenExpires = resetTokenExpires;
    await user.save();

    const link = `https://jd-forgot-password.netlify.app/reset-password/${resetToken}`;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    const mailOptions = {
      from: "example@gmail.com",
      to: email,
      subject: "Password Reset Link",
      text: "Reset Password",
      html: `
      <p>Hello ${user.userName},</p>
    <p>You have requested to reset your  password. Click the button below to reset it:</p>
    <a href="${link}">
      <button style="padding: 10px; background-color: #0A0A0A; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Reset iCloud Password
      </button>
    </a>
      <h2>  Click the link to reset password <a href=${link}>click here</a></h2>`,
    };

    transporter.sendMail(mailOptions, function (error) {
      if (error) {
        return res
          .status(400)
          .json({ status: false, message: "Internal server error" });
      } else {
        return res
          .status(200)
          .json({ status: true, message: "Link is sent to your email" });
      }
      //  return res.status(200).json({ message: "Link is sent to your email" });
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server errors" });
  }
};
export const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
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

    const isMatched = await user.comparePassword(newPassword);
    if (isMatched) {
      return res.status(400).json({
        status: false,
        message: "Similar to old Password , Enter New password",
      });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.save();
    res
      .status(200)
      .json({ status: true, message: "Password reset is successsful" });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ status: false, message: "Invalid token" });
  }
};
