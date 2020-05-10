require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const encypt = require('mongoose-encryption');

const app = express();
const PORT = 3000;
//for initializing and setting the templating engine... there a three type pug / Mutstache / EJS
app.set('view engine', 'ejs');
// to server the static files such as images, css, javascript files
app.use(express.static('public'));
//to load the data from form type from the clients side we use this default code....
app.use(bodyParser.urlencoded({ extended: true }));

// connection to the Localdatabase via mongoose package
mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//create a Schema for our Database named userDB
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// for password encryption we have used npm mongoose-encryption package and a secret method using a single string
//const secret = process.env.SECRET;
// const secret = process.env.thisIsMySecretString;
userSchema.plugin(encypt, {
  secret: process.env.SECRET,
  encryptedFields: ['password'],
}); //encryptedFields: [''] for the feilds which needs to be encrypted

//we need to create a model which is responsible for creating and reading the documents from the underlying mongodb database....

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => res.render('home'));

app.get('/register', (req, res) => res.render('register'));
app.get('/login', (req, res) => res.render('login'));

// to make a post requset in order to retrive data from the from and store it into the database as per requirnment...
app.post('/register', (req, res) => {
  //to create a document in our database directly from the user post input........
  const newUser = new User({
    email: req.body.username,
    password: req.body.password,
  });
  newUser.save(err => {
    //behind the scene encryption will be started from here
    if (err) {
      console.log(err);
    } else {
      res.render('secrets');
    }
  });
});

// to make a post request to login page in order to retrieve the email and password from the chek it with the database and then access the secret page...

app.post('/login', function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ email: username }, function (err, foundUser) {
    // behind the scene mongoose-encryption  will decrypt here for password matching
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          res.render('secrets');
        }
      }
    }
  });
});

app.listen(PORT, () => console.log(`server is listning to the PORT ${PORT}`));
