var express = require("express");
var router = express.Router({mergeParams: true});
var Film = require("../models/film");
var User = require("../models/user");
var Reservation = require("../models/reservation");
var middleware  = require("../middleware");


// POST route
router.post("/", middleware.isLoggedIn, (req,res) => {
     Film.findById(req.params.id, (err, film) => {
       if (err) console.log("resRoute post error 1");
       else {
           if (film.reservation.length < film.capacity) {
           Reservation.create(req.body.reservation, (err, reservation) => {
               if (err)
                   console.log("resRoute post error 2");
               else {
                   reservation.film = {id: film._id, title: film.title, image: film.image, info: film.info};
                   reservation.user = {id: req.user._id, username: req.user.username};
                   reservation.save();
                 
                   film.reservation.push(reservation);
                   film.save();
                   
                   User.findById(req.user._id, (err, user) => {
                       if (err) console.log("resRoute post error 3");
                       else {
                           user.reservation.id = reservation._id;
                           user.save();
                       }
                   });
                   
                   req.flash("success", "Reservation made for " + film.title);
                   res.redirect("/film/" + film._id);
               }
           });
           }
           else {
               req.flash("error", film.title + " is fully booked. Please select a different film.");
               res.redirect("/film/" + film._id);
           }
       }
    });
});


// UPDATE ROUTE
router.put("/:reservation_id", middleware.checkCommentOwner, (req,res) => {
    Reservation.findById(req.params.reservation_id, (err, reservation) => {
       if (err)
            console.log("resRoute update err1");
       else {
            Film.findById(reservation.film.id, (err, film) => {
    
                if (err) console.log("resRoute update err2");
                else
                    film.reservation.remove(req.params.reservation_id),
                    film.save();
            });
            
            Film.findById(req.params.id, (err, film) => {
                if (err) console.log("resRoute update err3");
                else
                    film.reservation.remove(req.params.reservation_id),
                    film.reservation.push(reservation),
                    film.save();
                    
                    reservation.date = Date.now();
                    reservation.film.id = film._id;
                    reservation.film.title = film.title;
                    reservation.film.image = film.image;
                    reservation.film.info = film.info;
                    reservation.save();
                    
                    req.flash("success", "Switched reservation to " + film.title),
                    res.redirect("/film/"+req.params.id);
            });
       }
    });
});

// DELETE ROUTE  
router.delete("/:reservation_id", middleware.checkCommentOwner, (req,res) => {
    
    Film.findById(req.params.id, (err, film) => {
       if (err)
            console.log("resRoute delete err1");
       else
            film.reservation.remove(req.params.reservation_id),
            film.save();
    });
    
    User.findById(req.user.id, (err,user) => {
        if (err)
            console.log("resRoute delete err2");
        else 
            user.reservation = {},
            user.save();
     });
    
    Reservation.findByIdAndRemove(req.params.reservation_id, err => {
       if (err)
            console.log("resRoute delete err3"),
            req.flash("error", "Unable to cancel reservation"),
            res.redirect("/film/" + req.params.id);
       else 
            req.flash("success", "Canceled reservation"),
            res.redirect("back");
    }); 
});

module.exports = router;