# tinyapp 

A mini clone of tiny url

## purpose

**_BEWARE:_ This library was published for learning purposes. It is _not_ intended for use in production-grade software.**

This project was created and published by me (Jeremy Dutton) as part of my learnings at Lighthouse Labs.

## Documentation 

This app possesses the following functionality:

* It allows users to register
* It accepts long urls and shortens them to 6 random characters
* It saves both the long url and its shortened a.ka. "tiny' version and associates them to the specific user
* it allows the user to edit/delete their long url/tiny combinations
* it usings hashing and bcrypt for enhanced security

## Dependencies

* Node.js
* Express
* EJS
* bcryptjs
* cookie-session

## Getting started

* Install all dependencies using the npm install command
* Run the express_server.js file
* Go to port 8080 endpoint /register
