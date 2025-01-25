const express = require("express");
const { protect, admin } = require("../middlewares/authMiddleware");
const {
  getAllBookings,
  updateBookingStatus,
  createBooking,
  getUserBookings,
} = require("../controllers/bookingController");
const router = express.Router();

// User routes for creating and viewing bookings
router.post("/", protect, createBooking); // Create a new booking
router.get("/", protect, getUserBookings); // Get all bookings for the logged-in user

// Admin routes for managing bookings
router.get("/bookings", protect, admin, getAllBookings); // Get all bookings (admin)
router.put("/booking/status", protect, admin, updateBookingStatus); // Update booking status (admin)

module.exports = router;
