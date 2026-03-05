const ShopRental = require("../Schema/ShopRental");
const Shop = require("../Schema/Shop");
const generateLesseId = require("../util/generateLesseId");
const mongoose = require("mongoose");

exports.getNewLesseId = async (req, res) => {
  try {
    const lesse_id = await generateLesseId();
    return res.json({ lesse_id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


exports.addRental = async (req, res) => {
  try {
    let {
      shopkeeper_name,
      mobile_number,
      aadhar_number,
      address,
      shop_id,
      shop_name,
      shop_location,
      type_of_business,
      advance_amount,
      rental_amount,
      billing_cycle_date,
      rental_start_date,
      number_of_months,
      description
    } = req.body;

    if (!shop_id) {
      return res.status(400).json({ message: "Shop ID required" });
    }

    // Auto-generate Lesse ID
    const lesse_id = await generateLesseId();

    // Calculate Renewal date
    const start = new Date(rental_start_date);
    const renewal_date = new Date(start);
    renewal_date.setMonth(start.getMonth() + Number(number_of_months));

    // Save rental entry
    const rental = new ShopRental({
      lesse_id,
      shopkeeper_name,
      mobile_number,
      aadhar_number,
      address,
      shop_id,
      shop_name,
      shop_location,
      type_of_business,
      advance_amount,
      rental_amount,
      billing_cycle_date,
      rental_start_date,
      number_of_months,
      renewal_date,
      description,
      rental_status: "Active"
    });

    await rental.save();

    // Mark shop as FULL
    await Shop.findByIdAndUpdate(shop_id, { availability: "Full" });

    return res.json({ message: "Rental created successfully", rental });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getRentals = async (req, res) => {
  try {
    let { page = 1, search = "", status = "All" } = req.query;
    page = Number(page);
    const limit = 25;

    let query = {};

    if (search.trim() !== "") {
      query.$or = [
        { shopkeeper_name: { $regex: search, $options: "i" } },
        { shop_name: { $regex: search, $options: "i" } }
      ];
    }

    if (status !== "All") {
      query.rental_status = status;
    }

    const total = await ShopRental.countDocuments(query);

    const rentals = await ShopRental.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      rentals,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalCount: total
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRentalById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid rental ID" });
    }

    const rental = await ShopRental.findById(id);

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    res.json(rental);

  } catch (err) {
    console.error("Get rental by ID error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const { id } = req.params;
    let { page = 1, limit = 10 } = req.query;

    page = Number(page);
    limit = Number(limit);

    const rental = await ShopRental.findById(id);

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    const allPayments = rental.payments || [];

    const totalPayments = allPayments.length;
    const totalPages = Math.ceil(totalPayments / limit);

    const start = (page - 1) * limit;
    const end = start + limit;

    const paginated = allPayments.slice(start, end);

    return res.json({
      payments: paginated,
      totalPages,
      currentPage: page,
      totalCount: totalPayments
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.addPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, amount } = req.body;

    if (!date || !amount) {
      return res.status(400).json({ message: "Date and amount are required" });
    }

    const rental = await ShopRental.findById(id);

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    // Push new payment with shop details
    rental.payments.push({
      date: new Date(date),
      amount: Number(amount),
      shop_id: rental.shop_id,
      shop_name: rental.shop_name,
      shop_location: rental.shop_location
    });

    await rental.save();

    return res.json({
      message: "Payment added successfully",
      payments: rental.payments
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateRentalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, shopId } = req.body;

    const rental = await ShopRental.findById(id);
    if (!rental) return res.status(404).json({ message: "Rental not found" });

    // Update rental status
    rental.rental_status = status;
    await rental.save();

    // Update SHOP availability
    if (shopId) {
      await Shop.findByIdAndUpdate(
        shopId,
        { availability: status === "Inactive" ? "Vacant" : "Full" },
        { new: true }
      );
    }

    return res.json({ message: "Status updated successfully" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};
