// controllers/houseVisitController.js
const HouseVisit = require('../Schema/HouseVisit');

/**
 * Add a House Visit / Donation
 * POST /api/house-visit/add
 */
exports.addHouseVisit = async (req, res) => {
  try {
    const { member_id, member_name, phone, amount, date, description, createdBy } = req.body;

    if (!member_name || !date) {
      return res.status(400).json({ status: 'fail', message: 'member_name and date required' });
    }

    const hv = new HouseVisit({
      member_id: member_id || '',
      member_name,
      phone: phone || '',
      amount: amount ? Number(amount) : 0,
      date: new Date(date),
      description: description || '',
      createdBy: createdBy || (req.user ? req.user.id : undefined)
    });

    const saved = await hv.save();
    return res.status(201).json({ status: 'success', data: saved });
  } catch (err) {
    console.error('addHouseVisit err:', err);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
};


/**
 * List House Visits with pagination, search, startDate & endDate filters
 * GET /api/house-visit/list
 * query params: page (default 1), limit (default 10), search, startDate, endDate
 */
exports.listHouseVisits = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 25) || 25);
    const search = (req.query.search || '').trim();
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    const filter = {};

    // Search: member_name, member_id, description or phone
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { member_name: regex },
        { member_id: regex },
        { description: regex },
        { phone: regex },
      ];
    }

    // Date range: inclusive (convert endDate to end of day)
    if (startDate && endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: end };
    } else if (startDate) {
      filter.date = { $gte: startDate };
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.date = { $lte: end };
    }

    const total = await HouseVisit.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const skip = (page - 1) * limit;

    const list = await HouseVisit.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.json({
      status: 'success',
      total,
      totalPages,
      page,
      limit,
      houseVisits: list,
    });
  } catch (err) {
    console.error('listHouseVisits err:', err);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
};


/**
 * Get single HouseVisit by id
 * GET /api/house-visit/:id
 */
exports.getHouseVisitById = async (req, res) => {
  try {
    const id = req.params.id;
    const hv = await HouseVisit.findById(id).lean();
    if (!hv) return res.status(404).json({ status: 'fail', message: 'Not found' });
    return res.json({ status: 'success', data: hv });
  } catch (err) {
    console.error('getHouseVisitById err:', err);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
};
