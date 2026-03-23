import React, { useEffect, useState } from "react";
import Spinners from "../../Spinners";

const FinanceStatsCard = ({
  title,
  count,
  amount,
  icon,
  loading,
}) => {
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
    if (loading) {
      setDisplayValue(0);
      setDisplayAmount(0);
      return;
    }

    const clear1 = animateNumber(Number(count) || 0, setDisplayValue);
    const clear2 = animateNumber(Number(amount) || 0, setDisplayAmount);

    return () => {
      clear1 && clear1();
      clear2 && clear2();
    };
  }, [count, amount, loading]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border-2 border-lavender--600 relative flex flex-col justify-between">

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-lavender--600">
          {title}
        </h2>

        <span className="text-lavender--600 flex items-center">
          {icon}
        </span>
      </div>

      {loading ? (
        <Spinners />
      ) : (
        <>
          {/* COUNT */}
          <div className="text-5xl font-bold text-lavender--600 text-center">
            {displayValue}
          </div>

          <div className="text-sm text-gray-600 text-center">
            Today {title}
          </div>

          {/* AMOUNT */}
          <div className="absolute bottom-3 right-4 text-sm font-semibold text-gray-700">
            ₹ {displayAmount.toLocaleString()}
          </div>
        </>
      )}
    </div>
  );
};

export default FinanceStatsCard;