const Occupation = require("../Schema/occupationSchema");

// ➕ Add Occupation
exports.addOccupation = async (req, res) => {
  try {
    const { occupation } = req.body;

    if (!occupation) {
      return res.status(400).json({ message: "Occupation required" });
    }

    const exists = await Occupation.findOne({ occupation });
    if (exists) {
      return res.status(400).json({ message: "Occupation already exists" });
    }

    const newOccupation = new Occupation({ occupation });
    await newOccupation.save();

    res.status(201).json({
      message: "Occupation added successfully",
      occupation: newOccupation
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📥 Get All Occupations
exports.getOccupations = async (req, res) => {
  try {
    const occupations = await Occupation.find().sort({ occupation: 1 });
    res.status(200).json(occupations);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};