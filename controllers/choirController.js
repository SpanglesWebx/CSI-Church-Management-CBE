const ChoirMember = require("../Schema/ChoirMemberSchema");
const ChoirMaster = require("../Schema/ChoirMasterSchema");
const ChoirEventPrize = require("../Schema/choirEventPrizeSchema");
const { ChoirEvent, ChoirEventBy } = require("../Schema/choirEventSchema");



// Add a new Choir Member
exports.addChoirMember = async (req, res) => {
  try {
    const { member_id, member_name, member_tamil_name, mobile_number } = req.body;

    if (!member_id || !member_name) {
      return res.status(400).json({ message: "Member ID and Name are required" });
    }

    // Check if member already exists
    const existingMember = await ChoirMember.findOne({ member_id });
    if (existingMember) {
      return res.status(400).json({ message: "Member already exists" });
    }

    const newMember = new ChoirMember({
      member_id,
      member_name,
      member_tamil_name,
      mobile_number,
    });

    await newMember.save();
    res.status(201).json({ message: "Choir member added successfully", member: newMember });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all Choir Members (with optional pagination)
exports.getChoirMembers = async (req, res) => {
  try {
    const { page = 1, limit = 25, search = "" } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    let query = {};
    if (search) {
      query = {
        $or: [
          { member_name: { $regex: search, $options: "i" } }, // case-insensitive
          { member_id: { $regex: search, $options: "i" } }
        ]
      };
    }

    const total = await ChoirMember.countDocuments(query);
    const members = await ChoirMember.find(query)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    res.json({ members, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


    



exports.addEvent = async (req, res) => {
  try {

  

    const event = await ChoirEvent.create(req.body);

    res.json({
      status: "Success",
      message: "Choir Event Added",
      event
    });

  } catch (err) {

    res.status(500).json({
      status: "Failed",
      message: err.message
    });
  }
};



exports.getEventById = async (req, res) => {
  try {

    const { id } = req.params;

    const event = await ChoirEvent
      .findById(id)
      .populate("eventBy");



    res.json({
      status: "Success",
      event
    });

  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: err.message
    });
  }
};

exports.updateEvent = async (req, res) => {
  try {

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: "Failed",
        message: "Event ID missing"
      });
    }

    const event = await ChoirEvent.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!event) {
      return res.status(404).json({
        status: "Failed",
        message: "Event not found"
      });
    }

    res.json({
      status: "Success",
      message: "Choir Event Updated",
      event
    });

  } catch (err) {

    res.status(500).json({
      status: "Failed",
      message: err.message
    });

  }
};





exports.getEventBy = async (req, res) => {
  try {

    const eventBys = await ChoirEventBy.find().sort({ createdAt: -1 });

    res.json({ eventBys });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.saveEventBy = async (req, res) => {
  try {

    const { names } = req.body;

    await ChoirEventBy.deleteMany();

    const data = names.map(n => ({ name: n }));

    await ChoirEventBy.insertMany(data);

    const eventBys = await ChoirEventBy.find();

    res.json({ eventBys });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const { search, startDate, endDate, page = 1, limit = 25 } = req.query;

    const query = {};

    // SEARCH
    if (search) {
      query.eventName = { $regex: search, $options: "i" };
    }

    // DATE FILTER
    if (startDate || endDate) {
      query.eventDate = {};

      if (startDate) {
        query.eventDate.$gte = new Date(startDate);
      }

      if (endDate) {
        query.eventDate.$lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;

    const events = await ChoirEvent.find(query)
      .sort({ eventDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ChoirEvent.countDocuments(query);

    res.json({
      status: "Success",
      events,
      totalPages: Math.ceil(total / limit),
      page: Number(page),
    });
  } catch (err) {
    res.status(500).json({ status: "Failed", message: err.message });
  }
};




exports.savePrizes = async (req, res) => {
  try {
    const { prizes } = req.body;

    if (!prizes) {
      return res.status(400).json({
        status: "Failed",
        message: "Prizes required",
      });
    }

    let prizeDoc = await ChoirEventPrize.findOne();

    if (!prizeDoc) {
      prizeDoc = new ChoirEventPrize({ prizes });
    } else {
      prizeDoc.prizes = prizes;
    }

    await prizeDoc.save();

    res.json({
      status: "Success",
      message: "Prizes updated successfully",
      data: prizeDoc,
    });

  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};




exports.getPrizes = async (req, res) => {
  try {
    const prizeDoc = await ChoirEventPrize.findOne();

    res.json({
      status: "Success",
      prizes: prizeDoc?.prizes || [],
    });

  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};




exports.getParticipantsList = async (req, res) => {
  try {

    const members = await ChoirMember.find();

    const masters = await ChoirMaster.find({
      status: "Active"
    });

    const formattedMasters = masters.map(m => ({
      member_id: m.memberId || m._id,
      member_name: m.isMember ? m.memberName : m.nonMemberName,
      member_tamil_name: "",
      phone: m.phone || m.nonMemberPhone
    }));

    const final = [
      ...members,
      ...formattedMasters
    ];

    res.json({
      status: "Success",
      members: final
    });

  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: err.message
    });
  }
};




exports.addParticipants = async (req, res) => {
  try {

    const { eventId, participants } = req.body;

    const event = await ChoirEvent.findById(eventId);

    if (!event) {
      return res.status(404).json({
        status: "Failed",
        message: "Event not found"
      });
    }

    participants.forEach(block => {

      const comp = event.choirCompetitions.id(block.competitionId);

      if (!comp) return;

      block.members.forEach(m => {

        const exists = comp.participants.some(
          p => String(p.member_id) === String(m.member_id)
        );

        if (!exists) {
          comp.participants.push({
            member_id: m.member_id,
            member_name: m.member_name,
            member_tamil_name: m.member_tamil_name || "",
            prize: ""
          });
        }

      });

    });

    await event.save();

    res.json({
      status: "Success",
      message: "Participants added",
      event
    });

  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: err.message
    });
  }
};




exports.updateParticipants = async (req, res) => {

  try {

    const { eventId, competitionId, participants } = req.body;

    const event = await ChoirEvent.findById(eventId);

    const comp = event.choirCompetitions.id(competitionId);

    comp.participants = participants;

    await event.save();

    res.json({
      status: "Success",
      message: "Participants updated",
      event
    });

  } catch (err) {

    res.status(500).json({
      status: "Failed",
      message: err.message
    });

  }

};



exports.updatePrizes = async (req, res) => {
  const { eventId, competitionId, prizes } = req.body;

  const event = await ChoirEvent.findById(eventId);
  const competition = event.choirCompetitions.id(competitionId);

  prizes.forEach((p) => {
    const participant = competition.participants.find(
      (x) => x.member_id === p.member_id
    );
    if (participant) participant.prize = p.prize;
  });

  await event.save();

  res.json({ status: "Success", message: "Prizes updated" });
};