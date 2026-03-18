const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' }); // Adjusted for Backend dir

async function findCollege() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const College = mongoose.model('College', new mongoose.Schema({}));
        const college = await College.findOne();
        console.log("Valid College ID:", college?._id);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findCollege();
