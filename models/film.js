var mongoose = require("mongoose");

var filmSchema = new mongoose.Schema({
    title: String,
    image: String,
    youtube: String,
    info: String,
    capacity: Number,
    location: String,
    reservation: [{
        type: mongoose.Schema.Types.ObjectId,
            ref: "Reservation"
        }
        ]
});

var Film = mongoose.model("Film", filmSchema);
module.exports = Film;