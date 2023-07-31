const urlDatabase = require('./express_server')
//userlookup function
//amended to accept 2nd parameter "users"
const getUserByEmail = function (email, users) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return undefined;
};

const generateRandomString = function() {
  let tiny = "";
  const alphaNum = 'abcdefghijklmnopqrstuvwxyz0123456789';
  for (let x = 0; x < 6; x++) {
    const num = Math.round(Math.random() * 35);
    tiny = tiny + alphaNum[num];
  }

  //assesses if tiny url already exists, and if so, re-calls the function
  if (urlDatabase.hasOwnProperty(tiny)) {
    generateRandomString();
  } else {
    return tiny;
  }

};

//urlsforUser
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


module.exports = {getUserByEmail, generateRandomString, urlsForUser} 
