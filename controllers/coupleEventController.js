const { CoupleEvent, CoupleEventBy } = require("../Schema/coupleEventSchema");
const CoupleEventPrize = require("../Schema/coupleEventPrizeSchema");
const CouplesFellowship = require("../Schema/CouplesFellowshipSchema");

/* ======================================
   ADD COUPLE EVENT
====================================== */

exports.addCoupleEvent = async (req, res) => {
    try {
        const event = await CoupleEvent.create(req.body);

        res.json({
            status: "Success",
            message: "Couple Event Added Successfully",
            event
        });

    } catch (err) {
        res.status(500).json({
            status: "Failed",
            message: err.message
        });
    }
};



exports.getAllCoupleEvents = async (req, res) => {
    try {

        const { search = "", page = 1, limit = 25, startDate, endDate } = req.query;

        const query = {};

        if (search) {
            query.eventName = { $regex: search, $options: "i" };
        }

        if (startDate && endDate) {
            query.eventDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const total = await CoupleEvent.countDocuments(query);

        const events = await CoupleEvent.find(query)
            .populate("eventBy")
            .sort({ eventDate: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        res.json({
            status: "Success",
            events,
            totalPages: Math.ceil(total / limit)
        });

    } catch (err) {
        res.status(500).json({
            status: "Failed",
            message: err.message
        });
    }
};



exports.saveCoupleEventBy = async (req, res) => {
    try {

        const { names } = req.body;

        // Remove deleted ones
        await CoupleEventBy.deleteMany({
            name: { $nin: names }
        });

        // Add / Update
        for (let name of names) {
            await CoupleEventBy.updateOne(
                { name },
                { name },
                { upsert: true }
            );
        }

        const eventBys = await CoupleEventBy.find();

        res.json({
            status: "Success",
            eventBys
        });

    } catch (err) {
        res.status(500).json({
            status: "Failed",
            message: err.message
        });
    }
};





/* GET PRIZES */
exports.getCouplePrizes = async (req, res) => {
    try {

        let data = await CoupleEventPrize.findOne();

        if (!data) {
            data = await CoupleEventPrize.create({ prizes: [] });
        }

        res.json({
            status: "Success",
            prizes: data.prizes
        });

    } catch (err) {
        res.status(500).json({ status: "Failed", message: err.message });
    }
};

/* SAVE PRIZES */
exports.saveCouplePrizes = async (req, res) => {
    try {

        const { prizes } = req.body;

        let data = await CoupleEventPrize.findOne();

        if (!data) {
            data = await CoupleEventPrize.create({ prizes });
        } else {
            data.prizes = prizes;
            await data.save();
        }

        res.json({
            status: "Success",
            message: "Couple Prizes Updated",
            data
        });

    } catch (err) {
        res.status(500).json({ status: "Failed", message: err.message });
    }
};




/* GET SINGLE EVENT */
exports.getSingleCoupleEvent = async (req, res) => {
  try {

    const event = await CoupleEvent.findById(req.params.eventId)
      .populate("eventBy");

    if (!event) {
      return res.status(404).json({
        status: "Failed",
        message: "Event not found"
      });
    }

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


/* UPDATE EVENT */
exports.updateCoupleEvent = async (req, res) => {
  try {

    const event = await CoupleEvent.findByIdAndUpdate(
      req.params.eventId,
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
      message: "Couple Event Updated Successfully",
      event
    });

  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: err.message
    });
  }
};




exports.getCoupleParticipantsList = async (req, res) => {
  try {

    const couples = await CouplesFellowship.find().sort({ createdAt: -1 });

    res.json({
      status: "Success",
      couples
    });

  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: err.message
    });
  }
};



exports.addCoupleParticipants = async (req, res) => {
  try {

    const { eventId, competitionId, participants } = req.body;

    const event = await CoupleEvent.findById(eventId);

    if (!event) {
      return res.status(404).json({
        status: "Failed",
        message: "Event not found"
      });
    }

    const competition = event.coupleCompetitions.id(competitionId);

    if (!competition) {
      return res.status(404).json({
        status: "Failed",
        message: "Competition not found"
      });
    }

    competition.participants = participants;

    await event.save();

    res.json({
      status: "Success",
      message: "Participants Added Successfully"
    });

  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: err.message
    });
  }
};




exports.updateCouplePrizes = async (req, res) => {
  try {
    const { eventId, competitionId, prizes } = req.body;

    const event = await CoupleEvent.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const competition = event.coupleCompetitions.id(competitionId);
    if (!competition)
      return res.status(404).json({ message: "Competition not found" });

    competition.participants.forEach((participant) => {
      const match = prizes.find(
        (p) => p.husband_id === participant.husband_id
      );
      if (match) {
        participant.prize = match.prize || "";
      }
    });

    await event.save();

    res.json({ status: "Success" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.updateCouplePrizes = async (req, res) => {
  try {
    const { eventId, competitionId, prizes } = req.body;

    const event = await CoupleEvent.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const competition = event.coupleCompetitions.id(competitionId);
    if (!competition)
      return res.status(404).json({ message: "Competition not found" });

    competition.participants.forEach((participant) => {
      const match = prizes.find(
        (p) => p.husband_id === participant.husband_id
      );
      if (match) {
        participant.prize = match.prize || "";
      }
    });

    await event.save();

    res.json({ status: "Success" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.updateCoupleParticipants = async (req, res) => {
  try {
    const { eventId, competitionId, participants } = req.body;

    const event = await CoupleEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({
        status: "Failed",
        message: "Event not found"
      });
    }

    const competition = event.coupleCompetitions.id(competitionId);
    if (!competition) {
      return res.status(404).json({
        status: "Failed",
        message: "Competition not found"
      });
    }

    competition.participants = participants;

    await event.save();

    res.json({
      status: "Success",
      message: "Participants Updated Successfully"
    });

  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: err.message
    });
  }
};