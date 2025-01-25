const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const Booking = require("../models/Booking");

// Create a new hotel (only accessible by admin)
exports.makePayment = async (req, res) => {
  try {
    const newHotel = new Hotel({
      ...req.body,
      admin: req.user.id, // Assign the admin who created the hotel
    });
    await newHotel.save();
    res
      .status(201)
      .json({ message: "Hotel added successfully", hotel: newHotel });
  } catch (error) {
    res.status(500).json({ message: "Error creating hotel", error });
  }
};
