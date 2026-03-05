const KitchenAsset = require("../Schema/KitchenAsset");
const KitchenAssetIssue = require("../Schema/KitchenAssetIssue");


exports.issueKitchenAssets = async (req,res)=>{
  const { booking_id, hall_id, customer_name, booking_date, items } = req.body;

  // Validate stock
  for (const i of items) {
    const asset = await KitchenAsset.findById(i.asset_id);
    if (!asset) return res.status(400).json({message:`${i.item_name} not found`});
    if (i.issued_qty > asset.available_quantity)
      return res.status(400).json({message:`Insufficient stock for ${i.item_name}`});
  }

  // Reduce stock
  for (const i of items) {
    const asset = await KitchenAsset.findById(i.asset_id);
    asset.available_quantity -= i.issued_qty;
    await asset.save();
  }

  // 🔥 FIND EXISTING LEDGER
  let ledger = await KitchenAssetIssue.findOne({ booking_id });

  if (!ledger) {
    // FIRST TIME ISSUE → CREATE LEDGER
    ledger = await KitchenAssetIssue.create({
      booking_id, hall_id, customer_name, booking_date, items
    });
  } else {
    // ADD TO EXISTING LEDGER
    for (const newItem of items) {
      const existing = ledger.items.find(
        i => i.asset_id.toString() === newItem.asset_id
      );

      if (existing) {
        existing.issued_qty += newItem.issued_qty;
      } else {
        ledger.items.push(newItem);
      }
    }
    await ledger.save();
  }

  res.json({ status:"Success", message:"Assets issued successfully", data:ledger });
};

// GET /api/kitchen-asset-issues
exports.getIssuedHallAssets = async (req,res)=>{
  let { page=1, limit=25, search="" } = req.query;

  const match = search
    ? { customer_name:{ $regex:search, $options:"i" } }
    : {};

  const total = await KitchenAssetIssue.countDocuments(match);

  const data = await KitchenAssetIssue.find(match)
    .populate("hall_id","hall_name")     // get hall name
    .sort({ booking_date:-1 })
    .skip((page-1)*limit)
    .limit(parseInt(limit));

  res.json({
    data,
    totalPages: Math.ceil(total/limit)
  });
};

// GET /api/kitchen-asset-issues/by-booking/:bookingId
exports.getIssuedAssetsByBooking = async (req,res)=>{
  const { bookingId } = req.params;

  const data = await KitchenAssetIssue.find({ booking_id: bookingId })
    .populate("hall_id","hall_name")
    .sort({ createdAt:-1 });

  res.json({ data });
};


exports.bulkUpdateKitchenAssetReturn = async (req, res) => {
  const { issueId } = req.params;
  const { updates } = req.body;   // { assetId: {returned, damaged, missing} }

  const ledger = await KitchenAssetIssue.findById(issueId);
  if (!ledger) return res.status(404).json({ message: "Ledger not found" });

  for (const assetId in updates) {
    const payload = updates[assetId];

    const item = ledger.items.find(i => i.asset_id.toString() === assetId);
    if (!item) continue;

    const asset = await KitchenAsset.findById(assetId);
    if (!asset) continue;

    const returned = Number(payload.returned || 0);
    const damaged  = Number(payload.damaged  || 0);
    const missing  = Number(payload.missing  || 0);

    const totalOut = item.issued_qty - (item.returned + item.damaged + item.missing);
    const actionTotal = returned + damaged + missing;

    if (actionTotal > totalOut) {
      return res.status(400).json({
        message: `Exceeds pending quantity for ${item.item_name}`
      });
    }

    // Apply to ledger
    item.returned += returned;
    item.damaged  += damaged;
    item.missing  += missing;

    // Apply to asset stock
    asset.available_quantity += returned;
    asset.damaged += damaged;
    asset.missed += missing;

    await asset.save();
  }

  await ledger.save();

  res.json({ status: "Success", message: "All assets updated successfully" });
};
