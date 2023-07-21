const express = require('express')
const app = express();
const PORT = 8080;

app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  };


function generateRandomString() {
  let tiny = "";
  const alphaNum = 'abcdefghijklmnopqrstuvwxyz0123456789'
  for(let x =0; x < 6; x++){
    let num = Math.round(Math.random()*36)
    tiny = tiny + alphaNum[num]
  }

  if(urlDatabase.hasOwnProperty(tiny)){
    generateRandomString()
  } else {
    return tiny
  }
  // for(let x = 0; x <6; x++){
  // let num = Math.round((Math.random() * 5))
  //   console.log(num)
  //   if(num % 2 === 0){
  //     if(num === 0){
  //       let insert = "a";
  //       tiny = tiny + insert;
  //     } else if(num === 1){
  //       let insert = "b";
  //       tiny = tiny + insert;
  //     } else {
  //       let insert = "c";
  //       tiny = tiny + insert;
  //     } 
  //   } else {
  //     num.toString();
  //     tiny = tiny + num;
  //   }

  //   }
  //console.log(tiny)

  //assesses for duplicates before returning
  //if found, it calls the function again
  // if(urlDatabase.hasOwnProperty(tiny)){
  //   generateRandomString()
  // } else {
  //   return tiny
  // }
  
}

//testing (it works)
let randomString = generateRandomString()
console.log("After call" , randomString)


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
  console.log(req.body); // Log the POST request body to the 
  console.log(req.body.longURL)
  const id = generateRandomString()
  urlDatabase[id] = req.body.longURL
  console.log(urlDatabase)
  res.redirect(`/urls/${id}`)

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

