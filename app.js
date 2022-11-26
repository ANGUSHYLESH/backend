require("dotenv").config();
require("./config/database").connect();
// import {bcrypt} from "bcrypt"; 
const express = require("express");
const nodemailer = require('nodemailer');

const bcrypt = require ("bcrypt")
const jwt = require("jsonwebtoken")

const User = require("./model/user");
const auth = require("./middleware/auth");

const app = express();

// API_PORT=4001

// MONGO_URI= "mongodb://localhost:27017/login"


app.use(express.json());

let transport = nodemailer.createTransport({
   host: "smtp.gmail.com",
   port: 465,
   secure: true,
   auth: {
     user: process.env.EMAIL_USERNAME,
     pass: process.env.EMAIL_PASSWORD
   }
});

app.post("/register", async (req, res) => {
  try {
    // Get user input
    const { first_name, last_name, email, password ,age ,city} = req.body;
    // Validate user input
    if (!(email && password && first_name && last_name && age && city)) {
      res.status(400).send("All input is required");
    }
    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }
    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);
    // Create user in our database
    const user = await User.create({
        first_name,
        last_name,
        email: email.toLowerCase(), // sanitize: convert email to lowercase
        password: encryptedPassword,
        age,
        city
    });
    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;
    // return new user
    res.status(200).statusMessage("Success").json({status:200,message:"Success",jwt_token:user.token});
  } catch (err) {
    console.log(err);
  }

});

app.post("/login", async (req, res) => {
  // login starts here
  try {
    // Get user input
    const { email, password } = req.body;
    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    const user = await User.findOne({ email });
    if (user && bcrypt.compare(password, user.password)) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );
      user.token = token;

      const mailOptions = {
     from:process.env.EMAIL_USERNAME , // Sender address
     to:email, // List of recipients
     subject: 'Logged in Successfully', // Subject line
     text: 'Hiii mate you have logged in Successfully', // Plain text body
      };
      transport.sendMail(mailOptions, function(err, info) {
          if (err) {
            console.log(err)
          } else {
            console.log(info);
          }
      });
      res.status(200).json({status:200,message:"Success",jwt_token:user.token});
    }
    // res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});






module.exports = app;