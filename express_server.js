const express = require('express');
const morgan = require('morgan');
const app = express();
const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs")

app.use(cookieParser());
app.use(morgan("dev"));
const PORT = 8080;

app.set("view engine", "ejs");

//should these objects and possibly the other constants be moved to a dedicated file?
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


//helper functions

const generateRandomString = function () {
  let tiny = "";
  const alphaNum = 'abcdefghijklmnopqrstuvwxyz0123456789';
  for (let x = 0; x < 6; x++) {
    let num = Math.round(Math.random() * 35);
    tiny = tiny + alphaNum[num];
  }

  //assesses if tiny url already exists, and if so, re-calls the function
  if (urlDatabase.hasOwnProperty(tiny)) {
    generateRandomString();
  } else {
    return tiny;
  }

};


//userlookup function
const getUserByEmail = function (email) {

  for (const userId in users) {

    if (users[userId].email === email) {
      return userId;
    }

  }

  return undefined;
};

//urlsbyuser function


//converts request body to a string
//it then adds the data to the request object under the key "body"
app.use(express.urlencoded({ extended: true }));

//GET ROUTES

 
const urlsForUser = function(userID, database) {

  //filter the entire urlDatabase looking for only urls that match the userID
  let userURLs = {}
  for(const shortID in database){
    if(database[shortID].userID === userID){
      userURLs[shortID] = database[shortID]
    }
  }

  //console.log("urlsforuser", userURLs )
  return userURLs
}

app.get("/urls", (req, res) => {
  const userObject = users[req.cookies.userID];

  const userUrls = urlsForUser(req.cookies.userID, urlDatabase)
  //filter the entire urlDatabase looking for only urls that match the userID


  const templateVars = {
    urls: userUrls,
    user: userObject

  };

  res.render("urls_index", templateVars);

});

app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body><html>\n");
});

app.get('/login', (req, res) => {

  //attempting to say if cookie is present, do the epxressions in if
  if (req.cookies.userID) {
    return res.redirect("/urls")

  }
  const templateVars = { user: undefined };
  res.render("login", templateVars);
});


app.get("/register", (req, res) => {

  if (req.cookies.userID) {
    return res.redirect("/urls")

  }
  const userObject = users[req.cookies.userID];
  const templateVars = {
    user: userObject

  };

  res.render("urls_register", templateVars);
});

app.get("/urls/new", (req, res) => {
  //note the notation type. As its not dynamic we use dot notation

  if (!req.cookies.userID) {
    return res.redirect("/login")

  }
  const userObject = users[req.cookies.userID];
  const templateVars = {
    user: userObject

  };
  res.render("urls_new", templateVars);
});

app.get("/u/:id", (req, res) => {

  //HERE
  const longURL = urlDatabase[req.params.id].longURL
  res.redirect(longURL);
});

// app.get("/u/:id", (req, res) => {

//   const longURL = urlDatabase[req.params.id];
//   res.redirect(longURL);
// });

app.get("/urls/:id", (req, res) => {

  //check if in database, if not send error message 
  if (!urlDatabase.hasOwnProperty(req.params.id)) {
    res.send("<h1>I'm sorry, that is not a valid short url</h1>")
  }

  const shortID = req.params.id;
  const user = users[req.cookies.userID];
  //HERE
  const longURL = urlDatabase[shortID].longURL
  const templateVars = { id: shortID, longURL, user };
  res.render("urls_show", templateVars);
});

//POST ROUTES
//this is called primarity by the new template
app.post("/urls", (req, res) => {

  if (!req.cookies.userID) {
    return res.send("<h1>You are not logged in</h1>")
    //return res.redirect("/login")

  }
  const shortID = generateRandomString();
  const longURL = req.body.longURL
  const userID = req.cookies.userID
  //HERE
  urlDatabase[shortID] = {longURL, userID}
  res.redirect(`/urls/${shortID}`);

});


app.post("/login", (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;
  console.log("users object", users)
  let found = false;
  for (const user in users) {

    if (users[user].email === email) {
      found = true;
      //bcrypt.compareSync returns boolean
      //console.log(password, users[user].email, users[user].hashedPassword)
      if (bcrypt.compareSync(password, users[user].hashedPassword)) {
        res.cookie("userID", user);
        res.redirect(`/urls/`);
      } else {
        console.log("2nd/inner else")
        res.status(403).send("Invalid credentials");
      
      }

    } if(!found) {
      console.log("1st else")
      res.status(403).send("Invalid credentials");
      
    }

  }

});

app.post("/logout", (req, res) => {

  res.clearCookie('userID');
  res.redirect(`/login/`);
});

app.post("/urls/:id/delete", (req, res) => {

  const shortID = req.params.id
  const userID = req.cookies.userID
  //check if user logged in
  if(!userID) {
    res.send("<h1>Please log in first</h1>");
    return ;
  }

  //check if logged in user owns the url
  if(urlDatabase[shortID].userID !== userID){
    res.send("<h1>You are not the owner of this url, therefore you cannot delete it</h1>")
    return;
  }

  //HERE...WOULD THIS JUST BE THE SAME AS I AM DELETING THE WHOLE OBJECT???
  delete urlDatabase[shortID];
  res.redirect(`/urls/`);
});

app.post("/urls/:id/edit", (req, res) => {

  const shortID = req.params.id
  const userID = req.cookies.userID
  //check if user logged in
  if(!userID) {
    res.send("<h1>Please log in first</h1>");
    return ;
  }

  //check if logged in user owns the url
  if(urlDatabase[shortID].userID !== userID){
    res.send("<h1>You are not the owner of this url. Access to edit denied.</h1>")
    return
  }


  const newUrl = req.body.longURL;
  urlDatabase[shortID].longURL = newUrl;
  res.redirect('/urls');

});

app.post("/register", (req, res) => {
 
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const email = req.body.email;
  //assess for blank email or blank password
  //then check the user look up result
  if (!password || !email) {
    res.sendStatus(400).send("<h1>Please provide both an email and a password</h1>");
    return;
  }

  if (getUserByEmail(email, users)) {
    return res.status(400).send("<h1>Email in use</h1>");
  }

  const userID = generateRandomString();
  users[userID] = { id: userID, email, hashedPassword };
  
  res.cookie('userID', userID);
  res.redirect('/urls');

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

