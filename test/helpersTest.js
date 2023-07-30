const { assert } = require('chai');

const getUserByEmail = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    //GET userByEMAIL RETURNS THE USER OBJECT
    //console.log(user, expectedUserID)
    console.log(user)
    assert.equal(user.id, expectedUserID) //itworks when I remove this assertion line
    //should I be testing against the key value?
    //(expected, actual)

  });

  it('should return undefined', function() {
    const user = getUserByEmail("uset@example.com", testUsers)
    const expectedUserID = "userRandomID";
    //GET userByEMAIL RETURNS THE USER OBJECT
    //console.log(user, expectedUserID)
    //console.log("users object", user)
    //console.log("user" ,user.id)
    assert.isUndefined(user) //itworks when I remove this assertion line
    //should I be testing against the key value?
    //(expected, actual)

  });
});