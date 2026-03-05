// util/generateReceiptId.js
module.exports.generateNextReceiptId = (lastId) => {
  const prefix = "REC";

  if (!lastId) return prefix + "0001";

  const numericPart = parseInt(lastId.replace(prefix, ""));
  const nextNum = numericPart + 1;

  const padded = String(nextNum).padStart(4, "0");
  return prefix + padded;
};
