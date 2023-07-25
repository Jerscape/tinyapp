const express = require('express')
const app = express();
const cookieParser = require('cookie-parser')
app.use(cookieParser())
const PORT = 8080;

app.set("view engine", "ejs")

//should these objects and possibly the other constants be moved to a dedicated file?

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  };


const users ={

}

function generateRandomString() {
  let tiny = "";
  const alphaNum = 'abcdefghijklmnopqrstuvwxyz0123456789'
  for(let x =0; x < 6; x++){
    let num = Math.round(Math.random()*35)
    tiny = tiny + alphaNum[num]
  }

  //assesses if tiny url already exists, and if so, re-calls the function
  if(urlDatabase.hasOwnProperty(tiny)){
    generateRandomString()
  } else {
    return tiny
  }

  
}
 


//converts request body to a string 
//it then adds the data to the request object under the key "body"
app.use(express.urlencoded({ extended: true }));

//get routes
app.get("/urls", (req, res) => {
  const userObject = users[req.cookies.userID]
  const templateVars = {
    urls: urlDatabase, 
    user: userObject
  
  } 
  res.render("urls_index", templateVars)

})

app.get("/", (req, res) =>{
  res.send("Hello");
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res)=> {
  res.send("<html><body>Hello <b>World</b></body><html>\n")
})

app.get("/register", (req, res)=>{

  const userObject = users[req.cookies.userID]
  const templateVars = {
    user: userObject
  
  } 
  res.render("urls_register", templateVars)
})

app.get("/urls/new", (req, res) => {
  //note the notation type. As its not dynamic we use dot notation
  const userObject = users[req.cookies.userID]
  const templateVars = {
    user: userObject
  
  } 
  res.render("urls_new", templateVars);
});

app.get("/u/:id", (req, res) => {
  // const longURL = ...
  //console.log("req params.id", req.params.id)
  //console.log(urlDatabase)
  const longURL = urlDatabase[req.params.id]
  //urlDatabase[id] = req.body.longURL
  console.log("longurl" , longURL)
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id
  //ammended to pass the entire user object instead of the cookie....?
  //const userObject = users[userID]
  const userObject = users[req.cookies.userID]
  const templateVars = { id: req.params.id, longURL: urlDatabase[id], user: userObject };
  res.render("urls_show", templateVars);
});

//post routes
app.post("/urls", (req, res) => {
  //console.log(req.body); // Log the POST request body to the 
  //console.log(req.body.longURL)
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${id}`);

});

app.post("/login", (req, res)=>{
  res.cookie('username', req.body.username)
  res.redirect(`/urls/`);
 //
})

app.post("/logout", (req, res)=>{
  
  res.clearCookie('username')
  res.redirect(`/urls/`);
})

app.post("/urls/:id/delete", (req, res)=>{
  const id = req.params.id;
  console.log("id", id);
  delete urlDatabase[id];
  console.log(urlDatabase);
  res.redirect(`/urls/`);
})

app.post("/urls/:id/edit", (req, res)=>{
  const id = req.params.id;
  const newUrl = req.body.longURL;
  urlDatabase[id] = newUrl;
  res.redirect('/urls')

})

app.post("/register", (req, res) => {
  const userID = generateRandomString()
  //console.log(req.body)
  users[userID] = {id: userID, email: req.body.email, password: req.body.password}
  //console.log(users)
  //console.log()
  res.cookie('userID', userID)
  res.redirect('/urls')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

