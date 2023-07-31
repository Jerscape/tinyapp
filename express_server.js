//constants
const express = require('express');
const morgan = require('morgan');
const {getUserByEmail, generateRandomString} = require('./helpers');
const app = express();
const bcrypt = require("bcryptjs");

const PORT = 8080;
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "y7kl89"
  },

  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "klj789"
  }
};

const users = {};

//app.use
const cookieSession = require('cookie-session');
const { restart } = require('nodemon');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key']
}));

app.use(morgan("dev"));
app.set("view engine", "ejs");


//random string function
// const generateRandomString = function() {
//   let tiny = "";
//   const alphaNum = 'abcdefghijklmnopqrstuvwxyz0123456789';
//   for (let x = 0; x < 6; x++) {
//     let num = Math.round(Math.random() * 35);
//     tiny = tiny + alphaNum[num];
//   }

//   //assesses if tiny url already exists, and if so, re-calls the function
//   if (urlDatabase.hasOwnProperty(tiny)) {
//     generateRandomString();
//   } else {
//     return tiny;
//   }

// };


//converts request body to a string
//it then adds the data to the request object under the key "body"
app.use(express.urlencoded({ extended: true }));

const urlsForUser = function(userID, database) {

  //filter the entire urlDatabase looking for only urls that match the userID
  let userURLs = {};
  for (const shortID in database) {
    if (database[shortID].userID === userID) {
      userURLs[shortID] = database[shortID];
    }
  }

  return userURLs;
};

//GET ROUTES

//urls get route
app.get("/urls", (req, res) => {
  const userObject = users[req.session.userID];
  const userUrls = urlsForUser(req.session.userID, urlDatabase);

  const templateVars = {
    urls: userUrls,
    user: userObject

  };

  if(req.session.userID){
    res.render("urls_index", templateVars);

  } else {
    res.send("<h1>You must be logged in to view URLS</h1>")
  }
 

});

//unclassified get routes
app.get("/", (req, res) => {
  if(req.session.userID){
    res.redirect('/urls')
  } else {
    res.redirect("/login")
  }
  //res.send("Hello");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body><html>\n");
});

//login get route
app.get('/login', (req, res) => {

  if (req.session.userID) {
    return res.redirect("/urls");

  }
  const templateVars = { user: undefined };
  res.render("login", templateVars);
});

//register get route
app.get("/register", (req, res) => {

  if (req.session.userID) {
    return res.redirect("/urls");

  }
  const userObject = users[req.session.userID];
  const templateVars = {
    user: userObject

  };

  res.render("urls_register", templateVars);
});

//new url get route
app.get("/urls/new", (req, res) => {
  //note the notation type. As its not dynamic we use dot notation

  if (!req.session.userID) {
    return res.redirect("/login");

  }
  const userObject = users[req.session.userID];
  const templateVars = {
    user: userObject

  };
  res.render("urls_new", templateVars);
});

//id get route
app.get("/u/:id", (req, res) => {

  //assess if they are logged in
  console.log("user id: ", req.session.userID)
  if(req.session.userID){
    //assess if the url belongs to them
    console.log("Users", users)
    if(req.session.userID === urlDatabase[req.params.id].userID){
      const longURL = urlDatabase[req.params.id].longURL;
      res.redirect(longURL);
    } else {

      res.send("<h1>I'm sorry that is not your URL</h1>")
    }

  } else {
    res.send("<h1>I'm sorry, you must login first</h1>")
  }
  
});

//get urls id rote
app.get("/urls/:id", (req, res) => {

  //check if in database, if not send error message
  if (!urlDatabase.hasOwnProperty(req.params.id)) {
    res.send("<h1>I'm sorry, that is not a valid short url</h1>");
  }

  const shortID = req.params.id;
  const user = users[req.session.userID];
  const longURL = urlDatabase[shortID].longURL;
  const templateVars = { id: shortID, longURL, user };
  res.render("urls_show", templateVars);
});

//POST ROUTES

//urls post route
app.post("/urls", (req, res) => {

  if (!req.session.userID) {
    return res.send("<h1>You are not logged in</h1>");
  }

  const shortID = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.userID;
  
  urlDatabase[shortID] = {longURL, userID};
  res.redirect(`/urls/${shortID}`);

});

//login post route
//refactored with some assistance mentor Jorge
app.post("/login", (req, res) => {
  
 
  const email = req.body.email;
  const password = req.body.password;

  if (!password || !email) {
    return res.sendStatus(400).send("<h1>Please provide both an email and a password</h1>");
  }

  const user = getUserByEmail(email, users);
  //console.log("user", user);

  if (!user) {
    return res.status(403).send("Invalid credentials");
  }

  if (!bcrypt.compareSync(password, user.hashedPassword)) {
    return res.status(403).send("Invalid credentials");
  }
  
  req.session.userID = user.id;
  res.redirect("/urls");

});

app.post("/logout", (req, res) => {

  req.session = null;
  res.redirect("/login");

});

app.post("/urls/:id/delete", (req, res) => {

  const shortID = req.params.id
  const userID = req.session.userID;

  //check if user logged in
  if (!userID) {
    res.send("<h1>Please log in first</h1>");
    return;
  }

  //check if logged in user owns the url
  if (urlDatabase[shortID].userID !== userID) {
    res.send("<h1>You are not the owner of this url, therefore you cannot delete it</h1>");
    return;
  }

  delete urlDatabase[shortID];
  res.redirect(`/urls/`);
});

app.post("/urls/:id/edit", (req, res) => {

  const shortID = req.params.id;
  const userID = req.session.userID;


  if (!userID) {
    res.send("<h1>Please log in first</h1>");
    return;
  }

  //check if logged in user owns the url
  if (urlDatabase[shortID].userID !== userID) {
    res.send("<h1>You are not the owner of this url. Access to edit denied.</h1>");
    return;
  }


  const newUrl = req.body.longURL;
  urlDatabase[shortID].longURL = newUrl;
  res.redirect('/urls');

});

app.post("/register", (req, res) => {
 
  const password = req.body.password;
  const email = req.body.email;

  //assess for blank email or blank password
  //then check the user look up result
  if (!password || !email) {
    return res.sendStatus(400).send("<h1>Please provide both an email and a password</h1>");
  }

  if (getUserByEmail(email, users)) {
    return res.status(400).send("<h1>Email in use</h1>");
  }

  const userID = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[userID] = { id: userID, email, hashedPassword };

  console.log("users", users);
  
  req.session.userID = userID;
  res.redirect('/urls');

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//this is throwing an error
module.exports = {urlDatabase}