const express         =     require('express')
  , passport          =     require('passport')
  , FacebookStrategy  =     require('passport-facebook').Strategy
  , session           =     require('express-session')
  , cookieParser      =     require('cookie-parser')
  , bodyParser        =     require('body-parser')
  , config            =     require('./configuration/config')
  , mysql             =     require('mysql')
  , unirest           =     require('unirest')
  , app               =     express();

//Define MySQL parameter in Config.js file.
const pool = mysql.createPool({
  host     : config.host,
  user     : config.username,
  password : config.password,
  database : config.database
});

// Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the FacebookStrategy within Passport.

passport.use(new FacebookStrategy({
    clientID: config.facebook_api_key,
    clientSecret:config.facebook_api_secret ,
    callbackURL: config.callback_url
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      //Check whether the User exists or not using profile.id
      if(config.use_database) {
        // if sets to true
        pool.query("SELECT * from user_info where user_id="+profile.id, (err,rows) => {
          if(err) throw err;
          if(rows && rows.length === 0) {
              console.log("There is no such user, adding now");
              pool.query("INSERT into user_info(user_id,user_name) VALUES('"+profile.id+"','"+profile.username+"')");
          } else {
              console.log("User already exists in database");
          }
        });
      }
      return done(null, profile);
    });
  }
));
var engine = require('consolidate')

app.set('views', __dirname + '/views');
//app.engine('html', engine.mustache)
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'keyboard cat', key: 'sid'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/views'));


app.get('/', function(req, res){
  console.log("Server is running")
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/auth/facebook', passport.authenticate('facebook',{scope:'email'}));


app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect : '/', failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get("/test", function(req, res){
  console.log("Req received");
  res.send("Successful")
})





//Beginning of API Calls
var upToIngredients = 'https://api.spoonacular.com/recipes/findByIngredients?ingredients=';
var afterIngredients = '&apiKey=423ec00e6e2e4a29b232f284b75d2ffc';
var bigEmotionStr;
var faceLink;
var bigEmotionIngredient;


app.get('/recipes', function(req, res) {
  function first(callback){
      faceLink = req.query.faceLink;
      var detectAPI = unirest("POST", "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect");

      detectAPI.query({
        "returnFaceAttributes": "emotion"
        });

      detectAPI.headers({
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": "acdf906c976e45b99ccfd0405bc73cda"
        });

      detectAPI.send("{\n\t\"url\": '" + faceLink+ "'\n}");

      

      detectAPI.end(function (result) {
      if (result.error) throw new Error(result.error);

      console.log[result];

      if (result.body[0] == undefined) res.send("No Face Found. Please hit the back button and try again.")

      else{
      var anger = result.body[0]["faceAttributes"]["emotion"]["anger"];
      var contempt = result.body[0]["faceAttributes"]["emotion"]["contempt"];
      var disgust = result.body[0]["faceAttributes"]["emotion"]["disgust"];
      var fear = result.body[0]["faceAttributes"]["emotion"]["fear"];
      var happiness = result.body[0]["faceAttributes"]["emotion"]["happiness"];
      var neutral = result.body[0]["faceAttributes"]["emotion"]["neutral"];
      var sadness = result.body[0]["faceAttributes"]["emotion"]["sadness"];
      var surprise = result.body[0]["faceAttributes"]["emotion"]["surprise"];
      var emotionArray = [[anger,"anger"], [contempt,"contempt"], [disgust, "disgust"], [fear,"fear"], [happiness, "happiness"],
      [neutral,"neutral"], [sadness,"sadeness"], [surprise,"surprise"]];

      var bigEmotion = Math.max(anger, contempt, disgust, fear, happiness, neutral, sadness, surprise);
      
      
      for (i = 0; i < emotionArray.length; i++){
        if (emotionArray[i][0] == bigEmotion){
          bigEmotionStr = emotionArray[i][1]
          if (i==0) bigEmotionIngredient = "nuts";
          else if (i==1) bigEmotionIngredient = "Chocolate";
          else if (i==2) bigEmotionIngredient = "Mushrooms";
          else if (i==3) bigEmotionIngredient = "Avocado";
          else if (i==4) bigEmotionIngredient = "Berries";
          else if (i==5) bigEmotionIngredient = "Peppers";
          else if (i==6) bigEmotionIngredient = "Beans";
          else if (i==7) bigEmotionIngredient = "Seaweed";
          callback();
          
        }
      }
      console.log("The calculated emotion is: " + bigEmotionStr); 
      }});
      
  }

  function second(){
      const ingredient = req.query.ingredient.replace(/[ ,]+/g, ",") ;

      console.log("The ingredient is: " + ingredient); 

      var requestString = upToIngredients + ingredient + "," + bigEmotionIngredient + afterIngredients;
      
      unirest
      .get(requestString)
      .end(function (result) {

        if (result.body[0] != undefined && result.status === 200){ 
          

          var emotionDisplay = bigEmotionStr;
          if (bigEmotionStr == 'neutral'){
            emotionDisplay = 'a neutral emotion'
          }

          var html;

          html = "<nav><div id='navContainer'><a href='http://localhost:3000/' id='logo'>Moody Foodie</a></div></nav><div id='formContainer'><div style='width: 50%; float: left;'><h1>Top 3 Recipe Results for You!</h1><p>You are currently displaying "+ emotionDisplay + 
          ".</p> <img src="+ faceLink
          + "></div><div style='width: 50%;float: right;'><h1>"+ bigEmotionIngredient+ " with your "+ ingredient+" are great for "+ emotionDisplay + "!</h1><p>" + 
          result.body[0]["title"] + "</p> <img src=" + result.body[0]["image"] + "><p>" +
          result.body[1]["title"] + "</p> <img src=" + result.body[1]["image"] + "><p>" +
          result.body[2]["title"] + "</p> <img src=" + result.body[2]["image"] + "><p></div>";
          res.send(html);
        }
        else{
          res.send("No results found");
        }
      })
    }
    first(second);
 
});

//End of API Calls


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

app.listen(3000);