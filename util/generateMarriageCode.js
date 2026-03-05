const MrgIdCounter = require("../Schema/MrgIdCounterSchema");
const { getIndianTime } = require("./getIndianTime");

exports.generateMarriageCode = async () => {
  const istDate = getIndianTime();

  const year = istDate.getFullYear().toString().slice(-2);

  const counter = await MrgIdCounter.findOneAndUpdate(
    { key: "MARRIAGE_REG" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const sequence = counter.seq;

  const paddedSeq =
    sequence < 100000
      ? sequence.toString().padStart(5, "0")
      : sequence.toString();

  const marriageCode = `MR${year}${paddedSeq}`;

  return {
    marriageCode,
    sequence,
    istDate
  };
};
