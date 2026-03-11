const mongoose = require("mongoose");
const WomenReceipt = require("../Schema/WomenReceiptSchema");
const Counter = require("../Schema/CounterSchema");
const WomenBank = require("../Schema/WomenBankSchema");
const WomenCashAccount = require("../Schema/WomenCashAccountSchema");
const BankRecon = require("../Schema/BankReconSchema");
const WomenReceiptTransCounter = require("../Schema/WomenReceiptTransCounter");

exports.addWomenReceipt = async (req,res)=>{
try{

const{
receiptDate,
paymentMethod,
chequeNumber,
chequeDate,
payerBankName,
bankId,
bankName,
bankAccountNumber,
upiId,
totalAmount,
receiptLines
}=req.body;

/* BASIC VALIDATION */

if(!receiptDate || !paymentMethod){
return res.status(400).json({message:"Receipt date and payment method required"});
}

if(!Array.isArray(receiptLines) || receiptLines.length===0){
return res.status(400).json({message:"At least one receipt line required"});
}

if(!totalAmount || Number(totalAmount)<=0){
return res.status(400).json({message:"Invalid total amount"});
}

/* CASH UPDATE */

if(paymentMethod==="Cash"){

const cash=await WomenCashAccount.findOne({
account_type:"Cash on Hand A/c"
});

if(!cash){
return res.status(400).json({message:"Cash account not found"});
}

cash.current_balance += Number(totalAmount);
await cash.save();
}

/* GENERATE RECEIPT ID */

const counter=await Counter.findOneAndUpdate(
{ name:"womenreceipt" },
{ $inc:{ seq:1 } },
{ new:true, upsert:true }
);

const autoReceiptId="WREC"+String(counter.seq).padStart(4,"0");

/* DATEWISE TRANS */

const dateObj=new Date(receiptDate);
const dateKey=dateObj.toISOString().split("T")[0];

const transCounter=await WomenReceiptTransCounter.findOneAndUpdate(
{ dateKey },
{ $inc:{ seq:1 } },
{ new:true, upsert:true }
);

const transNo=String(transCounter.seq).padStart(4,"0");

/* CREATE RECEIPT */

const receipt=await WomenReceipt.create({

autoReceiptId,
transNo,
receiptDate:new Date(receiptDate),
paymentMethod,

chequeNumber: paymentMethod==="Cheque"?chequeNumber:"",
chequeDate: paymentMethod==="Cheque" && chequeDate ? new Date(chequeDate):null,
payerBankName: paymentMethod==="Cheque"?payerBankName||"": "",

bankId: paymentMethod!=="Cash"?bankId:null,
bankName: paymentMethod!=="Cash"?bankName||"": "",
bankAccountNumber: paymentMethod!=="Cash"?bankAccountNumber||"": "",
upiId: paymentMethod==="UPI Payment"?upiId||"": "",

totalAmount:Number(totalAmount),

receiptLines: receiptLines.map(r=>({
receiptNumber:r.receiptNumber||"",
ledgerName:r.ledgerName,
ledgerCode:r.ledgerCode,
ledgerCategoryName:r.ledgerCategoryName,
accountType:r.accountType,
incomeType:r.incomeType||null,
amount:Number(r.amount),
description:r.description||"",
isMember:r.isMember??true,
memberId:r.memberId||"",
memberName:r.memberName||"",
phone:r.phone||"",
nonMemberName:r.nonMemberName||"",
nonMemberPhone:r.nonMemberPhone||"",
}))

});

/* BANK RECON */

if(paymentMethod==="Cheque" || paymentMethod==="UPI Payment"){

const isUPI = paymentMethod==="UPI Payment";

await BankRecon.create({

receiptId:receipt._id,
autoReceiptId:receipt.autoReceiptId,
transNo:receipt.transNo,
receiptDate:new Date(receiptDate),

paymentMethod,
chequeNumber,
chequeDate: chequeDate ? new Date(chequeDate):null,
upiId,

bankId,
bankName,

partyName:"Receipt",
phone:"",

amount:Number(totalAmount),
drCr:"Debit",

realised:isUPI,
realisedDate:isUPI ? new Date(receiptDate):null

});

/* UPI CREDIT */

if(isUPI){

const bank=await WomenBank.findById(bankId);

if(bank){
bank.current_balance += Number(totalAmount);
await bank.save();
}

}

}

res.status(201).json({
message:"Women receipt saved successfully",
data:receipt
});

}
catch(error){
console.error(error);
res.status(500).json({
message:"Failed to save women receipt"
});
}
};

