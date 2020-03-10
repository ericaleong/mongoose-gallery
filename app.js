const path = require('path');
const gallery = require('./gallery');
const express = require('express');
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const dotenv = require('dotenv').config();
var slugify = require('slugify');
const fs = require('fs');
const moment = require('moment');
const app = express();
const uri = process.env.MONGODB_URL;


// --- Image model --- //
const Image = require('./models/Image.js');


// --- Serving static assets --- //
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static('public/images'));


// --- POST /image --- //
app.use(express.urlencoded({ extended: false }));

// --- Global variables --- //
app.use(function(req, res, next){
  res.locals.currentIndex = '';
  res.locals.currentImage = '';
  next();
})


// --- Run ejs --- //
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// --- Moment module for the date in footer --- //
app.locals.twentyTwenty = function(){
  return moment().format('YYYY');
}

// --- Dropping images into Mongo --- //
MongoClient.connect(uri,{ useUnifiedTopology: true,useNewUrlParser: true },  function(err, client) {
  if(err) {
     console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
  }
  console.log('Connected...');

  const db = client.db("gallery");
  const imgCol = db.collection('images');

  imgCol.deleteMany();
  console.log('Dropped');

  imgCol.insertMany(gallery).then(function(cursor) {
   console.log(cursor.insertedCount);
   client.close()
 }).catch(function(err){
   console.log(err);
 });
});


// --- Mongoose connection --- //
const dbURI = process.env.MONGODB_URL;
mongoose.connect(dbURI, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

var db = mongoose.connection;

db.on('error', function(error){
  console.log(`Connection Error: ${error.message}`)
});

db.once('open', function() {
  console.log('Connected to DB...');
});


// --- GET endpoint handlers --- //
app.get('/', function(req, res){
  res.render('index');
});

app.get('/gallery', function(req, res) {
  res.render('gallery', {gallery});

  res.locals.currentImage = 'current';

  Image.find(function(error, result){
    res.render('gallery', {gallery: result});
  });
});

app.get('/gallery/:id', function(req, res, next){
  for(photo of gallery){
    if(photo.id == req.params.id){
      res.render('id',{title: `${req.params.id}`});
      return;
    }
  }
  next();

  Image.findOne({id: request.params.id}, function(error, result){
    if(error){
      return console.log(error);
    }
    response.render('gallery', result);
  })
});


// --- 404 error page --- //
app.use(function(req, res){
  res.writeHead(404, {'Content-Type': 'text/html'});
  fs.createReadStream(__dirname + '/404.html').pipe(res);
});


// --- Localhost: 3000 --- //
const PORT = process.env.PORT || 3001;

app.listen(PORT, function(){
  console.log(`Listening on port ${PORT}`);
});