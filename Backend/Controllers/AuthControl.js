const { UserModel } = require("../Models/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");

//signup controller
const signup = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      collegeName,
      department,
      yearOfStudy,
      password,
    } = req.body;

    if (!fullName || !email || !phoneNumber || !collegeName || !department || !yearOfStudy || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return res.status(400).json({ message: "An account with this email already exists." });
      }
      await UserModel.deleteOne({ email });
    }

    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      fullName,
      email,
      phoneNumber,
      collegeName,
      department,
      yearOfStudy,
      password: hashedPassword,
      emailVerificationToken: emailOtp,
      emailVerificationExpiry: Date.now() + 10 * 60 * 1000, // 10 mins
    });

    // send email
    try {
      await sendEmail({
        to: email,
        subject: "Verify Your Campus Event Hub Account",
        text: `Your verification code is ${emailOtp}.`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
            <h2>Email Verification</h2>
            <p>Thank you for registering. Use the following OTP to verify your email:</p>
            <h1 style="color: #4A90E2;">${emailOtp}</h1>
            <p>This code expires in 10 minutes.</p>
          </div>
        `,
      });

      return res.status(201).json({
        success: true,
        message: "Signup successful. Verification OTP sent to email.",
      });

    } catch (emailError) {
      // If email fails, delete the user we jst created so they can try again
      // Otherwise, they'll be stuck in "email already exists" hellllll
      await UserModel.findByIdAndDelete(newUser._id);
      
      console.error("Email Dispatch Error:", emailError);
      return res.status(500).json({ 
        message: "Could not send verification email. Please try again later." 
      });
    }

  } catch (err) {
    console.error("General Signup Error:", err);
    return res.status(500).json({ message: "Internal server error during registration" });
  }
};

//email verification controller
const verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;

    const user = await UserModel.findOne({
      emailVerificationToken: otp,
      emailVerificationExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    await user.save();

    res.status(200).json({
      message: "Email verified successfully.",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//login controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { email: user.email, _id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "24h" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//logout controller
const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    res.status(200).json({
      message: "Logout successful",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//password reset controllers
//Requesting pswd reset otp
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.passwordResetToken = otp;
    user.passwordResetExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send OTP email
    await sendEmail({
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is ${otp}. It will expire in 10 minutes.`,
      html: `
    <h2>Password Reset</h2>
    <p>Your OTP is <b>${otp}</b></p>
    <p>Valid for 10 minutes.</p>
  `,
    });

    res.status(200).json({
      message: "Password reset OTP sent to email",
    });
  } catch (err) {
    console.log("Error in forgot password:", err);
    res.status(500).json({ error: "Failed to send OTP email" });
  }
};

//verifying otp
const verifyResetOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    const user = await UserModel.findOne({
      passwordResetToken: otp,
      passwordResetExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    res.status(200).json({
      message: "OTP verified successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//resetting pswd
const resetPassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;

    const user = await UserModel.findOne({
      passwordResetToken: otp,
      passwordResetExpiry: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successful",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  signup,
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  logout,
  verifyEmail,
};