exports.getWomenReceiptList = async (req, res) => {
  try {

    const {
      page = 1,
      limit = 25,
      search = "",
      startDate,
      endDate,
    } = req.query;

    const skip = (page - 1) * limit;

    const query = {};

    if (search) {
      query.$or = [
        { autoReceiptId: { $regex: search, $options: "i" } },
        { memberName: { $regex: search, $options: "i" } },
        { nonMemberName: { $regex: search, $options: "i" } },
        { "receiptLines.receiptNumber": { $regex: search, $options: "i" } },
        { "receiptLines.ledgerName": { $regex: search, $options: "i" } },
        { "receiptLines.ledgerCode": { $regex: search, $options: "i" } },
        { "receiptLines.ledgerCategoryName": { $regex: search, $options: "i" } }
      ];
    }

    if (startDate || endDate) {

      query.receiptDate = {};

      if (startDate) query.receiptDate.$gte = new Date(startDate);

      if (endDate) query.receiptDate.$lte = new Date(endDate);

    }

    const [receipts, total] = await Promise.all([

      WomenReceipt.find(query, {
        autoReceiptId: 1,
        transNo: 1,
        receiptLines: 1,
        totalAmount: 1,
        receiptDate: 1,
        memberName: 1,
        nonMemberName: 1,
      })
        .sort({ receiptDate: 1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),

      WomenReceipt.countDocuments(query)

    ]);

    let reconMap = {};

    if (receipts.length) {

      const receiptIds = receipts.map(r => r._id);

      const reconEntries = await BankRecon.find({
        receiptId: { $in: receiptIds }
      }).lean();

      reconEntries.forEach(r => {
        reconMap[r.receiptId.toString()] = r.realised;
      });

    }

    receipts.forEach(r => {
      r.realised = reconMap[r._id.toString()] || false;
    });

    res.status(200).json({
      data: receipts,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
    });

  } catch (error) {

    console.error("Get women receipt list error:", error);

    res.status(500).json({
      message: "Failed to fetch women receipts",
    });

  }
};


exports.getWomenReceiptById = async (req, res) => {

  try {

    const receipt = await WomenReceipt.findById(req.params.id);

    if (!receipt) {

      return res.status(404).json({
        message: "Receipt not found"
      });

    }

    res.status(200).json({
      data: receipt
    });

  }
  catch (error) {

    console.error("Get women receipt by id error:", error);

    res.status(500).json({
      message: "Failed to fetch receipt"
    });

  }

};


exports.updateWomenReceipt = async (req, res) => {

  const session = await mongoose.startSession();

  try {

    session.startTransaction();

    const { id } = req.params;

    const existingReceipt = await WomenReceipt.findById(id).session(session);

    if (!existingReceipt) {

      await session.abortTransaction();
      session.endSession();

      return res.status(404).json({
        message: "Receipt not found"
      });

    }

    const {
      receiptDate,
      paymentMethod,
      chequeNumber,
      chequeDate,
      payerBankName,
      bankId,
      bankName,
      bankAccountNumber,
      upiId,
      totalAmount,
      receiptLines,
    } = req.body;



    /* ==================================================
       REVERSE OLD CASH / BANK EFFECT
    ================================================== */

    if (existingReceipt.paymentMethod === "Cash") {

      const cashAccount = await WomenCashAccount.findOne({
        account_type: "Cash on Hand A/c",
      }).session(session);

      if (cashAccount) {

        cashAccount.current_balance -= Number(existingReceipt.totalAmount);

        await cashAccount.save({ session });

      }

    }


    if (
      existingReceipt.paymentMethod === "UPI Payment" &&
      existingReceipt.bankId
    ) {

      const bank = await WomenBank.findById(existingReceipt.bankId).session(session);

      if (bank) {

        bank.current_balance -= Number(existingReceipt.totalAmount);

        await bank.save({ session });

      }

    }


    await BankRecon.deleteMany({
      receiptId: existingReceipt._id,
    }).session(session);



    /* ==================================================
       UPDATE RECEIPT
    ================================================== */

    existingReceipt.receiptDate = new Date(receiptDate);

    existingReceipt.paymentMethod = paymentMethod;

    existingReceipt.chequeNumber =
      paymentMethod === "Cheque" ? chequeNumber : "";

    existingReceipt.chequeDate =
      paymentMethod === "Cheque" && chequeDate
        ? new Date(chequeDate)
        : null;

    existingReceipt.payerBankName =
      paymentMethod === "Cheque" ? payerBankName || "" : "";

    existingReceipt.bankId =
      paymentMethod !== "Cash" ? bankId || null : null;

    existingReceipt.bankName =
      paymentMethod !== "Cash" ? bankName || "" : "";

    existingReceipt.bankAccountNumber =
      paymentMethod !== "Cash" ? bankAccountNumber || "" : "";

    existingReceipt.upiId =
      paymentMethod === "UPI Payment" ? upiId || "" : "";

    existingReceipt.totalAmount = Number(totalAmount);

    existingReceipt.receiptLines = receiptLines.map((row) => ({
      receiptNumber: row.receiptNumber || "",
      ledgerName: row.ledgerName,
      ledgerCode: row.ledgerCode,
      ledgerCategoryName: row.ledgerCategoryName,
      accountType: row.accountType,
      incomeType: row.incomeType || null,
      amount: Number(row.amount),
      description: row.description || "",
      isMember: row.isMember ?? true,
      memberId: row.memberId || "",
      memberName: row.memberName || "",
      phone: row.phone || "",
      nonMemberName: row.nonMemberName || "",
      nonMemberPhone: row.nonMemberPhone || "",
    }));

    await existingReceipt.save({ session });



    /* ==================================================
       APPLY NEW CASH / BANK EFFECT
    ================================================== */

    if (paymentMethod === "Cash") {

      const cashAccount = await WomenCashAccount.findOne({
        account_type: "Cash on Hand A/c",
      }).session(session);

      if (cashAccount) {

        cashAccount.current_balance += Number(totalAmount);

        await cashAccount.save({ session });

      }

    }


    if (paymentMethod === "Cheque" || paymentMethod === "UPI Payment") {

      const isUPI = paymentMethod === "UPI Payment";

      await BankRecon.create(
        [{
          receiptId: existingReceipt._id,
          autoReceiptId: existingReceipt.autoReceiptId,
          transNo: existingReceipt.transNo,
          receiptDate: new Date(receiptDate),
          paymentMethod,
          chequeNumber,
          chequeDate: chequeDate ? new Date(chequeDate) : null,
          upiId,
          bankId,
          bankName,
          partyName: "Receipt",
          phone: "",
          amount: Number(totalAmount),
          drCr: "Debit",
          realised: isUPI,
          realisedDate: isUPI ? new Date(receiptDate) : null,
        }],
        { session }
      );

      if (isUPI && bankId) {

        const bank = await WomenBank.findById(bankId).session(session);

        if (bank) {

          bank.current_balance += Number(totalAmount);

          await bank.save({ session });

        }

      }

    }



    await session.commitTransaction();
    session.endSession();


    res.status(200).json({
      message: "Women receipt updated successfully",
      data: existingReceipt,
    });

  } catch (error) {

    await session.abortTransaction();
    session.endSession();

    console.error("Update women receipt error:", error);

    res.status(500).json({
      message: "Failed to update receipt"
    });

  }

};


exports.getWomenReceiptDownloadData = async (req, res) => {

  try {

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {

      return res.status(400).json({
        message: "Start date and end date are required",
      });

    }

    const receipts = await WomenReceipt.find({
      receiptDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    })
      .sort({ receiptDate: 1 })
      .select(
        "receiptDate transNo receiptLines totalAmount paymentMethod bankName"
      );

    const formatted = receipts.map((rec, index) => ({

      slNo: index + 1,

      date: rec.receiptDate,

      transNo: rec.transNo,

      receiptNumbers: (rec.receiptLines || [])
        .map((l) => l.receiptNumber)
        .filter(Boolean)
        .join(", "),

      amount: rec.totalAmount,

      paymentMethod: rec.paymentMethod,

      bankName: rec.bankName || "",

    }));


    res.status(200).json({
      data: formatted,
    });

  } catch (error) {

    console.error("Download women receipt data error:", error);

    res.status(500).json({
      message: "Failed to fetch receipt download data",
    });

  }

};