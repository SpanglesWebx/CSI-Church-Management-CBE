// utils/generateCreditorId.js

/**
 * Generate the next creditor ID automatically
 * Pattern: CRD00001, CRD00002, CRD00003...
 *
 * @param {Model} Model - Mongoose model
 * @returns {String} - Generated Creditor ID
 */
exports.generateCreditorId = async (Model) => {
  const prefix = "CRD";

  // Find the last inserted creditor_id starting with CRD
  const last = await Model.findOne({ creditor_id: new RegExp(`^${prefix}`) })
    .sort({ creditor_id: -1 });

  // If no record exists → return first ID
  if (!last) return `${prefix}00001`;

  // Extract numeric part
  const numberPart = last.creditor_id.replace(prefix, "");
  const nextNumber = parseInt(numberPart, 10) + 1;

  // Format new ID with 5 digits
  return `${prefix}${String(nextNumber).padStart(5, "0")}`;
};
