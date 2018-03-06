var express         = require("express"),
    bodyParser      = require("body-parser"),
    app             = express(),
    mongoose        = require("mongoose"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    Moment          = require("./models/moment"),
    Comment         = require("./models/comment"),
    User            = require("./models/user"),
    seedDB          = require("./seeds");
    methodOverride  = require("method-override"),
    expressSanitizer = require("express-sanitizer"),
    flash           = require("connect-flash");
                      require("dotenv/config");


var momentRoutes    = require("./routes/moments"),
commentRoutes       = require("./routes/comments"),
indexRoutes         = require("./routes/index");

// seedDB();
mongoose.connect("mongodb://localhost/TripTake_test");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(expressSanitizer());
app.use(flash());

// Passport config
app.use(require("express-session")({
    secret: "Once again Rusty wins",
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/moments", momentRoutes);
app.use("/moments/:id/comments", commentRoutes);
app.use("/",indexRoutes);

app.get("*", function (req, res) {
    res.redirect("/moments");
});
app.listen(3001, process.env.IP, function () {
    console.log("The TripTake Server has started!");
});