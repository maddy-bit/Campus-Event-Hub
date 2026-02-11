const { UserModel } = require("../Models/users");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const signup = async (req, res) => {
    try {
        const { fullName, email, phoneNumber, collegeName, department, yearOfStudy, password, role } = req.body;

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
            role: role || 'student'
        });

        const token = jwt.sign(
            { email: newUser.email, _id: newUser._id, role: newUser.role },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '24h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.status(201).json({
            message: "User created successfully",
            user: {
                fullName: newUser.fullName,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { signup };
