var express = require("express");
var router = express.Router();
var Film = require("../models/film");
var Reservation = require("../models/reservation");
var middleware  = require("../middleware");

router.get("/", (req,res) => {
    Film.find({}, (err,allFilms) => {
        if (err) console.log("film.js error1");
        else {
            if (req.user && req.user.reservation.id) {
                Reservation.findById(req.user.reservation.id, (err,foundRes) => {
                   if (err) console.log(err)
                   else res.render("film/index", {filmList: allFilms, foundRes:foundRes.film});
                });
            }
            else 
            res.render("film/index", {filmList: allFilms});
        }
    });
});

router.get("/all", (req, res) => {
    Reservation.find({}, (err,allReservations) => {
    if (err) console.log("film.js error1");
    else {
        res.render("reservation/all", {reservations: allReservations});
    }
    });
});

// CREATE form 
router.get("/new", middleware.isLoggedIn, (req,res) => {
   res.render("film/new"); 
});

// CREATE post
router.post("/", middleware.isLoggedIn, (req,res) => {
    Film.create(req.body, (err,newFilm) => {
        if (err) console.log(err);
        else req.flash("success", "Posted new film."), res.redirect("/film");
    })
});

// SHOW - show more info about film
router.get("/:id", (req,res) => {
    Film.findById(req.params.id).populate("reservation").exec((err, foundFilm) => {
       if (err || !foundFilm) {
           req.flash("error", "Film not found"),
            res.redirect("/film");
       }
       else res.render("film/show", {film: foundFilm});
    });
});

// EDIT form  /// [!] WORK ON THIS [!] ~~~~~~~~~!!~~~~~~~~~
router.get("/:id/edit", middleware.checkOwner, (req,res) => {
    Film.findById(req.params.id, (err, foundFilm) => {
        if (err) console.log("film.js EDIT");
        else res.render("film/edit", {film: foundFilm});
    });
});

//UPDATE route
router.put("/:id", middleware.checkOwner, (req,res) => {
    Film.findByIdAndUpdate(req.params.id, req.body.film, (err, updatedFilm) => {
       if (err) console.log("film.js update route");
       else req.flash("success", "Updated film."),
            res.redirect("/film/" + req.params.id);
   });
});


// DESTROY /// [!] WORK ON THIS [!] ~~~~~~~~~!!~~~~~~~~~
router.delete("/:id", middleware.checkOwner, (req,res) => {
    Film.findByIdAndRemove(req.params.id, (err) => {
        if (err) console.log("film.js destroy");
        else req.flash("success","Film deleted."),
             res.redirect("/film");
    });
    // [!] REMOVE ASSOCIATED RESERVATIONS / USER SELECTIONS[!]
});

module.exports = router;