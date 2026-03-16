const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const auth = require("./models/auth");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");
const login = require("./router/loginRoutes");
// const member_register = require("./router/registerRoutes");
// const member = require("./router/memberRouter");
// const family_member = require("./router/familyRouter");
const offering = require("./router/offeringsRouter");
// const pastor = require("./router/pastorMemberRoutes");
// const bagOfferings = require("./router/bagofferingRouter");
const expense = require("./router/expenseRouter");
const reports = require("./router/reportRouter");
const app = express();
const server = http.createServer(app);
const uploadDir = path.join(__dirname, "uploads/expense");
const sundayClassRoutes = require("./router/sundayClassRoutes");
const SundayClassTagRoutes = require("./router/SundayClassTagRoutes");
const auctionRoutes = require("./router/auctionRoutes");
const memberSearchRoutes = require("./router/memberSearchRoutes");
const studentAuctionRoutes = require("./router/studentAuctionRoutes");
const attendanceRoutes = require("./router/attendanceRoutes");
const endeavourRoutes = require("./router/EndeavourClassRoutes");
const endeavourClassTagRoutes = require("./router/endeavourClassTagRoutes");
const endeavourAuctionRoutes = require("./router/endeavourAuctionRoutes");
const endeavourAttendanceRouter = require("./router/endeavourAttendanceRoutes")
const menFellowshipRoutes = require("./router/menFellowshipRoutes");
const womenFellowshipRoutes = require("./router/womenFellowshipRoutes");
const HarvestItemRoute = require("./router/HarvestItemRoute")
const harvestAuctionRoutes = require("./router/harvestAuctionRoutes");
const subscriptionRoutes = require("./router/subscriptionRoutes");
const categoryRouter = require("./router/categoryRouter");
const bagOfferingRoutes = require('./router/bagOfferingRoutes');
const youthFellowshipRoutes = require("./router/youthFellowshipRoutes");
const couplesFellowshipRoutes = require("./router/couplesFellowshipRoutes");
const menactivityRoutes = require("./router/menactivityRoutes");
const serviceActivityRoutes = require("./router/serviceActivityRoutes");
const womenactivityRoutes = require("./router/womenActivityRoutes");
const menAuctionRoutes = require("./router/menAuctionRoutes");
const womenAuctionRoutes = require("./router/WomenAuctionRoutes");
const youthAuctionRoutes = require("./router/YouthAuctionRoutes");
const choirRoutes = require("./router/choirRoutes");
const choirMasterRoutes = require("./router/choirMasterRoutes");
const regularExpenseRoutes = require("./router/regularExpenseRoutes");
const expenseRoutes = require("./router/expenseRoutes");
const marriageHallRoutes = require("./router/marriageHallRoutes");
const marriageHallCategoryRoutes = require("./router/marriageHallCategoryRoutes");
const bookingRouter = require("./router/bookingRouter");
const sundaySchoolExpenseRoutes = require("./router/sundaySchoolExpenseRoutes");
const endeavourExpenseRoutes = require("./router/endeavourExpenseRoutes");
const menFellowExpenseRoutes = require("./router/menFellowExpenseRoutes");
const womenFellowExpenseRoutes = require("./router/womenFellowExpenseRoutes");
const coupleFellowExpenseRoutes = require("./router/coupleExpenseRoutes");
const youthFellowExpenseRoutes = require("./router/youthExpenseRoutes");
const choirExpenseRoutes = require("./router/choirExpenseRoutes");
const cemeteryRoutes = require("./router/cemeteryRoutes");
const cemeteryBookingRoutes = require("./router/cemeteryBookingRoutes");
const endeavourEventRoutes = require("./router/endeavourEventRoutes");
const endeavourPrize = require("./router/endeavourPrize");
const sundaySchoolEventRoutes = require("./router/sundaySchoolEventRoutes");
const sundaySchoolPrizeRoutes = require("./router/sundayschoolPrize");
const womenEventRoutes = require("./router/womenEventRoutes"); 
const womenEventPrizeRoutes = require("./router/womenPrize");
const sundayschoolexams = require("./router/sundayExamRoutes");
const endeavourExamRoutes = require("./router/endeavourExamRoutes"); 
const dashboardRoutes = require("./router/DashboardRoutes");
const MinistryOfferingRoutes = require('./router/ministryOfferingRoutes');
const staffRouter = require("./router/staffRouter");
const expenseCategoryRouter = require("./router/expenseCategoryRouter");
const expenseCategorySearchRouter = require("./router/expenseCategorySearchRoutes");
const churchExpenseRouter = require("./router/churchExpenseRouter");
const missionarySundayDonationRouter = require("./router/missionarySundayDonationRouter");
const missionaryCoverOffertoryRouter = require("./router/missionaryCoverOffertoryRouter");
const tokenPriceRouter = require("./router/tokenPriceRouter");
const tokenIncomeRouter = require("./router/tokenIncomeRouter");
const asanamCollectionRouter = require("./router/asanamCollectionRouter");
const donationRoutes = require("./router/donationRoutes");
const poorHelpRouter = require("./router/poorHelpRouter");
const otherIncomeRouter = require("./router/otherIncomeRouter");
const otherIncomeDonationRouter = require("./router/otherIncomeDonationRouter");
const shopRoutes = require("./router/shopRouter");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
  }
});
app.set("io", io);

