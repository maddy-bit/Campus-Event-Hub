const { UserModel } = require("../Models/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");


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

    const existuser = await UserModel.findOne({ email });

    if (existuser && existuser.isEmailVerified) {
    return res.status(400).json({ message: "User already exists" });
    }

  // If exists but not verified → delete old and allow new signup
    if (existuser && !existuser.isEmailVerified) {
      await UserModel.deleteOne({ email });
    }


    // generate email verification OTP
    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.create({
      fullName,
      email,
      phoneNumber,
      collegeName,
      department,
      yearOfStudy,
      password: hashedPassword,
      emailVerificationToken: emailOtp,
      emailVerificationExpiry: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // pending: sending email otp
    // Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send verification OTP email
await transporter.sendMail({
  from: `"Campus Event Hub" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Email Verification OTP",
  text: `Your email verification OTP is: ${emailOtp}. It will expire in 10 minutes.`,
});


    res.status(201).json({
      message: "Signup successful. Please verify your email.",
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    })

    res.status(200).json({
      message: 'Logout successful',
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

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

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send mail
    await transporter.sendMail({
      from: `"Campus Event Hub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`,
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

module.exports = { signup, login, forgotPassword, verifyResetOtp, resetPassword, logout, verifyEmail };
