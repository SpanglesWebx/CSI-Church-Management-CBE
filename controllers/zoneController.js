const Zone = require("../Schema/zoneSchema");

// Add Zone
exports.addZone = async (req, res) => {
  try {
    const { zone } = req.body;

    if (!zone) {
      return res.status(400).json({ message: "Zone name required" });
    }

    const exists = await Zone.findOne({ zone });
    if (exists) {
      return res.status(400).json({ message: "Zone already exists" });
    }

    const newZone = new Zone({ zone });
    await newZone.save();

    res.status(201).json({ message: "Zone added successfully", zone: newZone });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get All Zones
exports.getZones = async (req, res) => {
  try {
    const zones = await Zone.find().sort({ zone: 1 });
    res.status(200).json(zones);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.addArea = async (req, res) => {
  try {
    const { zone, area } = req.body;

    if (!zone || !area) {
      return res.status(400).json({ message: "Zone & Area required" });
    }

    const zoneDoc = await Zone.findOne({ zone });

    if (!zoneDoc) {
      return res.status(404).json({ message: "Zone not found" });
    }

    // Prevent duplicates
    if (zoneDoc.areas.includes(area)) {
      return res.status(400).json({ message: "Area already exists in this zone" });
    }

    zoneDoc.areas.push(area);
    await zoneDoc.save();

    return res.status(201).json({
      message: "Area added successfully",
      zone: zoneDoc
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAreasByZone = async (req, res) => {
  try {
    const { zone } = req.params;
    const zoneDoc = await Zone.findOne({ zone });

    if (!zoneDoc) {
      return res.status(404).json({ message: "Zone not found" });
    }

    res.status(200).json(zoneDoc.areas);

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
