// util/generateAccountCode.js
exports.generateAccountCode = async (Model) => {
  const last = await Model.findOne().sort({ created_at: -1 });

  if (!last || !last.account_code) {
    return "CSIAC001";
  }

  const num = parseInt(last.account_code.replace("CSIAC", "")) + 1;
  return `CSIAC${num.toString().padStart(3, "0")}`;
};
