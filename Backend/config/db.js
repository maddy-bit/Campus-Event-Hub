const mongoose = require('mongoose')
require('dotenv').config()

const mongo_url = process.env.MONGO_URI

mongoose
  .connect(mongo_url)
  .then(() => {
    console.log('DB is connected')
  })
  .catch((err) => {
    console.error('DB connection error:', err)
  })
