var express = require('express');
var app = express();

app.get('/script',(req,res) => {
  res.sendFile("/Users/sophielin/Desktop/BU/CS411/CS_411_Project/index.js");
});

app.get('/css/layout',(req,res) => {
  res.sendFile("/Users/sophielin/Desktop/BU/CS411/CS_411_Project/layout/styles/layout.css");
});
app.get('/css/font',(req,res) => {
  res.sendFile("/Users/sophielin/Desktop/BU/CS411/CS_411_Project/layout/styles/font-awesome.min.css");
});
app.get('/css/custom',(req,res) => {
  res.sendFile("/Users/sophielin/Desktop/BU/CS411/CS_411_Project/layout/styles/custom.flexslider.css");
});
app.get('/css/frame',(req,res) => {
  res.sendFile("/Users/sophielin/Desktop/BU/CS411/CS_411_Project/layout/styles/framework.css");
});

app.get('/', function(req, res) {

  res.sendFile("/Users/sophielin/Desktop/BU/CS411/CS_411_Project/homepage.html");
});

app.get('/detectFaces', function(req, res) {

  res.sendFile("/Users/sophielin/Desktop/BU/CS411/CS_411_Project/detectFaces.html");
});
app.get('/recipe', function(req, res) {

  res.sendFile("/Users/sophielin/Desktop/BU/CS411/CS_411_Project/index.html");
});


app.listen(8000, function() {
  console.log('Example app listening on port 8000!');
});
