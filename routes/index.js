var express    = require("express");
var router     = express.Router();
var User       = require("../models/user");
var passport   = require("passport");
var asynch     = require("async");
var nodemailer = require("nodemailer");
var crypto     = require("crypto");
var middleware = require("../middleware");
var Token = require("../models/token");

router.get("/", (req,res) => {
    res.redirect("/film");
});

/// AUTH ROUTES
// Register Form
router.get("/register", (req,res) => {
    res.render("register", {page: "register"});
});




// Register POST
router.post("/register", middleware.caseInsensitive, (req,res) => {
    var newUser = new User({username: req.body.username, email: req.body.email})
    User.register(newUser, req.body.password, (err,user) => {
        if (err) {
          console.log(err)
            req.flash("error", err.message);
            return res.redirect("register");
        }
        passport.authenticate("local")(req,res, () => {
            req.flash("success", "Nice to meet you, " + user.username);
            res.redirect("/film");
        });
    });
});

// Login
router.get("/login", (req,res) => {
   res.render("login", {page: "login"}); 
});

// Login POST
router.post("/login", middleware.caseInsensitive, passport.authenticate("local",{
    successRedirect: "/film",
    failureRedirect: "/login"
}), (req,res) => {});

//Logout
router.get("/logout", (req,res) => {
   req.logout(); 
   req.flash("success", "Logged you out");
   res.redirect("/");
});

// Forgot password
router.get("/forgot", (req,res) => {
    res.render("forgot");
});

router.post('/forgot', function(req, res, next) {
  var isVerified = false;
  asynch.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }
        isVerified = user.isVerified ? true : false;
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: process.env.RECOVERY_EMAIL,
          pass: process.env.RECOVERY_EMAIL_PW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'do-not-reply@email.com,
        subject: 'KVD Film Festival - Password Reset',
        text: isVerified ? 
          'Please click on the following link, or paste this into your browser to verify your account:\n\n' +
          'http://' + req.headers.host + '/verify/' + token + '\n\n' +
          'If you did not request this, please ignore this email.\n'
        :
        'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
          
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('back');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.get('/verify/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Verification token is invalid or has expired.');
      return res.redirect('/verify');
    }
    res.render('verify', {token: req.params.token});
  });
});

router.post("/verify/:token", (req,res) => {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Verification token is invalid or has expired.');
          return res.redirect('back');
        }
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            user.isVerified = true;

            user.save(function(err) {
              req.logIn(user, function(err) {});
            });
            res.redirect("/");
  })
});

router.post('/reset/:token', function(req, res) {
  asynch.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: process.env.RECOVERY_EMAIL,
          pass: process.env.RECOVERY_EMAIL_PW"
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'do-not-reply@email.com',
        subject: 'KVD Film Festival - Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/film');
  });
});

module.exports = router;