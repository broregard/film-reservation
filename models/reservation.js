var mongoose = require("mongoose");

var reservationSchema = mongoose.Schema({
    date: { type: Date, default: Date.now() },
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    film: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Film"
        },
        title: String,
        image: String,
        info: String
    }
});

module.exports = mongoose.model("Reservation", reservationSchema);