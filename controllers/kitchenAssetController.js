const KitchenAsset = require("../Schema/KitchenAsset");

/* ➤ ADD / INCREASE STOCK */
exports.addKitchenAsset = async (req,res)=>{
  const { item_name, quantity } = req.body;

  let asset = await KitchenAsset.findOne({ item_name });

  if(asset){
    asset.total_quantity += Number(quantity);
  } else {
    asset = new KitchenAsset({ item_name, total_quantity: quantity });
  }

  asset.available_quantity =
    asset.total_quantity -
    (asset.damaged + asset.missed + asset.sold_out);

  await asset.save();
  res.json({ status:"Success", message:"Kitchen asset updated", data:asset });
};


/* ➤ RETURN / DAMAGE / DEMOLISH / SELL */
exports.updateKitchenMovement = async (req,res)=>{
  const { id } = req.params;
  const { returned, damaged, missed, sold_out, sold_to } = req.body;

  const asset = await KitchenAsset.findById(id);

  if(returned)   asset.returned   += Number(returned);
  if(damaged)    asset.damaged    += Number(damaged);
  if(missed) asset.missed += Number(missed);
  if(sold_out)   asset.sold_out   += Number(sold_out);
  if(sold_to)    asset.sold_to = sold_to;

  asset.available_quantity =
    asset.total_quantity -
    (asset.damaged + asset.missed + asset.sold_out);

  await asset.save();
  res.json({ status:"Success", message:"Kitchen asset movement updated" });
};


/* ➤ LIST WITH SEARCH + PAGINATION */
exports.getKitchenAssets = async (req,res)=>{
  let { page=1, limit=25, search="" } = req.query;

  const query = search
    ? { item_name:{ $regex:search, $options:"i" } }
    : {};

  const total = await KitchenAsset.countDocuments(query);
  const data = await KitchenAsset.find(query)
    .skip((page-1)*limit)
    .limit(parseInt(limit))
    .sort({ item_name:1 });

  res.json({
    data,
    totalPages: Math.ceil(total/limit)
  });
};

// ➤ GET ALL ASSETS (NO PAGINATION) – For Issue Modal
exports.getAllKitchenAssetsForIssue = async (req, res) => {
  try {
    const data = await KitchenAsset.find().sort({ item_name: 1 });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: "Failed to load kitchen assets" });
  }
};


