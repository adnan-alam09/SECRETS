require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;



const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB");

// using mongoose schema - this allows for encryption
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});



const User = new mongoose.model("User", userSchema);



app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

//// notice how theres not app.get for the secrets page - this is becasue we only waant to desplay that page if they login or Register


app.post("/register", function(req, res) {

  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    const newUser = new User({
      email: req.body.username,
      password: hash
    });

    newUser.save(function(err) {
      if (err) {
        console.log(err);
      } else {
        res.render("secrets"); // if no error in the registration - render the secrets page
      }
    });
  });



});


app.post("/login", function(req, res) {
  // this is what the user is entering
  const username = req.body.username;
  const password = req.body.password;

  // now check through database to see if what the user entered is existent
  User.findOne({email: username}, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) { // if the username exists - then check if the password matches
        bcrypt.compare(password, foundUser.password, function(err, result) {
    // result == true
          if(result === true){
            res.render("secrets");
          }
        });
      }
    }
  });

});





app.listen(3000, function() {
  console.log("Server started on port 3000");
});
