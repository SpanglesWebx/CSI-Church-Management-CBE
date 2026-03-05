const ShopRental = require("../Schema/ShopRental");

async function generateLesseId() {
  const count = await ShopRental.countDocuments();
  return `CSISPLS${count + 1}`;
}

module.exports = generateLesseId;
