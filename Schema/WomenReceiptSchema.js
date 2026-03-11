const mongoose = require("mongoose");

const WomenReceiptSchema = new mongoose.Schema(
{
  autoReceiptId:{
    type:String,
    unique:true,
    index:true,
  },

  transNo:{
    type:String,
    index:true,
  },

  receiptLines:[
    {
      receiptNumber:{
        type:String,
        trim:true,
        default:"",
      },

      ledgerName:String,
      ledgerCode:String,
      ledgerCategoryName:String,
      accountType:String,
      incomeType:String,
      amount:Number,
      description:String,

      isMember:{
        type:Boolean,
        default:true,
      },

      memberId:{ type:String, default:"" },
      memberName:{ type:String, default:"" },
      phone:{ type:String, default:"" },

      nonMemberName:{ type:String, default:"" },
      nonMemberPhone:{ type:String, default:"" },
    }
  ],

  totalAmount:{
    type:Number,
    required:true
  },

  receiptDate:{
    type:Date,
    required:true,
  },

  paymentMethod:{
    type:String,
    enum:["Cash","Cheque","UPI Payment"],
    required:true,
  },

  chequeNumber:{ type:String, default:"" },
  chequeDate:{ type:Date, default:null },
  payerBankName:{ type:String, default:"" },

  bankId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"WomenBank",
    default:null,
  },

  bankName:{ type:String, default:"" },
  bankAccountNumber:{ type:String, default:"" },
  upiId:{ type:String, default:"" },

  migrated:{ type:Boolean, default:false },

  receiptReturned:{
    type:Boolean,
    default:false,
    index:true,
  },

  receiptReturnDate:{
    type:Date,
    default:null,
  },

  receiptReturnReason:{
    type:String,
    default:"",
  }

},
{ timestamps:true }
);

WomenReceiptSchema.index({ receiptDate:1, transNo:1 });

module.exports = mongoose.model("WomenReceipt",WomenReceiptSchema);