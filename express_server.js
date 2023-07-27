const express = require('express');
const morgan = require('morgan');
const app = express();
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(morgan("dev"));
const PORT = 8080;

app.set("view engine", "ejs");

//should these objects and possibly the other constants be moved to a dedicated file?
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};


const users = {

};


//helper functions

const generateRandomString = function() {
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
const getUserByEmail = function(email) {

  for (const userId in users) {
   
    if (users[userId].email === email) {
      return userId;
    }

  }

  return undefined;
};

//converts request body to a string
//it then adds the data to the request object under the key "body"
app.use(express.urlencoded({ extended: true }));

//GET ROUTES
app.get("/urls", (req, res) => {
  const userObject = users[req.cookies.userID];
  const templateVars = {
    urls: urlDatabase,
    user: userObject
  
  };

  res.render("urls_index", templateVars);

});

app.get("/", (req, res) =>{
  res.send("Hello");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res)=> {
  res.send("<html><body>Hello <b>World</b></body><html>\n");
});

app.get('/login', (req, res) =>{

  //attempting to say if cookie is present, do the epxressions in if
  if(req.cookies.userID){
    return res.redirect("/urls")
   
  }
  const templateVars = {user: undefined};
  res.render("login", templateVars);
});


app.get("/register", (req, res)=>{

  if(req.cookies.userID){
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

  if(!req.cookies.userID){
    return res.redirect("/login")
   
  }
  const userObject = users[req.cookies.userID];
  const templateVars = {
    user: userObject
  
  };
  res.render("urls_new", templateVars);
});

app.get("/u/:id", (req, res) => {

  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {

  //check if in database, if not send error message 
  if(!urlDatabase.hasOwnProperty(req.params.id)){
    res.send("<h1>I'm sorry, that is not a valid short url</h1>")
  }

  const id = req.params.id;
  const userObject = users[req.cookies.userID];
  const templateVars = { id: req.params.id, longURL: urlDatabase[id], user: userObject };
  res.render("urls_show", templateVars);
});

//POST ROUTES
app.post("/urls", (req, res) => {

  if(!req.cookies.userID){
    return res.send("<h1>You are not logged in</h1>")
    //return res.redirect("/login")
   
  }
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);

});

app.post("/login", (req, res)=>{
  const email = req.body.email;
  const password = req.body.password;

  for (const user in users) {
 
    if (users[user].email === email) {
      if (users[user].password === password) {
        res.cookie("userID", user);
        res.redirect(`/urls/`);
      } else {
        res.status(403).send("Invalid credentials");
      }

    } else {
      res.status(403).send("Invalid credentials");
    }

  }
 
});

app.post("/logout", (req, res)=>{
  
  res.clearCookie('userID');
  res.redirect(`/login/`);
});

app.post("/urls/:id/delete", (req, res)=>{
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect(`/urls/`);
});

app.post("/urls/:id/edit", (req, res)=>{
  const id = req.params.id;
  const newUrl = req.body.longURL;
  urlDatabase[id] = newUrl;
  res.redirect('/urls');

});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const password = req.body.password;
  const email = req.body.email;
  //assess for blank email or blank password
  //then check the user look up result
  if (password.length === 0 || email.length === 0) {
    res.sendStatus(400).send("<h1>Please provide both an email and a password</h1>");
    return;
  }

  if (getUserByEmail(email, users)) {
    return res.status(400).send("<h1>Email in use</h1>");
  }
  users[userID] = {id: userID, email, password};
  res.cookie('userID', userID);
  res.redirect('/urls');
  
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

