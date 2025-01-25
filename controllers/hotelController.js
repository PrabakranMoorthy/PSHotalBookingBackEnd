const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const Booking = require("../models/Booking");

// Create a new hotel (only accessible by admin)
exports.createHotel = async (req, res) => {
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

// Get all hotels (only those created by the admin)
exports.getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ admin: req.user.id }); // Only fetch hotels created by the logged-in admin
    res.status(200).json(hotels);
  } catch (error) {
    res.status(500).json({ message: "Error fetching hotels", error });
  }
};

exports.getHotelsUser = async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json(hotels);
  } catch (error) {
    res.status(500).json({ message: "Error fetching hotels", error });
  }
};

// Create a new room (only accessible by admin for their hotel)
exports.createRoom = async (req, res) => {
  const { hotelId, name, description, price, amenities, roomType } = req.body;

  try {
    // Check if the hotel exists and if the current admin owns the hotel
    const hotel = await Hotel.findById(hotelId);
    if (!hotel || hotel.admin.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to add a room for this hotel",
      });
    }

    const newRoom = new Room({
      hotel: hotelId,
      name,
      description,
      price,
      amenities,
      roomType,
      admin: req.user.id, // Associate the room with the admin
    });

    await newRoom.save();
    res.status(201).json({ message: "Room added successfully", room: newRoom });
  } catch (error) {
    res.status(500).json({ message: "Error creating room", error });
  }
};

// Update a hotel (only accessible by the admin who created it)
exports.updateHotel = async (req, res) => {
  const { hotelId, name, location, description, imageUrl } = req.body;

  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel || hotel.admin.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this hotel" });
    }

    hotel.name = name || hotel.name;
    hotel.location = location || hotel.location;
    hotel.description = description || hotel.description;
    hotel.imageUrl = imageUrl || hotel.imageUrl;

    await hotel.save();
    res.status(200).json({ message: "Hotel updated successfully", hotel });
  } catch (error) {
    res.status(500).json({ message: "Error updating hotel", error });
  }
};

// Update a room (only accessible by the admin who created it)
exports.updateRoom = async (req, res) => {
  const { roomId, name, description, price, amenities, roomType } = req.body;

  try {
    const room = await Room.findById(roomId);
    if (!room || room.admin.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this room" });
    }

    room.name = name || room.name;
    room.description = description || room.description;
    room.price = price || room.price;
    room.amenities = amenities || room.amenities;
    room.roomType = roomType || room.roomType;

    await room.save();
    res.status(200).json({ message: "Room updated successfully", room });
  } catch (error) {
    res.status(500).json({ message: "Error updating room", error });
  }
};

exports.getRooms = async (req, res) => {
  const { hotelId } = req.params; // Access the hotelId from the route parameter
  const { startDate, endDate } = req.query; // Access the query parameters

  // Optionally, you can parse the dates if needed
  const start = new Date(startDate);
  const end = new Date(endDate);
  try {
    // Find bookings that overlap with the given date range for the specific hotel
    const bookedRooms = await Booking.find({
      hotel: hotelId,
      $or: [
        // Overlapping booking conditions
        { startDate: { $lte: end }, endDate: { $gte: start } },
        { startDate: { $gte: start }, startDate: { $lte: end } },
        { endDate: { $gte: start }, endDate: { $lte: end } },
      ],
    }).select("room");
    console.log("booked rooms", bookedRooms);
    // Extract the list of booked room IDs
    const bookedRoomIds = bookedRooms.map((booking) => booking.room);

    // Find available rooms for the hotel that are not in the bookedRoomIds array
    const availableRooms = await Room.find({
      hotel: hotelId,
      _id: { $nin: bookedRoomIds },
    });

    res.status(200).json(availableRooms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rooms", error });
  }
};
