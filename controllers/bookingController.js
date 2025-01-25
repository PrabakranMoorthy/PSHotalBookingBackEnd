const Booking = require("../models/Booking");
const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const User = require("../models/User");

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const { hotelId, roomId, startDate, endDate, totalPrice } = req.body;

    // Find the room to check availability
    const foundRoom = await Room.findById(roomId);
    if (!foundRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check if the room is available within the selected date range
    const existingBookings = await Booking.find({
      roomId,
      $or: [
        { startDate: { $lt: endDate }, endDate: { $gt: startDate } }, // Overlapping booking check
      ],
    });

    if (existingBookings.length > 0) {
      return res
        .status(400)
        .json({ message: "Room is already booked for the selected dates" });
    }

    // Create the booking
    const newBooking = new Booking({
      user: req.user.id,
      hotel: hotelId,
      room: roomId,
      startDate,
      endDate,
      totalPrice: foundRoom.price,
      status: "Pending",
      paymentStatus: "Pending",
    });

    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (error) {
    console.error("Error creating booking:", error.message);
    res.status(500).json({ message: "Failed to create booking" });
  }
};

// Get all bookings for the logged-in user
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("hotel", "name location")
      .populate("room", "name type")
      .populate("user", "name email");

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error.message);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

// Admin: Get all bookings for hotels they manage
const getAllBookings = async (req, res) => {
  try {
    const adminId = req.user._id;

    // Fetch hotels managed by the admin
    const hotels = await Hotel.find({ admin: adminId });
    const hotelIds = hotels.map((hotel) => hotel._id);

    // Fetch bookings for those hotels
    const bookings = await Booking.find({ hotel: { $in: hotelIds } })
      .populate("user", "name email")
      .populate("room", "name type")
      .populate("hotel", "name location");

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching all bookings:", error.message);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

// Admin: Update booking status (Pending, Confirmed, Cancelled)
const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, status, paymentStatus } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Admin can update any booking status
    booking.status = status || booking.status;
    booking.paymentStatus = paymentStatus || booking.paymentStatus;

    const updatedBooking = await booking.save();
    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking status:", error.message);
    res.status(500).json({ message: "Failed to update booking status" });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getAllBookings,
  updateBookingStatus,
};
