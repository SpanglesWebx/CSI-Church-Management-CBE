const axios = require("axios");

// Schemas
const TallyMigrationLog = require("../Schema/TallyMigrationLog");
const Bank = require("../Schema/bankSchema");
const CashAccount = require("../Schema/CashAccountSchema");
const Receipt = require("../Schema/ReceiptSchema");
const ChurchExpense = require("../Schema/ChurchExpenseSchema");

const TALLY_URL = "http://localhost:9000";
const COMPANY_NAME = "Company 13-02-2026 3.18 PM";

/* ====================================================== */

const escapeXml = (v = "") =>
  String(v || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/* ====================================================== */

const sendToTally = async (xml) => {
  const res = await axios.post(TALLY_URL, xml, {
    headers: { "Content-Type": "text/xml" },
  });

  const body = String(res.data || "");

  const errors = Number(
    (body.match(/<ERRORS>(\d+)<\/ERRORS>/i) || [0, 0])[1]
  );

  if (errors > 0) {
    const msg =
      body.match(/<LINEERROR>(.*?)<\/LINEERROR>/i)?.[1] ||
      "Tally Import Error";
    throw new Error(msg);
  }
};

/* ======================================================
   LEDGER CREATION WITH OPENING BALANCE
   ====================================================== */

const createLedgerWithOpening = (name, parent, openingBalance = 0) => `
<ENVELOPE>
 <HEADER>
  <TALLYREQUEST>Import Data</TALLYREQUEST>
 </HEADER>
 <BODY>
  <IMPORTDATA>
   <REQUESTDESC>
    <REPORTNAME>All Masters</REPORTNAME>
    <STATICVARIABLES>
      <SVCURRENTCOMPANY>${escapeXml(COMPANY_NAME)}</SVCURRENTCOMPANY>
    </STATICVARIABLES>
   </REQUESTDESC>
   <REQUESTDATA>
    <TALLYMESSAGE>
     <LEDGER ACTION="Create">
      <NAME>${escapeXml(name)}</NAME>
      <PARENT>${escapeXml(parent)}</PARENT>
      <OPENINGBALANCE>${openingBalance}</OPENINGBALANCE>
     </LEDGER>
    </TALLYMESSAGE>
   </REQUESTDATA>
  </IMPORTDATA>
 </BODY>
</ENVELOPE>`;

const createGroup = (name, parent) => `
<TALLYMESSAGE>
 <GROUP ACTION="Create">
  <NAME>${escapeXml(name)}</NAME>
  <PARENT>${escapeXml(parent)}</PARENT>
 </GROUP>
</TALLYMESSAGE>`;

const createLedger = (name, parent) => `
<TALLYMESSAGE>
 <LEDGER ACTION="Create">
  <NAME>${escapeXml(name)}</NAME>
  <PARENT>${escapeXml(parent)}</PARENT>
 </LEDGER>
</TALLYMESSAGE>`;


//6.15 pm
// const buildReceiptVoucher = (date, amount, assetLedger, incomeLedger, narration) => `
// <TALLYMESSAGE xmlns:UDF="TallyUDF">
//  <VOUCHER VCHTYPE="Receipt" ACTION="Create">
//   <DATE>${date}</DATE>
//   <VOUCHERTYPENAME>Receipt</VOUCHERTYPENAME>
//   <NARRATION>${escapeXml(narration)}</NARRATION>

//   <ALLLEDGERENTRIES.LIST>
//    <LEDGERNAME>${escapeXml(assetLedger)}</LEDGERNAME>
//    <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
//    <AMOUNT>-${amount}</AMOUNT>
//   </ALLLEDGERENTRIES.LIST>

//   <ALLLEDGERENTRIES.LIST>
//    <LEDGERNAME>${escapeXml(incomeLedger)}</LEDGERNAME>
//    <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
//    <AMOUNT>${amount}</AMOUNT>
//   </ALLLEDGERENTRIES.LIST>

//  </VOUCHER>
// </TALLYMESSAGE>`;


//6.28 PM
// const buildReceiptVoucher = (date, amount, assetLedger, incomeLedger, narration) => `
// <TALLYMESSAGE xmlns:UDF="TallyUDF">
//  <VOUCHER VCHTYPE="Receipt" ACTION="Create">
//   <DATE>${date}</DATE>
//   <VOUCHERTYPENAME>Receipt</VOUCHERTYPENAME>
//   <NARRATION>${escapeXml(narration)}</NARRATION>

//   <!-- Asset Ledger (DEBIT) -->
//   <ALLLEDGERENTRIES.LIST>
//    <LEDGERNAME>${escapeXml(assetLedger)}</LEDGERNAME>
//    <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
//    <AMOUNT>${amount}</AMOUNT>
//   </ALLLEDGERENTRIES.LIST>

//   <!-- Income Ledger (CREDIT) -->
//   <ALLLEDGERENTRIES.LIST>
//    <LEDGERNAME>${escapeXml(incomeLedger)}</LEDGERNAME>
//    <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
//    <AMOUNT>-${amount}</AMOUNT>
//   </ALLLEDGERENTRIES.LIST>

//  </VOUCHER>
// </TALLYMESSAGE>`;

const buildReceiptVoucher = (date, amount, assetLedger, incomeLedger, narration) => `
<TALLYMESSAGE xmlns:UDF="TallyUDF">
 <VOUCHER VCHTYPE="Receipt" ACTION="Create">
  <DATE>${date}</DATE>
  <VOUCHERTYPENAME>Receipt</VOUCHERTYPENAME>
  <NARRATION>${escapeXml(narration)}</NARRATION>

  <!-- BANK/CASH = DEBIT -->
  <ALLLEDGERENTRIES.LIST>
   <LEDGERNAME>${escapeXml(assetLedger)}</LEDGERNAME>
   <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
   <AMOUNT>${amount}</AMOUNT>
  </ALLLEDGERENTRIES.LIST>

  <!-- INCOME = CREDIT -->
  <ALLLEDGERENTRIES.LIST>
   <LEDGERNAME>${escapeXml(incomeLedger)}</LEDGERNAME>
   <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
   <AMOUNT>-${amount}</AMOUNT>
  </ALLLEDGERENTRIES.LIST>

 </VOUCHER>
</TALLYMESSAGE>`;

//6.15 pm
// const buildPaymentVoucher = (date, amount, assetLedger, expenseLedger, narration) => `
// <TALLYMESSAGE xmlns:UDF="TallyUDF">
//  <VOUCHER VCHTYPE="Payment" ACTION="Create">
//   <DATE>${date}</DATE>
//   <VOUCHERTYPENAME>Payment</VOUCHERTYPENAME>
//   <NARRATION>${escapeXml(narration)}</NARRATION>

//   <!-- Expense Ledger (DEBIT) -->
//   <ALLLEDGERENTRIES.LIST>
//    <LEDGERNAME>${escapeXml(expenseLedger)}</LEDGERNAME>
//    <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
//    <AMOUNT>-${amount}</AMOUNT>
//   </ALLLEDGERENTRIES.LIST>

//   <!-- Cash/Bank (CREDIT) -->
//   <ALLLEDGERENTRIES.LIST>
//    <LEDGERNAME>${escapeXml(assetLedger)}</LEDGERNAME>
//    <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
//    <AMOUNT>${amount}</AMOUNT>
//   </ALLLEDGERENTRIES.LIST>

//  </VOUCHER>
// </TALLYMESSAGE>`;


//6.28 PM
// const buildPaymentVoucher = (date, amount, assetLedger, expenseLedger, narration) => `
// <TALLYMESSAGE xmlns:UDF="TallyUDF">
//  <VOUCHER VCHTYPE="Payment" ACTION="Create">
//   <DATE>${date}</DATE>
//   <VOUCHERTYPENAME>Payment</VOUCHERTYPENAME>
//   <NARRATION>${escapeXml(narration)}</NARRATION>

//   <!-- Expense Ledger (DEBIT) -->
//   <ALLLEDGERENTRIES.LIST>
//    <LEDGERNAME>${escapeXml(expenseLedger)}</LEDGERNAME>
//    <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
//    <AMOUNT>-${amount}</AMOUNT>
//   </ALLLEDGERENTRIES.LIST>

//   <!-- Asset Ledger (CREDIT) -->
//   <ALLLEDGERENTRIES.LIST>
//    <LEDGERNAME>${escapeXml(assetLedger)}</LEDGERNAME>
//    <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
//    <AMOUNT>${amount}</AMOUNT>
//   </ALLLEDGERENTRIES.LIST>

//  </VOUCHER>
// </TALLYMESSAGE>`;

const buildPaymentVoucher = (date, amount, assetLedger, expenseLedger, narration) => `
<TALLYMESSAGE xmlns:UDF="TallyUDF">
 <VOUCHER VCHTYPE="Payment" ACTION="Create">
  <DATE>${date}</DATE>
  <VOUCHERTYPENAME>Payment</VOUCHERTYPENAME>
  <NARRATION>${escapeXml(narration)}</NARRATION>

  <!-- EXPENSE = DEBIT -->
  <ALLLEDGERENTRIES.LIST>
   <LEDGERNAME>${escapeXml(expenseLedger)}</LEDGERNAME>
   <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
   <AMOUNT>${amount}</AMOUNT>
  </ALLLEDGERENTRIES.LIST>

  <!-- BANK/CASH = CREDIT -->
  <ALLLEDGERENTRIES.LIST>
   <LEDGERNAME>${escapeXml(assetLedger)}</LEDGERNAME>
   <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
   <AMOUNT>-${amount}</AMOUNT>
  </ALLLEDGERENTRIES.LIST>

 </VOUCHER>
</TALLYMESSAGE>`;

/* ======================================================
   PAYMENT TRANSFER BUILDER (CASH → BANK)
====================================================== */

const buildTransferPaymentVoucher = (date, amount, cashLedger, bankLedger, narration) => `
<TALLYMESSAGE xmlns:UDF="TallyUDF">
 <VOUCHER VCHTYPE="Payment" ACTION="Create">
  <DATE>${date}</DATE>
  <VOUCHERTYPENAME>Payment</VOUCHERTYPENAME>
  <NARRATION>${escapeXml(narration)}</NARRATION>

  <!-- BANK = DEBIT -->
  <ALLLEDGERENTRIES.LIST>
   <LEDGERNAME>${escapeXml(bankLedger)}</LEDGERNAME>
   <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
   <AMOUNT>${amount}</AMOUNT>
  </ALLLEDGERENTRIES.LIST>

  <!-- CASH = CREDIT -->
  <ALLLEDGERENTRIES.LIST>
   <LEDGERNAME>${escapeXml(cashLedger)}</LEDGERNAME>
   <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
   <AMOUNT>-${amount}</AMOUNT>
  </ALLLEDGERENTRIES.LIST>

 </VOUCHER>
</TALLYMESSAGE>`;

const wrapVoucherXML = (body) => `
<ENVELOPE>
 <HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>
 <BODY>
  <IMPORTDATA>
   <REQUESTDESC>
    <REPORTNAME>Vouchers</REPORTNAME>
    <STATICVARIABLES>
      <SVCURRENTCOMPANY>${escapeXml(COMPANY_NAME)}</SVCURRENTCOMPANY>
    </STATICVARIABLES>
   </REQUESTDESC>
   <REQUESTDATA>${body}</REQUESTDATA>
  </IMPORTDATA>
 </BODY>
</ENVELOPE>`;


/* ======================================================
   CORE MIGRATION
   ====================================================== */

exports.migrateReceiptsToTally = async (req, res) => {
  const triggered_by = req.body.triggered_by || {};

  let count = 0;
  let receiptCount = 0;
  let receiptTotal = 0;
  let expenseCount = 0;
  let expenseTotal = 0;

  try {
    /* ---------- BANKS ---------- */

    const banks = await Bank.find({
      opening_balance_migrated: { $ne: true },
    });

    for (const b of banks) {
      if (b.opening_balance > 0) {
        const xml = createLedgerWithOpening(
          b.bank_name,
          "Bank Accounts",
          b.opening_balance
        );

        await sendToTally(xml);

        b.opening_balance_migrated = true;
        await b.save();

        count++;
      }
    }

    /* ---------- CASH ---------- */

    const cashAccounts = await CashAccount.find({
      opening_balance_migrated: { $ne: true },
    });

    for (const c of cashAccounts) {
      if (c.opening_balance > 0) {
        const xml = createLedgerWithOpening(
          c.account_type,
          "Cash-in-Hand",
          c.opening_balance
        );

        await sendToTally(xml);

        c.opening_balance_migrated = true;
        await c.save();

        count++;
      }
    }

    /* ======================================================
   RECEIPT MIGRATION
====================================================== */


    let voucherXML = "";

    const receipts = await Receipt.find({ migrated: false });

    for (const r of receipts) {
      // const assetLedger =
      // r.paymentMethod === "Cash"
      //   ? "Cash on Hand A/c"
      //   : r.bankName;
      const assetLedger =
        r.paymentMethod === "Cash"
          ? r.cashAccountType || "Cash on Hand A/c"
          : r.bankName;


      const date = r.receiptDate
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "");

      for (const line of r.receiptLines) {
        const group = line.ledgerCategoryName;
        const ledger = line.ledgerName;

        voucherXML += createGroup(group, "Direct Incomes");
        voucherXML += createLedger(ledger, group);

        const narration = `${r.autoReceiptId} | ${r.memberName} | ${line.description || ""}`;

        voucherXML += buildReceiptVoucher(
          date,
          line.amount,
          assetLedger,
          ledger,
          narration
        );

        receiptTotal += line.amount;
        receiptCount++;
      }

      r.migrated = true;
      await r.save();
    }

    if (voucherXML) {
      await sendToTally(wrapVoucherXML(voucherXML));
    }
    /* ======================================================
       EXPENSE MIGRATION
    ====================================================== */


    let paymentXML = "";

    const expenses = await ChurchExpense.find({ migrated: false });

    for (const e of expenses) {
      // const assetLedger =
      //   e.paymentMethod === "Cash"
      //     ? "Cash on Hand A/c"
      //     : e.bankName;
      const assetLedger =
        e.paymentMethod === "Cash"
          ? e.cashAccountType || "Cash on Hand A/c"
          : e.bankName;


      const date = e.date.toISOString().slice(0, 10).replace(/-/g, "");

      for (const line of e.expenseLines) {
        const group = line.ledgerCategoryName;
        const ledger = line.ledgerName;

        paymentXML += createGroup(group, "Direct Expenses");
        paymentXML += createLedger(ledger, group);

        const narration = `${e.autoExpenseId} | ${e.inFavourOf || ""} | ${line.description || ""}`;

        // 🔵 CHECK IF BANK TRANSFER
        const isBankTransfer =
          line.ledgerCategoryName === "Bank A/C";

        // 🔴 CASH → BANK TRANSFER
        if (isBankTransfer) {

          paymentXML += buildTransferPaymentVoucher(
            date,
            line.amount,
            assetLedger, // cash
            ledger,      // bank
            narration
          );

        } else {

          // NORMAL EXPENSE
          paymentXML += buildPaymentVoucher(
            date,
            line.amount,
            assetLedger,
            ledger,
            narration
          );

        }


        expenseTotal += line.amount;
        expenseCount++;
      }

      e.migrated = true;
      await e.save();
    }

    if (paymentXML) {
      await sendToTally(wrapVoucherXML(paymentXML));
    }


    /* ---------- LOG ---------- */

    const log = await TallyMigrationLog.create({
      migration_type: "Opening Balance Migration",
      total_entries: count + receiptCount + expenseCount,
      total_receipts: receiptTotal,
      total_payments: expenseTotal,
      net_amount: receiptTotal - expenseTotal,
      status: "Success",
      message: "Opening balances created inside ledger successfully.",
      triggered_by,
    });


    res.json({ success: true, log });
  } catch (err) {
    await TallyMigrationLog.create({
      migration_type: "Opening Balance Migration",
      total_entries: count + receiptCount + expenseCount,
      total_receipts: receiptTotal,
      total_payments: expenseTotal,
      net_amount: receiptTotal - expenseTotal,
      status: "Failed",
      message: err.message,
      triggered_by,
    });


    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
   HISTORY
   ====================================================== */

exports.getTallyMigrationHistory = async (req, res) => {
  const logs = await TallyMigrationLog.find().sort({ createdAt: -1 });
  res.json({ data: logs });
};

exports.getTallyMigrationHistoryById = async (req, res) => {
  const log = await TallyMigrationLog.findById(req.params.id);
  res.json(log);
};
