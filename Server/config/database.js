const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config();

// Force IPv4 first DNS resolution for Windows Node.js & MongoDB Atlas SRV
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

exports.connect = async() => {
    mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("DB Connected Successfully"))
    .catch( (error) => {
        console.log("DB Connection Failed");
        console.error(error.message);
    })
};