io.on("connection", (socket) => {

  console.log("🔌 User connected:", socket.id);

  socket.on("join_member", (memberId) => {
    socket.join(memberId);
    console.log(`Member joined: ${memberId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected");
  });

});


if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
const PORT = process.env.PORT || 5001;
// mongoose
//   .connect(process.env.MONGO_URL)
//   .then(() => console.log("DataBase Connected"))
//   .catch((err) => {
//     console.log(err);
//   });
//   console.log("******** INDEX.JS IS RUNNING AND CHANGED ********"); 

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ DataBase Connected");
    console.log("📦 Connected to MongoDB Database:", mongoose.connection.name);
  })
  .catch((err) => {
    console.log("❌ MongoDB connection error:", err);
  });


// ✅ Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

app.get("/", (req, res) => {
  res.send(" Server Running ");
});
app.use("/api/reports", reports);
app.use("/api/member-reports-pdf", require("./router/memberReportpdfRoutes"));
// app.use("/api/pastor", pastor);

app.use("/api", login);
app.use("/api/uploads", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/", auth.authenticateUser);
// app.use("/api/member", member);
// app.use("/api/family", family_member);
app.use("/api/offerings", offering);
// app.use("/api/expense", expense);
// app.use("/api/bagOfferings", bagOfferings);
app.use("/api/sunday-classes", sundayClassRoutes);
app.use("/api/sunday-class-tags", SundayClassTagRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/member-search", memberSearchRoutes);
app.use("/api/student-auctions", studentAuctionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/endeavour-classes", endeavourRoutes);
app.use("/api/endeavour-class-tags", endeavourClassTagRoutes);
app.use("/api/endeavour-auctions", endeavourAuctionRoutes);
app.use("/api/endeavour-attendance", endeavourAttendanceRouter);
app.use("/api/mens-fellowship", menFellowshipRoutes);
app.use("/api/womens-fellowship", womenFellowshipRoutes);
app.use("/api/harvest-items", HarvestItemRoute);
app.use("/api/harvest-auctions", harvestAuctionRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/categories", categoryRouter); 
app.use('/api/bagOfferings', bagOfferingRoutes);
app.use("/api/youth-fellowship", youthFellowshipRoutes);
app.use("/api/couples-fellowship", couplesFellowshipRoutes);
app.use("/api/men-activities", menactivityRoutes);
app.use("/api/serviceactivity", serviceActivityRoutes);
app.use("/api/women-activities", womenactivityRoutes);
app.use("/api/men-auctions", menAuctionRoutes);
app.use("/api/women-auctions", womenAuctionRoutes);
app.use("/api/youth-auctions", youthAuctionRoutes);
app.use("/api/choir-members", choirRoutes);
app.use("/api/choir-masters", choirMasterRoutes);
app.use("/api/regular-expenses", regularExpenseRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/marriage-halls", marriageHallRoutes);
app.use("/api/marriage-hall-categories", marriageHallCategoryRoutes);
app.use("/api/bookings", bookingRouter);
app.use("/api/sundayschool-expenses", sundaySchoolExpenseRoutes);
app.use("/api/endeavour-expenses", endeavourExpenseRoutes);
app.use("/api/menfellow-expenses", menFellowExpenseRoutes);
app.use("/api/womenfellow-expenses", womenFellowExpenseRoutes);
app.use("/api/couplefellow-expenses", coupleFellowExpenseRoutes);
app.use("/api/youthfellow-expenses", youthFellowExpenseRoutes);
app.use("/api/choir-expenses", choirExpenseRoutes);
app.use("/api/cemeteries", cemeteryRoutes);
app.use("/api/cemetery-bookings", cemeteryBookingRoutes);
app.use("/api/endeavour-events", endeavourEventRoutes);
app.use("/api/endeavour/prizes", endeavourPrize);
app.use("/api/sundayschool-events", sundaySchoolEventRoutes);
app.use("/api/sundayschool/prizes", sundaySchoolPrizeRoutes);
app.use("/api/women-events", womenEventRoutes);
app.use("/api/women/prizes", womenEventPrizeRoutes);
app.use("/api/sundayschool-exams", sundayschoolexams);
app.use("/api/endeavour-exams", endeavourExamRoutes); 
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/ministryOfferings', MinistryOfferingRoutes);
app.use("/api/staffs", staffRouter);
app.use("/api/expense-category", expenseCategoryRouter);
app.use("/api/expense-search",require("./router/expenseCategorySearchRoutes"));
app.use("/api/receipt-category", require("./router/receiptCategoryRouter"));
app.use("/api/missionary-sunday-donation", missionarySundayDonationRouter);
app.use("/api/missionary-sunday-cover-offertory", missionaryCoverOffertoryRouter);
app.use("/api/missionary-sunday-biriyani-token-price", tokenPriceRouter);
app.use("/api/missionary-sunday-biriyani-token-income", tokenIncomeRouter);
// app.use("/api/missionary-sunday-canteen", missionaryCanteenRouter);
app.use("/api/asanam-price", require("./router/asanamPriceRouter"));
app.use("/api/asanam-collection", asanamCollectionRouter);
app.use("/api/asanam-zone", require("./router/asanamZoneRouter"));
app.use("/api/donations", donationRoutes);
app.use("/api/poor-help", poorHelpRouter);
app.use("/api/other-income", otherIncomeRouter);
app.use("/api/other-income-donations", otherIncomeDonationRouter);
app.use("/api/shops", shopRoutes);


app.use("/api/rentals", require("./router/shopRentalRouter"));
app.use("/api/carols", require("./router/carolRoutes"));
app.use('/api/house-visit',  require('./router/houseVisitRouter'));
app.use("/api/harvest-collection", require("./router/harvestCollectionRouter"));
app.use("/api/harvest-biriyani-token-price", require("./router/harvestTokenPriceRouter"));
app.use("/api/harvest-biriyani-token-income", require("./router/harvestTokenIncomeRouter"));
app.use("/api/harvest-canteen", require("./router/harvestCanteenRoutes"));
app.use("/api/banns-price", require("./router/bannsPriceRouter"));
app.use("/api/marriage-price", require("./router/marriagePriceRouter")); 
app.use("/api/marriages", require("./router/marriageRouter"));
app.use("/api/matrimonial-fees", require("./router/matrimonialFeesRouter"));
app.use("/api/matrimonial", require("./router/matrimonialRouter"));
app.use("/api/zones", require("./router/zoneRouter"));
app.use("/member-photo-uploads", express.static("uploads"));
app.use("/api/new-members", require("./router/memberRouter"));
app.use("/api/family", require("./router/familyRouter"));
app.use("/api/canteen-collection", require("./router/canteenCollectionRouter"));
app.use("/api/receipt-search", require("./router/receiptSearchRouter"));
app.use("/api/journal-search", require("./router/journalSearchRoutes"));
app.use("/api/time", require("./router/timeRouter"));
app.use("/api/creditors", require("./router/creditorRouter"));
app.use("/api/creditor-search", require("./router/creditorSearchRoutes"));
app.use("/api/asanam-tiffin-carrier-price", require("./router/asanamCarrierPriceRouter"));
app.use("/api/asanam-tiffin-carrier-income", require("./router/asanamCarrierIncomeRouter"));
app.use("/api/harvest-cover-offertory", require("./router/harvestCoverOffertoryRouter"));
app.use("/api/asanam-uniform", require("./router/asanamUniformRoutes"));
app.use("/api/voters", require("./router/voterRouter"));
app.use("/uploads/pastors", express.static("uploads/pastors"));
app.use("/api/pastors", require("./router/pastorRouter"));
app.use("/api/hall-assets", require("./router/marriagehallassetrouter"));
app.use("/api/kitchen-assets", require("./router/kitchenAssetRouter"));
app.use("/api/kitchen-asset-issues", require("./router/kitchenAssetIssueRouter"));
app.use("/api/baptism-member-search", require("./router/baptismSearchRoutes"));
app.use("/api/baptisms", require("./router/baptismRoutes"));
app.use("/api/account-types", require("./router/accountTypeRoutes"));
app.use("/api/system-ledgers", require("./router/systemLedgerRouter"));
app.use("/api/groom-members", require("./router/groomMemberRouter"));
app.use("/api/bride-members", require("./router/brideMemberRouter"));
app.use("/api/marriage-certificate", require("./router/mrgCertRouter"));
app.use("/api/women-subscribers", require("./router/womenSubscribersRoutes"))
app.use("/api/men-subscribers", require("./router/menSubscribersRoutes"));
app.use("/api/sundayschool/dashboard", require("./router/sundaySclDashRoutes"));
app.use("/api/death-member-search", require("./router/deathCertSearchRoutes"));

app.use("/api/trial-balance", require("./router/trialBalanceRoutes"));
app.use("/api/depreciation", require("./router/depreciationRoutes"));
app.use("/api/balance-sheet", require("./router/balanceSheetRoutes"));
app.use("/api/receipt-payment", require("./router/receiptPaymentRoutes"));
app.use("/api/print-label", require("./router/printLabelRoutes"));


app.use("/api/ledger-category", require("./router/ledgerCategoryRouter"));
app.use("/api/ledger-search", require("./router/ledgerSearchRouter"));
app.use("/api/church-expense", require("./router/churchExpenseRouter"));
app.use("/api/journals", require("./router/journalRouter"));
app.use("/api/creditor-report", require("./router/creditorReportRouter"));
app.use("/api/receipts", require("./router/receiptRouter"));
app.use("/api/opening-balance", require("./router/openingBalanceRouter"));
app.use("/api/banks", require("./router/bankRoutes"));
app.use("/api/tally", require("./router/tallyRoutes"));
// app.use("/api/account-report", require("./router/accountingReportRoutes")); 
app.use("/api/reports/receipts-payments", require("./router/receiptsPaymentsReportRoutes"));
app.use("/api/reports/income-expenditure",require("./router/incomeExpenditureRoutes"));
app.use("/api/bank-recon", require("./router/bankReconRouter"));
app.use("/api/deaths", require("./router/deathCertificateRoutes"));

app.use("/api/cem-opening-balance", require("./router/cemOpeningBalanceRouter"));
app.use("/api/cem-banks", require("./router/cemBankRoutes"));
app.use("/api/cem-receipts", require("./router/cemReceiptRouter"));
app.use("/api/cem-payments", require("./router/cemPaymentRouter"));
app.use("/api/cem-journals", require("./router/cemJournalRouter"));

app.use("/api/bible-sentences", require("./router/bibleSentenceRoutes"));
app.use("/api/asanam-search", require("./router/asanamSearchRouter"));
app.use("/api/asanam-report", require("./router/asanamReportRouter"));
app.use("/api/asanam-donations", require("./router/asanamDonationRouter"));
app.use("/api/couple-activities",require("./router/coupleActivityRoutes"));
app.use("/api/Dashboard", require("./router/RoleBasedDashRoutes"));
app.use("/api/couple-events", require("./router/coupleEventRoutes"));
app.use("/api/notifications", require("./router/NotificationRoutes"));

//Women's A/c
app.use("/api/women-opening-balance", require("./router/womenOpeningBalanceRouter"));
app.use("/api/womenbanks", require("./router/womenBankRoutes"));
app.use("/api/women-receipts", require("./router/womenReceiptRouter"));
app.use("/api/women-payment", require("./router/womenPaymentRouter"));
app.use("/api/women-journals", require("./router/womenJournalRouter"));

// Connect to MongoDB
server.listen(PORT, () => {
  console.log("Server is running on port", PORT);
}); 