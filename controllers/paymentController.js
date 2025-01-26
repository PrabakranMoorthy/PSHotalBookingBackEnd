const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const Booking = require("../models/Booking");
const Razorpay = require("razorpay");

const razorpayInstance = new Razorpay({
  key_id: "your_razorpay_key_id",
  key_secret: "your_razorpay_key_secret",
});
// Create a new hotel (only accessible by admin)
// Endpoint for initiating a payment
exports.makePayment = async (req, res) => {
  try {
    const { amount, bookingId } = req.body;

    const options = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `receipt_${bookingId}`,
      notes: {
        bookingId: bookingId,
      },
    };

    const order = await razorpayInstance.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Error initiating Razorpay payment:", error);
    res.status(500).send("Payment initiation failed");
  }
};

exports.verifyPayment = async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const crypto = require("crypto");
  const expectedSignature = crypto
    .createHmac("sha256", "your_razorpay_key_secret")
    .update(body)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    // Payment verified, mark booking as paid
    const booking = await Booking.findById(req.body.bookingId);
    booking.paymentStatus = "Paid";
    booking.status = "Confirmed";
    await booking.save();
    res.status(200).send("Payment verified and booking confirmed");
  } else {
    const booking = await Booking.findById(req.body.bookingId);
    booking.paymentStatus = "Failed";
    booking.status = "Cancelled";
    await booking.save();
    res.status(400).send("Payment verification failed");
  }
};
