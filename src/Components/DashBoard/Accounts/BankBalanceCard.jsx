import React, { useMemo } from "react";
import Spinners from "../../Spinners";
import { FaUniversity } from "react-icons/fa";
import AnimatedAmount from "./AnimatedAmount";

const BankBalanceCard = ({ banks, loading }) => {

  // Calculate total bank balance
  const totalBalance = useMemo(() => {
    return banks.reduce((sum, bank) => sum + (bank.current_balance || 0), 0);
  }, [banks]);

  return (
    <div className="bg-white p-5 rounded-lg shadow-md border-2 border-lavender--600 h-full flex flex-col">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-lavender--600">
          Bank Balance
        </h2>
        <FaUniversity className="text-lavender--600" size={28} />
      </div>

      {loading ? (
        <Spinners />
      ) : (
        <div className="flex flex-col flex-grow">





          {banks.length === 0 ? (
            <div className="flex flex-grow items-center justify-center text-gray-500">
              No bank accounts added yet
            </div>
          ) : (

            <>
              {/* TOTAL */}
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-lavender--600 tracking-wide">
                  <AnimatedAmount value={totalBalance} />
                </div>
              </div>

              <div className="border-t mb-4"></div>

              {/* BANK LIST */}
              <div className="space-y-3 text-sm flex-grow">

                {banks.map((bank) => (
                  <div
                    key={bank._id}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div className="font-medium text-gray-700">
                      {bank.bank_name}
                    </div>

                    <div className="font-bold text-green-600">
                      <AnimatedAmount value={bank.current_balance} />
                    </div>
                  </div>
                ))}

              </div>


            </>

          )}

        </div>
      )}
    </div>
  );
};

export default BankBalanceCard;