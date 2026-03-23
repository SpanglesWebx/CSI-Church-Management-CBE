import React, { useEffect, useState, useMemo } from "react";
import { FaMoneyBillWave } from "react-icons/fa";

const WomenCashBalanceCard = ({ cashInHand = 0, pettyCash = 0 }) => {



  const [cashDisplay, setCashDisplay] = useState(0);
  const [pettyDisplay, setPettyDisplay] = useState(0);
  const [totalDisplay, setTotalDisplay] = useState(0);

  const total = useMemo(() => {
    return cashInHand + pettyCash;
  }, [cashInHand, pettyCash]);

  const animate = (value, setter) => {
    let start = 0;

    const duration = 1800;
    const interval = 20;
    const step = Math.ceil(value / (duration / interval));

    const counter = setInterval(() => {
      start += step;

      if (start >= value) {
        setter(value);
        clearInterval(counter);
      } else {
        setter(start);
      }
    }, interval);

    return () => clearInterval(counter);
  };

  useEffect(() => {
    const c1 = animate(cashInHand, setCashDisplay);
    const c2 = animate(pettyCash, setPettyDisplay);
    const c3 = animate(total, setTotalDisplay);

    return () => {
      c1 && c1();
      c2 && c2();
      c3 && c3();
    };
  }, [cashInHand, pettyCash, total]);

  return (
    <div className="bg-white p-5 rounded-lg shadow-md border-2 border-lavender--600 h-full flex flex-col">

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-lavender--600">
          Women Cash Balance
        </h2>
        <FaMoneyBillWave className="text-lavender--600" size={28} />
      </div>

      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-lavender--600">
          ₹ {totalDisplay.toLocaleString()}
        </div>
      </div>

      <div className="border-t mb-4"></div>

      <div className="space-y-3 text-sm">

        <div className="flex justify-between">
          <span className="font-medium text-gray-700">Cash in Hand</span>
          <span className="text-green-600 font-bold">
            ₹ {cashDisplay.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium text-gray-700">Petty Cash</span>
          <span className="text-green-600 font-bold">
            ₹ {pettyDisplay.toLocaleString()}
          </span>
        </div>

      </div>

    </div>
  );
};

export default WomenCashBalanceCard;