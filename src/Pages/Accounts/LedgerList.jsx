import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { URL } from "../../App";
import SmallSizedModal from "../../Components/Expense/SmallSizedModal";

export const LedgerList = () => {
  const navigate = useNavigate();
  const token = window.sessionStorage.getItem("token");

  const [userRole, setUserRole] = useState("");

  const [accountType, setAccountType] = useState("");
  const [incomeType, setIncomeType] = useState("ASSESSABLE");

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [ledgerList, setLedgerList] = useState([]);

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingLedger, setLoadingLedger] = useState(false);

const [confirmModal, setConfirmModal] = useState(false);
const [pendingAction, setPendingAction] = useState(null);
const [modalText, setModalText] = useState("");


  /* ===============================
     GET USER ROLE
  =============================== */
  useEffect(() => {
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const storedRole = sessionStorage.getItem("role");

      if (storedRole && decoded.roles?.includes(storedRole)) {
        setUserRole(storedRole);
      } else {
        setUserRole(decoded.roles?.[0] || "");
      }
    } catch (err) {
      console.error("Invalid token", err);
    }
  }, [token]);

  /* ===============================
     FETCH CATEGORIES
  =============================== */
  const fetchCategories = async () => {
    if (!accountType) return;

    setLoadingCategories(true);

    try {
      const query = encodeURIComponent(accountType);

      const res = await axios.get(
        `${URL}/ledger-category/categories?accountType=${query}${
          accountType === "Income" ? `&incomeType=${incomeType}` : ""
        }`,
        { headers: { Authorization: token } }
      );

      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    }

    setLoadingCategories(false);
  };

  useEffect(() => {
    fetchCategories();
    setSelectedCategory(null);
    setLedgerList([]);
  }, [accountType, incomeType]);

  /* ===============================
     FETCH LEDGERS
  =============================== */
  const fetchLedgers = async (id) => {
    if (!id) return;

    setLoadingLedger(true);

    try {
      const res = await axios.get(
        `${URL}/ledger-category/ledgers/${id}`,
        { headers: { Authorization: token } }
      );

      setLedgerList(res.data?.ledgers || []);
    } catch (err) {
      console.error(err);
    }

    setLoadingLedger(false);
  };


const toggleCategory = async (id) => {
  try {
    const res = await axios.patch(
      `${URL}/ledger-category/category/${id}/status`,
      {},
      { headers: { Authorization: token } }
    );

    const updated = res.data.category;

    setCategories(prev =>
      prev.map(c => (c._id === id ? updated : c))
    );

    if (selectedCategory?._id === id) {
      setSelectedCategory(updated);
      setLedgerList(updated.ledgers || []);
    }

  } catch (err) {
    console.log(err);
  }
};

const toggleLedger = async (categoryId, ledgerCode) => {
  try {
    const res = await axios.patch(
      `${URL}/ledger-category/ledger/${categoryId}/${ledgerCode}/status`,
      {},
      { headers: { Authorization: token } }
    );

    const updatedLedger = res.data.ledger;

    setLedgerList(prev =>
      prev.map(l => (l.code === ledgerCode ? updatedLedger : l))
    );

  } catch (err) {
    console.log(err);
  }
};


const askToggleCategory = (category) => {
  const nextStatus = category.status === "active" ? "inactive" : "active";

  setModalText(
    `Are you sure you want to change "${category.name}" as ${nextStatus}?`
  );

  setPendingAction(() => () => toggleCategory(category._id));
  setConfirmModal(true);
};

const askToggleLedger = (ledger) => {
  if (selectedCategory?.status !== "active") {
    return;
  }

  const nextStatus = ledger.status === "active" ? "inactive" : "active";

  setModalText(
    `Are you sure you want to change "${ledger.name}" as ${nextStatus}?`
  );

  setPendingAction(() => () =>
    toggleLedger(selectedCategory._id, ledger.code)
  );

  setConfirmModal(true);
};

  useEffect(() => {
    if (selectedCategory) {
      fetchLedgers(selectedCategory._id);
    }
  }, [selectedCategory]);

