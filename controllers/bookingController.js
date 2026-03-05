const Booking = require("../Schema/bookingSchema");
const MarriageHall = require("../Schema/MarriageHall");
const MarriageHallCategory = require("../Schema/MarriageHallCategory");



exports.createBooking = async (req, res) => {
  try {
    const {
      hall,
      category,
      date,
      sessions, 
      customerName,
      customerPhone,
      amount,
      advanceAmount,
      payment_status,
      booking_status,
    } = req.body;

    if (!hall || !date || !sessions?.length) {
      return res
        .status(400)
        .json({ status: "Failed", message: "hall, date and sessions are required" });
    }

    // 1. Check if ANY of the requested sessions are already booked for this hall+date
    const conflict = await Booking.findOne({
      hall,
      date: new Date(date),
      sessions: { $in: sessions },
    });

    if (conflict && conflict.customerPhone !== customerPhone) {
      return res
        .status(400)
        .json({ status: "Failed", message: "One or more sessions already booked" });
    }

    // 2. If same customer has a booking → merge sessions
    let booking = await Booking.findOne({
      hall,
      date: new Date(date),
      customerPhone,
    });

    if (booking) {
      booking.sessions = [...new Set([...booking.sessions, ...sessions])];
      booking.amount = amount;

      // update advance
      booking.advanceAmount = advanceAmount;
      booking.payment_status = payment_status;
      booking.booking_status = booking_status;
      booking.category = category;

      // add new advance entry to history
      // if (advanceAmount > 0) {
      //   booking.advanceHistory.push({
      //     amount: advanceAmount,
      //     date: new Date(),
      //   });
      // }

      await booking.save();
      return res.json({
        status: "Success",
        message: "Booking updated with new sessions",
        data: booking,
      });
    }

    // 3. Create new booking
    const initialHistory = [];

    // if (advanceAmount > 0) {
    //   initialHistory.push({
    //     amount: advanceAmount,
    //     date: new Date(),
    //   });
    // }

    booking = new Booking({
      hall,
      category,
      date,
      sessions,
      customerName,
      customerPhone,
      amount,
      advanceAmount,
      payment_status,
      booking_status,
      advanceHistory: initialHistory,
    });

    // Auto set to Paid if fully paid
    if (advanceAmount >= amount) {
      booking.payment_status = "Paid";
    }

    await booking.save();

    res.json({
      status: "Success",
      message: "Booking created successfully",
      data: booking,
    });
  } catch (err) {
    res.status(500).json({ status: "Failed", message: err.message });
  }
};


exports.getBookings = async (req, res) => {
  try {
    const { hallId, categoryId, date, startDate, endDate, search, page = 1, limit = 25 } = req.query;
    const query = {};

    if (hallId) query.hall = hallId;
    if (categoryId) query.category = categoryId;
    if (date) query.date = new Date(date);

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // 🔎 search by name or phone
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .populate("hall", "hall_name")
      .populate("category", "name")
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      status: "Success",
      message: "Bookings fetched successfully",
      data: bookings,
      total,
    });
  } catch (err) {
    res.status(500).json({ status: "Failed", message: err.message });
  }
};

// ➤ Get ALL bookings (NO pagination, NO limit)
exports.getAllBookings = async (req, res) => {
  try {
    const { hallId, categoryId, date, startDate, endDate } = req.query;
    const query = {};

    if (hallId) query.hall = hallId;
    if (categoryId) query.category = categoryId;
    if (date) query.date = new Date(date);

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const bookings = await Booking.find(query)
      .populate("hall", "hall_name")
      .populate("category", "name")
      .sort({ date: -1 });

    res.json({
      status: "Success",
      message: "All bookings fetched",
      data: bookings,
      total: bookings.length
    });
  } catch (err) {
    res.status(500).json({ status: "Failed", message: err.message });
  }
};


