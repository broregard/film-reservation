var Film = require("../models/film");
var Reservation = require("../models/reservation");
var middlewareObj = {};

middlewareObj.checkOwner = function(req,res,next) {
    if (req.isAuthenticated()) {
        Film.findById(req.params.id, (err,foundFilm) => {
           if (err || !foundFilm)
                req.flash("error","Film not found."),
                res.redirect("back");
           else
            if (foundFilm && (req.user.isAdmin || foundFilm.author.id.equals(req.user._id))) next();
            else req.flash("You don't have permission do that."),
                 res.redirect("back");
        });
    }
    else req.flash("error", "You need to be logged in to do that."),
         res.redirect("back");
};

middlewareObj.checkCommentOwner = function(req,res,next) {
    if (req.isAuthenticated()) {
        Reservation.findById(req.params.reservation_id, (err,foundReservation) => {
           if (err)
                req.flash("error", "Reservation not found."),
                res.redirect("back");
           else
           console.log(foundReservation);
            if (req.user.isAdmin || foundReservation.user.id.equals(req.user._id)) next();
            else req.flash("error", "You don't have permission to do that."),
                 res.redirect("back");
        });
    }
    else res.flash("error", "You need to be logged in to do that."),
         res.redirect("back");
};

middlewareObj.isLoggedIn = function(req,res,next) {
    if(req.isAuthenticated()) return next();
    req.flash("error", "You need to be logged in to do that.");
    res.redirect("/login");
};

middlewareObj.caseInsensitive = function(req,res,next) {
    req.body.username = req.body.username.toLowerCase();
    next();
};

module.exports = middlewareObj;