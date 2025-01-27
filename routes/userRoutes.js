const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { getHotelsUser, getRooms } = require("../controllers/hotelController");
const { createBooking } = require("../controllers/bookingController");
const {
  makePayment,
  verifyPayment,
} = require("../controllers/paymentController");
const Booking = require("../models/Booking");
const Hotel = require("../models/Hotel");
const router = express.Router();

router.get("/hotels", protect, getHotelsUser); // Get all hotels
router.get("/rooms/:hotelId", protect, getRooms);
router.post("/bookings", protect, createBooking); // Create a new booking
router.post("/payment", protect, makePayment);
router.post("/verify", protect, verifyPayment);

module.exports = router;
