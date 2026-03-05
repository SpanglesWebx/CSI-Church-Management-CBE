exports.getIndianTime = async (req, res) => {
  try {
    const indiaTimeString = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });

    const istDate = new Date(indiaTimeString);

    const iso = istDate.toISOString();
    const [yyyy, mm, dd] = iso.split("T")[0].split("-");
    const ddmmyyyy = `${dd}-${mm}-${yyyy}`;
    const hh_mm_ss = istDate.toTimeString().split(" ")[0];

    return res.json({
      ist_iso: iso,
      ist_date: ddmmyyyy,  // ✔ dd-mm-yyyy
      ist_time: hh_mm_ss,
      source: "timezone"
    });

  } catch (err) {
    console.error("IST generation error:", err);
    return res.status(500).json({ message: "Failed to generate IST" });
  }
};
