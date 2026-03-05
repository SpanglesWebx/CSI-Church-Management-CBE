const AsanamZone = require("../Schema/asanamZoneSchema");

// ➕ Add Zone
exports.addZone = async (req, res) => {
  try {
    const { zone_name } = req.body;

    if (!zone_name) {
      return res.status(400).json({ message: "Zone name is required" });
    }

    const exists = await AsanamZone.findOne({
      zone_name: zone_name.trim(),
    });

    if (exists) {
      return res.status(409).json({ message: "Zone already exists" });
    }

    const zone = await AsanamZone.create({
      zone_name: zone_name.trim(),
    });

    res.status(201).json({ data: zone });
  } catch (err) {
    res.status(500).json({ message: "Failed to add zone" });
  }
};

// 📄 List Zones
exports.getZones = async (req, res) => {
  try {
    const zones = await AsanamZone.find().sort({ zone_name: 1 });
    res.json({ data: zones });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch zones" });
  }
};
