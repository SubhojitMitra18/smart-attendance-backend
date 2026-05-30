const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://Admin:aQFlMyCKwBDAs1Qw@cluster0.ztdhn.mongodb.net/IHRM');

    console.log("MongoDB Connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;