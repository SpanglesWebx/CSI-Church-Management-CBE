// utils/generateEmployeeId.js
const Staff = require("../Schema/staffSchema");

async function generateEmployeeId() {
  const latestStaff = await Staff.findOne({}, { employee_id: 1 })
    .sort({ createdAt: -1 })
    .lean();

  let nextNumber = 1;
  if (latestStaff && latestStaff.employee_id) {
    const match = latestStaff.employee_id.match(/\d+$/);
    if (match) {
      nextNumber = parseInt(match[0], 10) + 1;
    }
  }

  // Pad number with zeros — EMP0001, EMP0002
  const newEmployeeId = `ST${String(nextNumber).padStart(4, "0")}`;
  return newEmployeeId;
}

module.exports = generateEmployeeId;
