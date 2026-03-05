const Register = require("../Schema/MarriageHallAssetRegister");
const IssuedHallAsset = require("../Schema/IssuedHallAsset");

exports.saveHallAsset = async (req, res) => {
  const { hall_id, hall_name, category_id, category_name, item_name, quantity } = req.body;

  let hall = await Register.findOne({ hall_id });

  if (!hall) {
    hall = await Register.create({ hall_id, hall_name, categories: [] });
  }

  // Find category index
  let catIndex = hall.categories.findIndex(
    c => c.category_id.toString() === category_id
  );

  // If not exist, push and re-point
  if (catIndex === -1) {
    hall.categories.push({
      category_id,
      category_name,
      items: []
    });
    catIndex = hall.categories.length - 1;
  }

  // Now safely work with tracked subdoc
  const cat = hall.categories[catIndex];

  const itemIndex = cat.items.findIndex(i => i.item_name === item_name);

  if (itemIndex !== -1) {
    cat.items[itemIndex].quantity += Number(quantity);
  } else {
    cat.items.push({ item_name, quantity: Number(quantity) });
  }

  await hall.save();
  res.json({ message: "Asset quantity saved correctly" });
};


// controllers/mrghallAssetRegisterController.js

exports.getHallAssets = async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 25;
  const search = req.query.search || "";

  const match = search
    ? { hall_name: { $regex: search, $options: "i" } }
    : {};

  const pipeline = [
    { $match: match },
    {
      $addFields: {
        noOfCategories: { $size: "$categories" },
        noOfItems: {
          $sum: {
            $map: {
              input: "$categories",
              as: "c",
              in: { $size: "$$c.items" }
            }
          }
        },
        totalQuantity: {
          $sum: {
            $map: {
              input: "$categories",
              as: "c",
              in: { $sum: "$$c.items.quantity" }
            }
          }
        }
      }
    },
    { $sort: { hall_name: 1 } },
    {
      $facet: {
        data: [
          { $skip: (page - 1) * limit },
          { $limit: limit }
        ],
        count: [{ $count: "total" }]
      }
    }
  ];

  const result = await Register.aggregate(pipeline);

  const data = result[0].data;
  const total = result[0].count[0]?.total || 0;

  res.json({
    data,
    totalPages: Math.ceil(total / limit)
  });
};

exports.getSingleHallAsset = async (req, res) => {
  const data = await Register.findOne({ hall_id: req.params.id });
  res.json({ data });
};

exports.updateHallAssets = async (req, res) => {
  await Register.updateOne({ hall_id: req.params.id }, { $set: { categories: req.body.categories } });
  res.json({ message:"Assets updated successfully" });
};

exports.issueAssets = async (req, res) => {
  const { booking_id, hall_id, category_id, items, customer_name } = req.body;

  const hallStock = await Register.findOne({ hall_id });
  if (!hallStock) return res.status(404).json({ message: "Hall stock not found" });

  const category = hallStock.categories.find(
    c => c.category_id.toString() === category_id
  );
  if (!category) return res.status(404).json({ message: "Category not found in hall" });

  // Validate stock first
  for (const it of items) {
    const stockItem = category.items.find(i => i.item_name === it.item_name);
    if (!stockItem || stockItem.quantity < it.issued_qty) {
      return res.status(400).json({ message: `${it.item_name} insufficient stock` });
    }
  }

  // Deduct only after validation passes
  for (const it of items) {
    const stockItem = category.items.find(i => i.item_name === it.item_name);
    stockItem.quantity -= it.issued_qty;
  }

  await hallStock.save();

  // Log issued assets
  await IssuedHallAsset.create({
    booking_id,
    hall_id,
    hall_name: hallStock.hall_name,
    customer_name,
    date: new Date(),
    category_id,
    category_name: category.category_name,
    items
  });

  res.json({ status: "Success", message: "Assets issued successfully" });
};

exports.getHallIssueHistory = async (req, res) => {
  const { hallId } = req.params;

  const logs = await IssuedHallAsset.find({ hall_id: hallId })
    .sort({ createdAt: -1 });

  res.json({ data: logs });
};

  
exports.getIssuedByBooking = async (req, res) => {
  const data = await IssuedHallAsset.findOne({ booking_id: req.params.bookingId });
  res.json({ data: data?.items || [] });
};

exports.returnAssets = async (req, res) => {
  const { booking_id, hall_id, items } = req.body;

  const hallStock = await Register.findOne({ hall_id });
  const issuedLog = await IssuedHallAsset.findOne({ booking_id });

  for (const r of items) {
    const issuedItem = issuedLog.items.find(i => i.item_name === r.item_name);
    const stockItem = hallStock.categories.flatMap(c=>c.items)
                     .find(i=>i.item_name===r.item_name);

    if (!issuedItem || !stockItem) continue;

    issuedItem.returned += r.returned || 0;
    issuedItem.damaged  += r.damaged  || 0;
    issuedItem.missing  += r.missing  || 0;

    // only perfect returns go back to stock
    stockItem.quantity += r.returned || 0;
  }

  await issuedLog.save();
  await hallStock.save();

  res.json({ status:"Success", message:"Assets returned & stock updated" });
};

