const express = require("express");
const {
  protect,
  admin,
  verifyAdmin,
} = require("../middlewares/authMiddleware");
const {
  createHotel,
  getHotels,
  createRoom,
  updateHotel,
  updateRoom,
} = require("../controllers/hotelController");
const { getAllBookings } = require("../controllers/bookingController");
const Booking = require("../models/Booking");
const Hotel = require("../models/Hotel");
const router = express.Router();

// Admin-only route (protected by 'admin' middleware)
router.get("/dashboard", protect, admin, (req, res) => {
  res.status(200).json({ message: "Welcome to the Admin Dashboard" });
});
// Admin routes for managing hotels and rooms
router.post("/hotel", protect, admin, createHotel); // Create a new hotel
router.get("/hotels", protect, admin, getHotels); // Get all hotels
router.put("/hotel", protect, admin, updateHotel); // Update hotel (admin-only)
router.post("/room", protect, admin, createRoom); // Create a new room for a hotel
router.put("/room", protect, admin, updateRoom); // Update room (admin-only)
// Get all bookings for the admin's hotels
router.get("/bookings", verifyAdmin, getAllBookings);
// router.get("/bookings", verifyAdmin, async (req, res) => {
//   try {
//     // Get the admin's ID from the token (set by verifyAdmin middleware)
//     const adminId = req.user._id;

//     // Find all hotels owned by the admin
//     const hotels = await Hotel.find({ admin: adminId });

//     // Extract hotel IDs
//     const hotelIds = hotels.map((hotel) => hotel._id);

//     // Find all bookings for these hotels
//     const bookings = await Booking.find({ hotel: { $in: hotelIds } })
//       .populate("user", "name email") // Populate user details
//       .populate("hotel", "name") // Populate hotel details
//       .populate("room", "name"); // Populate room details

//     res.json(bookings);
//   } catch (error) {
//     console.error("Error fetching admin bookings:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

module.exports = router;
