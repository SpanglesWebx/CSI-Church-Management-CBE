const Notification = require("../Schema/NotificationSchema");
exports.addNotification = async (req, res) => {

    try {

        const { heading, items } = req.body;

        const doc = await Notification.create({
            heading,
            items,
            status: "Active"
        });

        res.json({
            message: "Notification saved",
            data: doc
        });

    } catch (err) {
        res.status(500).json({ message: "Error saving notification" });
    }

};


exports.listNotifications = async (req, res) => {

    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 25;
        const skip = (page - 1) * limit;

        const search = req.query.search || "";

        const status = req.query.status;

        const filter = {};

        if (search) {
            filter.heading = { $regex: search, $options: "i" };
        }

        if (status) {
            filter.status = status;
        }

        const data = await Notification
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Notification.countDocuments(filter);

        res.json({
            data,
            totalPages: Math.ceil(total / limit)
        });

    } catch (err) {
        res.status(500).json({ message: "Error" });
    }

};



exports.updateNotificationStatus = async (req, res) => {

    try {

        const { id } = req.params;
        const { status } = req.body;

        await Notification.findByIdAndUpdate(id, { status });

        res.json({ message: "Status updated" });

    } catch (err) {
        res.status(500).json({ message: "Error updating status" });
    }

};