import React, { useEffect, useState } from "react";
import { FaReceipt } from "react-icons/fa";
import { MdPayments } from "react-icons/md";
import { HiOutlineDocumentText } from "react-icons/hi";

const StatBox = ({ title, icon, countValue, amountValue }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [displayAmount, setDisplayAmount] = useState(0);

  const animateNumber = (end, setter) => {
    let start = 0;

    if (end === 0) {
      setter(0);
      return;
    }

    const duration = 900;
    const interval = 20;
    const step = Math.ceil(end / (duration / interval));

    const counter = setInterval(() => {
      start += step;

      if (start >= end) {
        setter(end);
        clearInterval(counter);
      } else {
        setter(start);
      }
    }, interval);

    return () => clearInterval(counter);
  };

  useEffect(() => {
    const c1 = animateNumber(countValue, setDisplayValue);
    const c2 = animateNumber(amountValue, setDisplayAmount);

    return () => {
      c1 && c1();
      c2 && c2();
    };
  }, [countValue, amountValue]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border-2 border-lavender--600 relative flex flex-col justify-between">

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-lavender--600">{title}</h2>
        <span className="text-lavender--600">{icon}</span>
      </div>

      <div className="text-5xl font-bold text-lavender--600 text-center">
        {displayValue}
      </div>

      <div className="text-sm text-gray-600 text-center">
        Cemetery {title}
      </div>

      <div className="absolute bottom-3 right-4 text-sm font-semibold text-gray-700">
        ₹ {displayAmount.toLocaleString()}
      </div>
    </div>
  );
};

const CemeteryFinanceStatsCard = ({
  receiptsCount,
  receiptsAmount,
  paymentsCount,
  paymentsAmount,
  journalsCount,
  journalsAmount,
  loading
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

      <StatBox
        title="Receipts"
        icon={<FaReceipt size={32} />}
        countValue={receiptsCount}
        amountValue={receiptsAmount}
      />

      <StatBox
        title="Payments"
        icon={<MdPayments size={32} />}
        countValue={paymentsCount}
        amountValue={paymentsAmount}
      />

      <StatBox
        title="Journal"
        icon={<HiOutlineDocumentText size={32} />}
        countValue={journalsCount}
        amountValue={journalsAmount}
      />

    </div>
  );
};

export default CemeteryFinanceStatsCard;