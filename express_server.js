const express = require('express')
const app = express();
const PORT = 8080;

app.set("view engine", "ejs")


function generateRandomString() {}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  };

//converts request body to a string 
//it then adds the data to the request object under the key "body"
app.use(express.urlencoded({ extended: true }));

//get routes
app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase} 
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

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id
  const templateVars = { id: req.params.id, longURL: urlDatabase[id] };
  res.render("urls_show", templateVars);
});

//post routes
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

