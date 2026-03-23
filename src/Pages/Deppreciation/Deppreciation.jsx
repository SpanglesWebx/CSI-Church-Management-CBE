import React, { useState } from "react";
import Modal from "../../Components/Expense/ExpenseFormModal"; 
import { FaPlus } from "react-icons/fa";

export const Deppreciation = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [ledgerCode, setLedgerCode] = useState("");
  const [ledgerName, setLedgerName] = useState("");
  const [date, setDate] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [depreciation, setDepreciation] = useState("");

  // allow only numbers
  const onlyNumber = (value) => value.replace(/\D/g, "");

  const handleSave = () => {
    console.log({
      ledgerCode,
      ledgerName,
      date,
      openingBalance,
      depreciation,
    });

    // later API call here
    setIsModalOpen(false);
  };

// get financial year start (01-04-yyyy)
const getFinancialYearStart = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = today.getMonth() + 1; // Jan = 1

  // if Jan–Mar → previous year FY
  const fyStartYear = month <= 3 ? year - 1 : year;

  // return YYYY-MM-DD (for input type="date")
  return `${fyStartYear}-04-01`;
};


  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold">Depreciation</h1>

          {/* <button
            onClick={() => {
            setDate(getFinancialYearStart());
            setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg"
          >
            <FaPlus />Depreciation
          </button> */}
        </div>
      </div>

      {/* ---------- MODAL ---------- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Depreciation"
      >
        <div className="max-h-[600px] overflow-y-auto">

          <div className="grid grid-cols-1 gap-6">

            {/* ROW 1 — 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Ledger Code
                </label>
                <input
                  type="text"
                  value={ledgerCode}
                  onChange={(e) => setLedgerCode(e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Ledger Name
                </label>
                <input
                  type="text"
                  value={ledgerName}
                  onChange={(e) => setLedgerName(e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            </div>

            {/* ROW 2 — 3 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Opening Balance
                </label>
                <input
                  type="text"
                  value={openingBalance}
                  onChange={(e) =>
                    setOpeningBalance(onlyNumber(e.target.value))
                  }
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Depreciation
                </label>
                <input
                  type="text"
                  value={depreciation}
                  onChange={(e) =>
                    setDepreciation(onlyNumber(e.target.value))
                  }
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            </div>

          </div>

          {/* SAVE BUTTON RIGHT */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-lavender--600 text-white rounded-md"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
