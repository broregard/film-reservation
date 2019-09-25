var mongoose = require("mongoose");
var Film = require("./models/film.js");
var Reservation = require("./models/reservation.js");

var data = [
    {title: "The Highrise",
     image: "https://farm5.staticflickr.com/4072/4415835531_c97b16a6dc.jpg",
     location: "Room 101",
     capacity: 10,
     info: "Class struggle becomes all too real as a young doctor moves into a modern apartment block in suburban 1975 London. Drugs, drink & debauchery dissolve into murder, mayhem and misogyny in this pseudo-post-apocalyptic breakdown of societal norms."
    },
    {title: "Herlad Tribune",
     image: "https://farm4.staticflickr.com/3179/2777524492_fccdded5bc.jpg",
     capacity: 8,
     location: "Room 343",
     info: "Class struggle becomes all too real as a young doctor moves into a modern apartment block in suburban 1975 London. Drugs, drink & debauchery dissolve into murder, mayhem and misogyny in this pseudo-post-apocalyptic breakdown of societal norms."
    },
    {title: "Secretariat",
     image: "https://farm6.staticflickr.com/5062/5796088408_2370829900.jpg",
     location: "Room 244",
     capacity: 6
    }
    ];

var seedDB = function() {
    Film.remove({}, (err) => {
        if (err) console.log(err);
        else {
            Reservation.remove({}, err => {
                if (err) console.log(err);}
            );
            
            
            
            console.log("removed reservations")
            console.log("removed films");
            data.forEach(seed => {
                Film.create(seed, (err, film) => {
                    if (err) console.log(err);
                    else {
                        console.log("added a film");
                    }
                });
            });
        }
    });
}

module.exports = seedDB;