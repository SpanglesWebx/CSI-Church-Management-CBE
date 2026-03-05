const Donation = require("../Schema/missionarySundayDonationSchema");

// ➤ Add Donation
exports.addDonation = async (req, res) => {
    try {
        const { amount, date, description } = req.body;

        if (!amount || !date) {
            return res.status(400).json({ status: "Failed", message: "All fields are required" });
        }

        await Donation.create({ amount, date, description });

        res.json({ status: "Success", message: "Donation added successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "Failed", message: "Server error" });
    }
};

// ➤ Fetch Donations with Pagination / Search / Filter
exports.getDonations = async (req, res) => {
    try {
        const { page = 1, search = "", startDate = "", endDate = "" } = req.query;
        const limit = 25;
        const skip = (page - 1) * limit;

        let filter = {};

        // Search by amount
        if (search) {
            filter.amount = { $regex: search, $options: "i" };
        }

        // Date filters
        if (startDate && endDate) {
            filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const total = await Donation.countDocuments(filter);

        const donations = await Donation.find(filter)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            status: "Success",
            donations,
            totalPages: Math.ceil(total / limit),
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "Failed", message: "Server error" });
    }
};
