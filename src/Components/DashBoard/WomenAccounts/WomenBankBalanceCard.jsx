



import React from "react";
import { FaUniversity } from "react-icons/fa";
import Spinners from "../../Spinners";
import AnimatedAmount from "../Accounts/AnimatedAmount";

const WomenBankBalanceCard = ({ banks = [], totalBankBalance = 0, loading }) => {

  const total = totalBankBalance;

  return (
    <div className="bg-white p-5 rounded-lg shadow-md border-2 border-lavender--600 h-full flex flex-col">

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-lavender--600">
          Women Bank Balance
        </h2>
        <FaUniversity className="text-lavender--600" size={28} />
      </div>

      {loading ? (
        <Spinners />
      ) : banks.length === 0 ? (

        <div className="flex flex-grow items-center justify-center text-gray-500">
          No women bank accounts  
        </div>

      ) : (
        <>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-lavender--600">
              <AnimatedAmount value={total} />
            </div>
          </div>

          <div className="border-t mb-4"></div>

          <div className="space-y-3 text-sm">

            {banks.map((bank) => (
              <div key={bank._id} className="flex justify-between">
                <span className="font-medium text-gray-700">
                  {bank.bank_name}
                </span>

                <span className="text-green-600 font-bold">
                  <AnimatedAmount value={bank.current_balance || 0} />
                </span>
              </div>
            ))}

          </div>
        </>
      )}

    </div>
  );
};

export default WomenBankBalanceCard;