const HarvestCollection = require("../Schema/harvestCollectionSchema");

// ➤ ADD HARVEST COLLECTION
exports.addHarvest = async (req, res) => {
  try {
    const newData = new HarvestCollection(req.body);
    await newData.save();

    return res.status(201).json({
      status: "Success",
      message: "Harvest collection saved",
    });
  } catch (err) {
    console.error("Add Harvest Error:", err);
    return res.status(500).json({
      status: "Failed",
      message: "Server Error",
    });
  }
};

// ➤ GET HARVEST COLLECTION LIST WITH PAGINATION + SEARCH + DATE FILTER
exports.getHarvestList = async (req, res) => {
  try {
    let { page = 1, limit = 25, search = "", startDate, endDate } = req.query;

    page = Number(page);
    limit = Number(limit);

    const query = {};

    // Search filter (match member name OR ID)
    if (search) {
      query.$or = [
        { member_name: { $regex: search, $options: "i" } },
        { member_id: { $regex: search, $options: "i" } },
      ];
    }

    // Date filters
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const total = await HarvestCollection.countDocuments(query);

    const harvest = await HarvestCollection.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      status: "Success",
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      harvest,
    });
  } catch (err) {
    console.error("Get Harvest List Error:", err);
    return res.status(500).json({
      status: "Failed",
      message: "Server Error",
    });
  }
};

// ➤ GET SINGLE HARVEST ENTRY
exports.getSingleHarvest = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await HarvestCollection.findById(id);

    if (!data) {
      return res.status(404).json({
        status: "Failed",
        message: "Record not found",
      });
    }

    return res.status(200).json({
      status: "Success",
      data,
    });
  } catch (err) {
    console.error("Get Single Harvest Error:", err);
    return res.status(500).json({
      status: "Failed",
      message: "Server Error",
    });
  }
};
