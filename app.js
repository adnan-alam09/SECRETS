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
app.use(bodyParser.urlencoded({
  extended: true
}));

// tell our app to use session package with initial configuration
app.use(session({
  secret: "Our Little Secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize()); // tell app to use and initialize the passport package
app.use(passport.session()); // use passport for dealing with the session

mongoose.connect("mongodb://localhost:27017/userDB");

// using mongoose schema - this allows for encryption
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);


const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
// serialize makes the cookie to hold user info  ---- deserialize breaks the cookie to release user info
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});


app.get("/secrets", function(req, res){
  if (req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect("/login");
  }
});


app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});



app.post("/register", function(req, res) {

  User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});


app.post("/login", function(req, res) {

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

// this login method comes from passport package
  req.login(user, function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});





app.listen(3000, function() {
  console.log("Server started on port 3000");
});
