const Cemetery = require("../Schema/cemeterySchema");
const CemeteryBooking = require("../Schema/cemeteryBookingSchema");


exports.bookSlot = async (req, res) => {
  try {
    const {
      cemetery_id,
      cemetery_name,
      slot_id,
      isMember,
      member,
      non_member,
      buried_person_name,
      buried_date,
    } = req.body;

// Count persons already in slot
const count = await CemeteryBooking.countDocuments({
  cemetery_id,
  slot_id,
  status: { $in: ["Reserved", "Buried"] },
});

if (count >= 4) {
  return res.status(400).json({
    message: "Slot already full (4 persons)",
  });
}


const closed = await CemeteryBooking.findOne({
  cemetery_id,
  slot_id,
  slot_closed: true,
});

if (closed) {
  return res.status(400).json({
    message: "Slot is closed",
  });
}



    // 2️⃣ Create new booking with status Reserved
const booking = new CemeteryBooking({
  cemetery_id,
  cemetery_name,
  slot_id,
  slot_number: count + 1,
  isMember,
  member: isMember ? member : null,
  non_member: !isMember ? non_member : null,
  buried_person_name: buried_person_name || "",
  buried_date: buried_date || null,
  status: "Buried",
});


    await booking.save();

    // 3️⃣ Update available slots count in cemetery
    const cemetery = await Cemetery.findById(cemetery_id);
    if (cemetery) {
      const allSlots = cemetery.slots.flat().length;

    const fullSlots = await CemeteryBooking.aggregate([
      {
        $match: {
          cemetery_id: cemetery._id,
          status: { $in: ["Reserved", "Buried"] },
        },
      },
      {
        $group: {
          _id: "$slot_id",
          count: { $sum: 1 },
        },
      },
      {
        $match: { count: { $gte: 4 } },
      },
    ]);

    cemetery.number_of_available_slots =
      cemetery.slots.flat().length - fullSlots.length;

      await cemetery.save();
    }

    return res.status(201).json({
      message: "Slot booked successfully",
      booking,
    });
  } catch (err) {
    console.error("Error booking slot:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getReservedSlots = async (req, res) => {
  try {
    let { page = 1, limit = 25, search = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    // Build search query
    const searchQuery = {
      status: { $in: ["Reserved", "Buried", "Cancelled"] }, // only active bookings
      $or: [
        { cemetery_name: { $regex: search, $options: "i" } },
        { "member.member_name": { $regex: search, $options: "i" } },
        { "non_member.name": { $regex: search, $options: "i" } },
        { slot_id: { $regex: search, $options: "i" } },
      ],
    };

    // Count total matching documents
    const totalCount = await CemeteryBooking.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalCount / limit);

    // Fetch bookings with pagination
    const bookings = await CemeteryBooking.find(searchQuery)
      .sort({ booked_at: -1 }) // latest first
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      bookings,
      totalPages,
      currentPage: page,
    });
  } catch (err) {
    console.error("Error fetching reserved slots:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllReservedSlots = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const searchQuery = {
      status: { $in: ["Reserved", "Buried"] },   // only active / blocked slots
      $or: [
        { cemetery_name: { $regex: search, $options: "i" } },
        { "member.member_name": { $regex: search, $options: "i" } },
        { "non_member.name": { $regex: search, $options: "i" } },
        { slot_id: { $regex: search, $options: "i" } },
        { buried_person_name: { $regex: search, $options: "i" } },
      ],
    };

    const bookings = await CemeteryBooking.find(searchQuery)
      .sort({ booked_at: -1 });

    return res.status(200).json({ bookings });
  } catch (err) {
    console.error("Error fetching reserved slots:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Update slot status (Buried or Cancelled)
exports.updateSlotStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, buried_person_name } = req.body;

    if (!["Buried", "Cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find booking by ID
    const booking = await CemeteryBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // If already buried and trying to change, block it
    if (booking.status === "Buried") {
      return res
        .status(400)
        .json({ message: "Buried slots cannot be modified" });
    }

    if (status === "Buried" && !booking.buried_person_name) {
  booking.buried_person_name = buried_person_name || "";
}

    // Update status
    booking.status = status;
    await booking.save();

// check slot count after update
const count = await CemeteryBooking.countDocuments({
  cemetery_id: booking.cemetery_id,
  slot_id: booking.slot_id,
  status: { $in: ["Reserved", "Buried"] },
});

const cemetery = await Cemetery.findById(booking.cemetery_id);

if (cemetery) {
  if (count >= 4) {
    // slot full → reduce available
    cemetery.number_of_available_slots =
      Math.max(cemetery.number_of_available_slots - 1, 0);
  }
  await cemetery.save();
}


    return res.status(200).json({
      message: `Slot successfully marked as ${status}`,
      booking,
    });
  } catch (err) {
    console.error("Error updating slot status:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



exports.closeSlot = async (req, res) => {
  try {
    const { cemetery_id, slot_id } = req.body;

    await CemeteryBooking.updateMany(
      { cemetery_id, slot_id },
      { slot_closed: true }
    );

    return res.json({ message: "Slot closed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
