var express = require("express"),
        app = express(),
 bodyParser = require("body-parser"),
   mongoose = require("mongoose"),
      flash = require("connect-flash"),
   passport = require("passport"),
 LocalStrategy = require("passport-local"),
 methodOverride = require("method-override"),
 Film = require("./models/film"),
    Reservation = require("./models/reservation"),
       User = require("./models/user"),
     seedDB = require("./seeds");
     
     //require("dotenv").load();
     
var reservationRoutes = require("./routes/reservation"),
           filmRoutes = require("./routes/film"),
          indexRoutes = require("./routes/index");
   
mongoose.connect(process.env.DATABASEURL, {useMongoClient: true});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB(); //seed the DB

app.use(require("express-session")({
    secret: process.env.SESSIONSECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.currentUser = req.user, 
    res.locals.error = req.flash("error"),
    res.locals.success = req.flash("success"),
    next()
});

app.use(indexRoutes);
app.use("/film/:id/reservation", reservationRoutes);
app.use("/film", filmRoutes);
app.get("*", function(req, res){
  res.redirect("/film"); 
});

app.listen(process.env.PORT, process.env.IP, () => {
    console.log("Server has started");
})