// ➤ Update booking (change status, payment, etc.)
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      hall,
      category,
      date,
      sessions,
      customerName,
      customerPhone,
      amount,
      // advanceAmount,
      booking_status,
      payment_status
    } = req.body;

    // --- 1. Get existing booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ status: "Failed", message: "Booking not found" });
    }

    // --- 2. Check conflicts (ignore itself)
    const conflict = await Booking.findOne({
      _id: { $ne: id },
      hall,
      date: new Date(date),
      sessions: { $in: sessions },
      booking_status: { $ne: "Cancelled" }
    });

    if (conflict) {
      return res.status(400).json({
        status: "Failed",
        message: "One or more sessions already booked"
      });
    }

    // --- 3. Update fields
    booking.hall = hall;
    booking.category = category;
    booking.date = date;
    booking.sessions = sessions;
    booking.customerName = customerName;
    booking.customerPhone = customerPhone;
    booking.amount = amount;
    // booking.advanceAmount = advanceAmount;
    booking.booking_status = booking_status;
    booking.payment_status = payment_status;

    // Prevent paid status wrongly
    if (booking.advanceAmount >= booking.amount) {
      booking.payment_status = "Paid";
    }

    await booking.save();

    return res.json({
      status: "Success",
      message: "Booking updated successfully",
      data: booking,
    });

  } catch (err) {
    res.status(500).json({ status: "Failed", message: err.message });
  }
};


// ➤ Delete booking
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) {
      return res.status(404).json({ status: "Failed", message: "Booking not found" });
    }
    res.json({ status: "Success", message: "Booking deleted" });
  } catch (err) {
    res.status(500).json({ status: "Failed", message: err.message });
  }
};



exports.checkAvailability = async (req, res) => {
  try {
    const { hallId, date, session } = req.query;

    if (!hallId || !date || !session) {
      return res.status(400).json({
        status: "Failed",
        message: "hallId, date and session are required",
      });
    }

    // session can be single string or array
    const sessions = Array.isArray(session) ? session : [session];

    const existing = await Booking.findOne({
      hall: hallId,
      date: new Date(date),
      sessions: { $in: sessions },
    });

    if (existing) {
      return res.json({
        status: "Success",
        available: false,
        message: "Slot already booked",
        booking: existing,
      });
    }

    res.json({
      status: "Success",
      available: true,
      message: "Slot is available",
    });
  } catch (err) {
    res.status(500).json({ status: "Failed", message: err.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate("hall", "hall_name")
      .populate("category", "name");

    if (!booking) {
      return res.status(404).json({
        status: "Failed",
        message: "Booking not found",
      });
    }

    res.json({
      status: "Success",
      message: "Booking fetched",
      data: booking,
    });
  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: err.message,
    });
  }
};

exports.addAdvancePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ status: "Failed", message: "Invalid amount" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ status: "Failed", message: "Booking not found" });
    }

    const remainingBalance =
      booking.amount -
      (booking.advanceAmount || 0) -
      booking.advanceHistory.reduce((sum, p) => sum + p.amount, 0);

    // prevent overpayment
    if (Number(amount) > remainingBalance) {
      return res.status(400).json({
        status: "Failed",
        message: `Payment exceeds remaining balance. Remaining: ${remainingBalance}`,
      });
    }

    // Store the payment in history (NOT in advanceAmount)
    booking.advanceHistory.push({
      amount: Number(amount),
      date: new Date(),
    });

    // COMPUTE if fully paid
    const totalPaid =
      (booking.advanceAmount || 0) +
      booking.advanceHistory.reduce((sum, p) => sum + p.amount, 0);

    if (totalPaid >= booking.amount) {
      booking.payment_status = "Paid";
    }

    await booking.save();

    res.json({
      status: "Success",
      message: "Payment added",
      data: booking,
    });
  } catch (err) {
    res.status(500).json({ status: "Failed", message: err.message });
  }
};



exports.getAdvanceHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id).select("advanceHistory amount advanceAmount");

    if (!booking) {
      return res.status(404).json({ status: "Failed", message: "Booking not found" });
    }

    res.json({
      status: "Success",
      data: {
        history: booking.advanceHistory,
        totalAdvance: booking.advanceAmount,
        totalAmount: booking.amount,
        balance: booking.amount - booking.advanceAmount,
      }
    });
  } catch (err) {
    res.status(500).json({ status: "Failed", message: err.message });
  }
};

// ➤ Add fine amount
exports.addFineAmount = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ status: "Failed", message: "Invalid fine amount" });
    }

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ status: "Failed", message: "Booking not found" });

    booking.fineAmount = (booking.fineAmount || 0) + Number(amount);
    await booking.save();

    res.json({
      status: "Success",
      message: "Fine added",
      fineAmount: booking.fineAmount
    });
  } catch (err) {
    res.status(500).json({ status: "Failed", message: err.message });
  }
};
