const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './Backend/.env' });

const { UserModel } = require('./Backend/Models/users');

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const users = await UserModel.find({ email: /test_student/ }).sort({ createdAt: -1 }).limit(5);
        console.log("Recent test users:", users.map(u => ({
            email: u.email,
            isApproved: u.isApproved,
            isEmailVerified: u.isEmailVerified,
            createdAt: u.createdAt
        })));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUser();
