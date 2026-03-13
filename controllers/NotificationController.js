const Notification = require("../Schema/NotificationSchema");





exports.addNotification = async (req, res) => {

  try {

    const { heading, items } = req.body;

    const notification = await Notification.create({
      heading,
      items,
      status: "Active"
    });

    // 🔔 Real-time emit
    const io = req.app.get("io");

    io.emit("new_notification", notification);

    res.json({
      success: true,
      data: notification
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Error saving notification"
    });

  }

};






exports.getMemberNotifications = async (req, res) => {

  try {

    const { memberId } = req.params;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const notifications = await Notification
      .find({ status: "Active" })
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();

    const formatted = notifications
      .map(n => {

        // filter items by date
        const validItems = n.items.filter(item => {

          const itemDate = new Date(item.date);
          itemDate.setHours(0, 0, 0, 0);

          return today <= itemDate;

        });

        // remove notification if no valid items
        if (validItems.length === 0) return null;

        // check seen status
        const seen = n.seenBy.some(s => s.memberId === memberId);

        return {
          _id: n._id,
          heading: n.heading,
          items: validItems,
          createdAt: n.createdAt,
          updatedAt: n.updatedAt, 
          seen
        };

      })
      .filter(Boolean);

    res.json({
      success: true,
      notifications: formatted
    });

  } catch (err) {

    console.error("Member notification error:", err);

    res.status(500).json({
      success: false
    });

  }

};



exports.updateNotification = async (req, res) => {

  try {

    const { id } = req.params;
    const { heading, items } = req.body;

    const updated = await Notification.findByIdAndUpdate(
      id,
      {
        heading,
        items,
        seenBy: []   // 🔔 Reset seen status after edit
      },
      { new: true }
    );

    // optional realtime emit
    const io = req.app.get("io");
    io.emit("new_notification", updated);

    res.json({
      success: true,
      data: updated
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Update failed"
    });

  }

};


exports.markSeen = async (req, res) => {

  try {

    const { notificationId, memberId } = req.body;

    await Notification.updateOne(
      {
        _id: notificationId,
        "seenBy.memberId": { $ne: memberId } // only if not exists
      },
      {
        $push: {
          seenBy: {
            memberId,
            seenAt: new Date()
          }
        }
      }
    );

    res.json({ success: true });

  } catch (err) {

    console.error("Mark seen error:", err);

    res.status(500).json({ success: false });

  }

};




exports.markAllSeen = async (req, res) => {

  try {

    const { memberId } = req.body;

    await Notification.updateMany(
      {
        status: "Active",
        "seenBy.memberId": { $ne: memberId }
      },
      {
        $push: {
          seenBy: {
            memberId,
            seenAt: new Date()
          }
        }
      }
    );

    res.json({ success: true });

  } catch (err) {

    console.error(err);
    res.status(500).json({ success: false });

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