const Shop = require("../Schema/Shop");

// Add Shop
exports.addShop = async (req, res) => {
  try {
    const { shop_name, location, area, description } = req.body;

    if (!shop_name || !location) {
      return res.status(400).json({ message: "Shop Name & Location required" });
    }

    const newShop = new Shop({
      shop_name,
      location,
      area,
      description,
      availability: "Vacant" // default
    });

    await newShop.save();
    return res.status(201).json({ message: "Shop added successfully", newShop });

  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Get paginated + search shops
exports.getShops = async (req, res) => {
  try {
    let { page = 1, search = "", status = "All" } = req.query;
    page = Number(page);
    const pageSize = 25;

    let query = {};

    // SEARCH FILTER
    if (search.trim() !== "") {
      query.$or = [
        { shop_name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } }
      ];
    }

    // AVAILABILITY FILTER
    if (status !== "All") {
      query.availability = status; // "Vacant" or "Full"
    }

    const totalCount = await Shop.countDocuments(query);
    const totalPages = Math.ceil(totalCount / pageSize);

    const shops = await Shop.find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    return res.json({
      shops,
      totalPages,
      currentPage: page,
      totalCount
    });

  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};



// Change availability later
exports.updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { availability } = req.body;

    if (!["Vacant", "Full"].includes(availability)) {
      return res.status(400).json({ message: "Invalid availability" });
    }

    const updated = await Shop.findByIdAndUpdate(id, { availability }, { new: true });

    return res.json({ message: "Availability updated", updated });

  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.searchShopByName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json([]);

    const shops = await Shop.find({
      shop_name: { $regex: name, $options: "i" },
      availability: "Vacant"
    }).select("shop_name location");

    if (shops.length === 0) {
      return res.json([{ shop_name: "none", location: "No vacant shops found" }]);
    }

    return res.json(shops);

  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};