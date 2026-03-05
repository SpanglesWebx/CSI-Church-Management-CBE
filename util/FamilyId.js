const Family = require("../Schema/familySchema");

const generateFamilyCode = async () => {
  const lastFamily = await Family.findOne().sort({ family_id: -1 });

  if (!lastFamily) return "FAM00001";

  const lastNumber = parseInt(lastFamily.family_id.replace("FAM", ""));
  const newNumber = lastNumber + 1;

  return "FAM" + newNumber.toString().padStart(5, "0");
};

module.exports = generateFamilyCode;
