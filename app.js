//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.set('strictQuery', true);
mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// Encryption

const User = new mongoose.model("User", userSchema);

// Root/home route

app.get("/", function(req, res) {
    res.render("home");
});

// Login route

app.get("/login", function(req, res) {
    res.render("login");
});

app.post("/login", function(req, res) {
    //Check if credentials are in database
    const username = req.body.username;
    const password = md5(req.body.password); //hash password

    User.findOne({ email: username }, function(err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.render("secrets");
                }
            }
        }
    })
});

// Register route

app.get("/register", function(req, res) {
    res.render("register");
});

app.post("/register", function(req, res) {
    // save new user details
    const newUser = new User({
        email: req.body.username,
        password: md5(req.body.password) //hash password
    });

    newUser.save(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.render("secrets");
        }
    })
});


app.listen(3000, function() {
    console.log("Server started on port 3000.")
})