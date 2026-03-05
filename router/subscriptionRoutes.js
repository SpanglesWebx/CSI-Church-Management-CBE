const express = require("express");
const router = express.Router();
const { addSubscription, getSubscribers, getMemberSubscriptions, checkSubscription, updateSubscriptionSplit, saveSubscriptionAmount, allocateToMonths, getUnpaidMembers, holdMembers, getHoldedMembers, getSubscriptionReport, getSingleSubscriptionReport,getPrintByDate  } = require("../controllers/SubscriptionController");

// ➤ Add a new subscription
router.post("/", addSubscription);

// You can add more routes later if needed (e.g., get all subscriptions, update, etc.)
router.get("/", getSubscribers);

router.get("/member", getMemberSubscriptions);

router.post("/check", checkSubscription);

router.put("/split", updateSubscriptionSplit);

router.post("/amount", saveSubscriptionAmount);

router.post("/allocate", allocateToMonths);

router.get("/unpaid-members",getUnpaidMembers);

router.post("/hold-members", holdMembers);

router.get("/holded-members", getHoldedMembers);

router.get("/report", getSubscriptionReport);

router.get("/report/print-by-date", getPrintByDate);

router.get("/report/view/:member_id", getSingleSubscriptionReport);



module.exports = router;
   