
import React from "react";
import { FaUniversity } from "react-icons/fa";
import Spinners from "../../Spinners";
import AnimatedAmount from "../Accounts/AnimatedAmount";

const CemeteryBankBalanceCard = ({
  banks = [],
  totalBankBalance = 0,
  loading
}) => {

  return (
    <div className="bg-white p-5 rounded-lg shadow-md border-2 border-lavender--600 h-full flex flex-col">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-lavender--600">
          Cemetery Bank Balance
        </h2>
        <FaUniversity className="text-lavender--600" size={28} />
      </div>

      {loading ? (
        <Spinners />
      ) : (
        <div className="flex flex-col flex-grow">

          {/* Empty State */}
          {banks.length === 0 ? (
            <div className="flex flex-grow items-center justify-center text-gray-500">
              No cemetery bank accounts    
            </div>
          ) : (
            <>
              {/* TOTAL BALANCE */}
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-lavender--600 tracking-wide">
                  <AnimatedAmount value={totalBankBalance} />
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
                      <AnimatedAmount value={bank.current_balance || 0} />
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

export default CemeteryBankBalanceCard;