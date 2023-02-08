//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.set('strictQuery', true);
mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true });

//Must be here
//Set up session and initial configurations
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

// Initialise passport
app.use(passport.initialize());
//Use passport to mannage the sessions
app.use(passport.session());

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// Encryption
userSchema.plugin(passportLocalMongoose); //use to hash and salt password and save users into MongoDB

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy()); //create local strategy to authenticate users using their username and password

passport.serializeUser(User.serializeUser()); //create cookie to contain identification
passport.deserializeUser(User.deserializeUser()); //decrypt what information is contained inside cookie
// Root/home route

app.get("/", function(req, res) {
    res.render("home");
});

// Login route

app.get("/login", function(req, res) {
    res.render("login");
});

app.post("/login", function(req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function(err) { //passport method
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function() { //authenticate and set up log in session (cookie)
                res.redirect("/secrets");
            });
        }
    })

});

// Secrets route
app.get("/secrets", function(req, res) {
    //If user is loged in, then render secrets page, else render login page
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
})

// Register route

app.get("/register", function(req, res) {
    res.render("register");
});

app.post("/register", function(req, res) {
    //Create new yuser
    User.register({ username: req.body.username }, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function() { //authenticate and set up log in session (cookie)
                res.redirect("/secrets");
            });
        }
    });
});

// Logout route
app.get("/logout", function(req, res) {
    // Deauthenticate user
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});


app.listen(3000, function() {
    console.log("Server started on port 3000.")
});