const Switch = ({ checked, onChange, disabled }) => {
  return (
    <div
      onClick={!disabled ? onChange : undefined}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 ease-in-out
      ${disabled ? "bg-gray-200 cursor-not-allowed" : checked ? "bg-lavender--600 cursor-pointer" : "bg-gray-300 cursor-pointer"}`}
    >
      <div
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ease-in-out ${
          checked ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </div>
  );
};


  return (
    <>
      <div className="p-2 mx-1 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold text-lavender--600">
            Types of Ledgers
          </h1>

          {["admin", "churchofficeworker"].includes(userRole) && (
            <button
              onClick={() =>
                navigate("/admin/TypesofLedgerList/AddTypesofLedger")
              }
              className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg"
            >
              <FaPlus /> Create Ledgers
            </button>
          )}
        </div>

        {/* ACCOUNT TYPE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2 p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Account Type{" "}
              <span className="text-red-500 font-bold text-[17px]">*</span>
            </label>

            <select
              value={accountType}
              onChange={(e) => {
                setAccountType(e.target.value);

                if (e.target.value !== "Income") {
                  setIncomeType("ASSESSABLE");
                }
              }}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            >
              <option value="">Select Account Type</option>
              <option value="Capital A/c">Capital A/c</option>
              <option value="Assets-Fixed Assets">Assets-Fixed Assets</option>
              <option value="Assets-Current Assets">Assets-Current Assets</option>
              <option value="Assets-Investments & Deposits">
                Assets-Investments & Deposits
              </option>
              <option value="Liabilities-Current Liabilities and Provisions">
                Liabilities-Current Liabilities and Provisions
              </option>
              <option value="Liabilities-Funds">Liabilities-Funds</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
          </div>

          {accountType === "Income" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Income Type{" "}
                <span className="text-red-500 font-bold text-[17px]">*</span>
              </label>

              <div className="flex justify-center">
                <div className="relative flex bg-gray-200 rounded-full p-1 text-sm font-medium w-[70%]">
                  <div
                    className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
                    style={{
                      width: "calc(50% - 0.25rem)",
                      transform:
                        incomeType === "ASSESSABLE"
                          ? "translateX(0)"
                          : "translateX(100%)",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setIncomeType("ASSESSABLE")}
                    className={`relative flex-1 py-1 text-center rounded-full ${
                      incomeType === "ASSESSABLE"
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    Assessable Income
                  </button>

                  <button
                    type="button"
                    onClick={() => setIncomeType("NON_ASSESSABLE")}
                    className={`relative flex-1 py-1 text-center rounded-full ${
                      incomeType === "NON_ASSESSABLE"
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    Non-Assessable Income
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MAIN TWO PANEL LAYOUT */}
        <div className="flex gap-4 mt-4 p-4">
          {/* LEFT SIDE */}
          <div className="w-1/2">
            <div className="bg-white shadow-md rounded-lg border p-4 h-[480px]">
              <div className="overflow-y-auto h-full">
                {loadingCategories ? (
                  <p className="text-sm text-gray-500">Loading...</p>
                ) : categories.length === 0 ? (
                  <p className="text-sm text-gray-500">No categories</p>
                ) : (
                  <table className="w-full text-sm border">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="border p-2 text-center w-[70px]">
                          SI No
                        </th>
                        <th className="border p-2 text-left">
                          Ledger Name
                        </th>
                        <th className="border p-2 text-center w-[150px]">
                          Depreciation %
                        </th>
<th className="border p-2 text-center w-[120px]">
  Status
</th>
                      </tr>
                    </thead>

                    <tbody>
                      {categories.map((c, index) => (
                        <tr
                          key={c._id}
                          onClick={() => setSelectedCategory(c)}
                          className={`cursor-pointer ${
                            selectedCategory?._id === c._id
                              ? "bg-lavender--100"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <td className="border p-2 text-center">
                            {index + 1}
                          </td>

                          <td className="border p-2 font-medium">
                            {c.name}
                          </td>

                          <td className="border p-2 text-center">
                            {c.depreciationPercent
                              ? `${c.depreciationPercent}%`
                              : "-"}
                          </td>

<td className="border p-2 text-center">
  <Switch
    checked={c.status === "active"}
onChange={(e) => {
  e.stopPropagation();
  askToggleCategory(c);
}}
  />
</td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="w-1/2">
            <div className="bg-white shadow-md rounded-lg border p-4 h-[480px]">
              {selectedCategory ? (
                <div className="flex flex-col h-full">
                  <div className="overflow-y-auto flex-1">
                    <h3 className="text-[23px] font-semibold mb-2">
                      {selectedCategory.name}
                    </h3>

                    {loadingLedger ? (
                      <p className="text-sm text-gray-500">Loading...</p>
                    ) : ledgerList.length === 0 ? (
                      <p className="text-xs text-gray-500">
                        No ledgers added
                      </p>
                    ) : (
                      ledgerList.map((l, i) => (
<div key={l.code || i} className="p-2 border-b flex gap-3 items-center">

  <span className="text-gray-500 font-semibold">
    {l.code}
  </span>

  <span>{l.name}</span>

  <span className="ml-auto text-gray-600">
    {l.depreciationValue ?? "-"}
  </span>

<Switch
  checked={l.status === "active"}
  disabled={selectedCategory?.status !== "active"}
  onChange={() => askToggleLedger(l)}
/>

</div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Select a category to view details
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

<SmallSizedModal
  isOpen={confirmModal}
  onClose={() => setConfirmModal(false)}
  title="Confirmation"
>
  <p className="text-sm text-gray-700">{modalText}</p>

  <div className="flex justify-end gap-3 mt-4">
    {/* <button
      onClick={() => setConfirmModal(false)}
      className="px-4 py-2 bg-gray-300 rounded"
    >
      Cancel
    </button> */}

    <button
      onClick={() => {
        if (pendingAction) pendingAction();
        setConfirmModal(false);
      }}
      className="px-4 py-2 bg-lavender--600 text-white rounded"
    >
      Yes
    </button>
  </div>
</SmallSizedModal>

    </>
  );
};