exports.getIndianTime = () => {
  const indiaTimeString = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });

  const istDate = new Date(indiaTimeString);

  return istDate;
};
