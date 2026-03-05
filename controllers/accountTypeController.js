// controllers/accountTypeController.js
const AccountType = require("../Schema/accountTypeSchema");

// 📌 Add Account Type
exports.addAccountType = async (req, res) => {
  try {
    const exists = await AccountType.findOne({ name: req.body.name });
    if (exists) {
      return res.json({
        status: "Failed",
        message: "Account type already exists",
      });
    }

    const type = await AccountType.create({
      name: req.body.name,
      status: "Active",
    });

    return res.json({
      status: "Success",
      data: type,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "Failed",
      message: "Server error",
    });
  }
};

// 📌 List Account Types
exports.listAccountTypes = async (req, res) => {
  try {
    const types = await AccountType.find({ status: "Active" })
      .sort({ created_at: -1 });

    return res.json({
      status: "Success",
      data: types,
    });
  } catch (err) {
    return res.status(500).json({
      status: "Failed",
      message: "Server error",
    });
  }
};
