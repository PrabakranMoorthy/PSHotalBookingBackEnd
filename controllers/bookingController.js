const Booking = require("../models/Booking");

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("room").populate("user");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error });
  }
};

// Update booking status (e.g., Confirmed, Cancelled)
exports.updateBookingStatus = async (req, res) => {
  const { bookingId, status } = req.body;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = status;
    await booking.save();
    res
      .status(200)
      .json({ message: "Booking status updated successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Error updating booking status", error });
  }
};
