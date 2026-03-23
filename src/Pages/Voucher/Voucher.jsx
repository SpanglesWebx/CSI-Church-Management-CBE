import React, { useState } from "react";
import VoucherPrint from "./VoucherPrint";

const Voucher = () => {
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  return (
    <div>

      <button onClick={() => setIsPrintOpen(true)}>
        Print Voucher
      </button>

      <VoucherPrint
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        voucherData={{
          voucherNo: "123",
          dd: "12",
          mm: "03",
          yyyy: "2025",
          coimbatore: "10000",
          rupees: "Ten Thousand Only",
          towards: "Donation",
          chequeNo: "123456"
        }}
      />

    </div>
  );
};

export default Voucher;