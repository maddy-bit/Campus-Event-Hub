const { UserModel } = require("../Models/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

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
      role,
    } = req.body;

    const existuser = await UserModel.findOne({ email });
    if (existuser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      fullName,
      email,
      phoneNumber,
      collegeName,
      department,
      yearOfStudy,
      password: hashedPassword,
      role: role || "student",
    });

    const token = jwt.sign(
      { email: newUser.email, _id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "24h" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
      },
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

//email verification controller

//password reset controllers
//Requesting pswd reset otp
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.passwordResetToken = otp;
    user.passwordResetExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    //Pending: sending otp to user 

    res.status(200).json({
      message: "Password reset OTP sent to email",
    });

  } catch (err) {
    console.log("error in reset pswd : ", err);
    res.status(500).json({ error: err.message });
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

module.exports = { signup, login, forgotPassword, verifyResetOtp, resetPassword };
