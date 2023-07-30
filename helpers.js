
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


module.exports = getUserByEmail
