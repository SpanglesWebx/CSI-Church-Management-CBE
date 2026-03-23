import React, { useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaPlus, FaTimes, FaTrash } from "react-icons/fa";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import { URL } from "../../App";
import { useNavigate } from "react-router-dom";

export const TypesofLedgers = () => {
  const token = window.sessionStorage.getItem("token");
  const navigate = useNavigate();

  /* ===============================
     LEFT SIDE (CATEGORY / GROUP)
  =============================== */
  const [categories, setCategories] = useState([]);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [nextLedgerCode, setNextLedgerCode] = useState("");


  /* ===============================
     ACCOUNT TYPE (ASSESSABLE / NON)
  =============================== */
  const [accountType, setAccountType] = useState("");
  const [incomeType, setIncomeType] = useState("ASSESSABLE");

  /* ===============================
     RIGHT SIDE (LEDGERS)
  =============================== */
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [ledgerList, setLedgerList] = useState([]);
  const [input, setInput] = useState("");
  const [showLedgerInput, setShowLedgerInput] = useState(false);
  const [savingLedger, setSavingLedger] = useState(false);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const isBusy = addingCategory || savingLedger;

// ⭐ depreciation modal state
const [showDepModal, setShowDepModal] = useState(false);
const [depCategory, setDepCategory] = useState("");
const [depPercent, setDepPercent] = useState("");


// ⭐ ledger depreciation modal
const [showLedgerDepModal, setShowLedgerDepModal] = useState(false);
const [depLedgerCategory, setDepLedgerCategory] = useState("");
const [depLedger, setDepLedger] = useState("");
const [depDate, setDepDate] = useState("");
const [depLedgerPercent, setDepLedgerPercent] = useState("");
const [categoryLedgers, setCategoryLedgers] = useState([]);



  useEffect(() => {
    const blockRefresh = (e) => {
      if (isBusy) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", blockRefresh);
    return () => window.removeEventListener("beforeunload", blockRefresh);
  }, [isBusy]);

useEffect(() => {
  if (!selectedCategory) return;

  axios
    .get(`${URL}/ledger-category/ledgers/${selectedCategory._id}/next-code`, {
      headers: { Authorization: token }
    })
    .then(res => setNextLedgerCode(res.data.next));
}, [selectedCategory]);

  /* ===============================
     COMMON / UI
  =============================== */
  const [Response, setResponse] = useState({ status: null, message: "" });
  const categoryInputRef = useRef(null);

  /* ===============================
     AUTO FOCUS CATEGORY INPUT
  =============================== */
  useEffect(() => {
    if (showAdd && categoryInputRef.current) {
      categoryInputRef.current.focus();
    }
  }, [showAdd]);

  /* ===============================
     FETCH CATEGORIES (BY ACCOUNT TYPE)
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
    setResponse({
      status: "Failed",
      message: "Failed to load categories",
    });
  } finally {
    setLoadingCategories(false);
  }
};



  /* Initial load + reload on account type change */
  useEffect(() => {
    fetchCategories();
    setSelectedCategory(null);
    setLedgerList([]);
  }, [accountType, incomeType]);


  /* ===============================
     ADD CATEGORY (WITH ACCOUNT TYPE)
  =============================== */
  const addCategory = async () => {
    if (!newCategory.trim()) {
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Category name required",
        });
      }, 10);

      setTimeout(() => {
        setResponse({ status: null, message: "" });
      }, 3000);
      return;
    }
    if (addingCategory) return;
    setAddingCategory(true);

    try {
      await axios.post(
        `${URL}/ledger-category/categories/add`,
        {
          name: newCategory.trim(),
          accountType, // ✅ correct
          incomeType: accountType === "Income" ? incomeType : null
        },
        { headers: { Authorization: token } }
      );

      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Success",
          message: "Category added",
        });
      }, 10);

      setNewCategory("");
      setShowAdd(true);
      fetchCategories();
    } catch (err) {
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message:
            err.response?.data?.message || "Failed to add category",
        });
      }, 10);
    } finally {
      setAddingCategory(false);
      setTimeout(() => {
        setResponse({ status: null, message: "" });
      }, 3000);
    }
  };

  const handleCategoryKeyDown = (e) => {
    if (e.key === "Enter" && newCategory.trim()) {
      e.preventDefault();
      addCategory();
    }
  };

  /* ===============================
     FETCH LEDGERS FOR CATEGORY
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
      setResponse({
        status: "Failed",
        message: "Failed to load ledgers",
      });
    }

    setLoadingLedger(false);
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchLedgers(selectedCategory._id);
    }
  }, [selectedCategory]);

  /* ===============================
     ADD LEDGER (ENTER / TAB)
  =============================== */
const handleKeyDown = (e) => {
  if ((e.key === "Enter" || e.key === "Tab") && input.trim()) {
    e.preventDefault();

    setLedgerList(prev => [
      ...prev,
      {
        name: input.trim(),
        code: nextLedgerCode   // 🔥 AUTO APPEND LIKE BAPTISM ID
      }
    ]);

    // increment locally for UI preview only
    const prefix = nextLedgerCode.replace(/\d/g, "");
    const num = Number(nextLedgerCode.replace(/\D/g, "")) + 1;
    setNextLedgerCode(prefix + String(num).padStart(4, "0"));

    setInput("");
  }
};


  /* ===============================
     SAVE LEDGERS
  =============================== */
  const saveLedgers = async () => {
    if (!selectedCategory) {
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Select a category first",
        });
      }, 10);

      setTimeout(() => {
        setResponse({ status: null, message: "" });
      }, 3000);
      return;
    }
    if (savingLedger) return;

    setSavingLedger(true);

    try {
      await axios.post(
        `${URL}/ledger-category/ledgers/${selectedCategory._id}/save`,
        {
          ledgers: ledgerList.map(l => l.name)   // ✅ ONLY NAMES
        },
        { headers: { Authorization: token } }
      );

      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Success",
          message: "Saved successfully",
        });
      }, 10);
    } catch (err) {
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Failed to save ledgers",
        });
      }, 10);
    } finally {
      setSavingLedger(false);
      setTimeout(() => {
        setResponse({ status: null, message: "" });
      }, 3000);
    }
  };

const saveDepreciation = async () => {
  if (!depCategory || !depPercent) {
    setResponse({
      status: "Failed",
      message: "Fill all fields"
    });
    return;
  }

  try {
    await axios.post(`${URL}/ledger-category/set-depreciation`, {
      categoryId: depCategory,
      depreciationPercent: depPercent
    }, {
      headers: { Authorization: token }
    });

    await fetchCategories();

    setResponse({
      status: "Success",
      message: "Depreciation saved"
    });

    setShowDepModal(false);
    setDepCategory("");
    setDepPercent("");

  } catch (err) {
    setResponse({
      status: "Failed",
      message: "Failed to save depreciation"
    });
  }
};

const saveLedgerDepreciation = async () => {
  if (!depLedgerCategory || !depLedger || !depDate || !depLedgerPercent) {
    setResponse({ status: "Failed", message: "Fill all fields" });
    return;
  }

  try {
    await axios.post(`${URL}/ledger-category/set-ledger-depreciation`, {
      categoryId: depLedgerCategory,
      ledgerCode: depLedger,
      depreciationValue: depLedgerPercent,
      depreciationDate: depDate
    }, {
      headers: { Authorization: token }
    });

    setResponse({ status: "Success", message: "Saved successfully" });

    setShowLedgerDepModal(false);
    setDepLedgerCategory("");
    setDepLedger("");
    setDepDate("");
    setDepLedgerPercent("");

  } catch (err) {
    setResponse({ status: "Failed", message: "Failed to save" });
  }
};


const fetchCategoryLedgers = async (categoryId) => {
  if (!categoryId) return;

  try {
    const res = await axios.get(
      `${URL}/ledger-category/ledgers/${categoryId}`,
      { headers: { Authorization: token } }
    );

    setCategoryLedgers(res.data.ledgers || []);
  } catch (err) {
    console.log(err);
  }
};



  const toTitleCase = (value) => {
  return value
    .split(" ")
    .map(word => {
      // keep abbreviations as-is (LIC, PF, GST)
      if (word === word.toUpperCase() && word.length > 1) {
        return word;
      }

      // normal title case
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};



  return (
    <>
      <div className={`${isBusy ? "pointer-events-none opacity-60" : ""}`}>
        <FaArrowLeft
          size={18}
          title='Back'
          onClick={() => navigate("/admin/TypesofLedgerList")}
          className="cursor-pointer mb-4"
        />
        <div className="p-2 mx-1 bg-white shadow-md rounded-[10px]">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-lg font-semibold text-lavender--600">
              Add Types of Ledgers
            </h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Account Type <span className='text-red-500 font-bold text-[17px]'>*</span>
              </label>

              <select
                value={accountType}
                onChange={(e) => {
                  setAccountType(e.target.value);

                  // reset income type if not Income
                  if (e.target.value !== "Income") {
                    setIncomeType("ASSESSABLE"); // default / safe reset
                  }
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">Select Account Type</option>
                <option value="Capital A/c">Capital A/c</option>
                <option value="Assets-Fixed Assets">Assets-Fixed Assets</option>
                <option value="Assets-Current Assets">Assets-Current Assets</option>
                <option value="Assets-Investments & Deposits">Assets-Investments & Deposits</option>
                <option value="Liabilities-Current Liabilities and Provisions">Liabilities-Current Liabilities and Provisions</option>
                <option value="Liabilities-Funds">Liabilities-Funds</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </div>
            {accountType === "Income" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Income Type <span className="text-red-500 font-bold text-[17px]">*</span>
                </label>

                <div className="flex justify-center">
                  <div className="relative flex bg-gray-200 rounded-full p-1 text-sm font-medium w-[70%]">
                    {/* animated background */}
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

                    {/* ASSESSABLE */}
                    <button
                      type="button"
                      onClick={() => setIncomeType("ASSESSABLE")}
                      className={`relative flex-1 py-1 text-center rounded-full
                  ${incomeType === "ASSESSABLE" ? "text-white" : "text-gray-700"}
                  `}
                    >
                      Assessable Income
                    </button>

                    {/* NON-ASSESSABLE */}
                    <button
                      type="button"
                      onClick={() => setIncomeType("NON_ASSESSABLE")}
                      className={`relative flex-1 py-1 text-center rounded-full
                  ${incomeType === "NON_ASSESSABLE" ? "text-white" : "text-gray-700"}
                  `}
                    >
                      Non-Assessable Income
                    </button>

                  </div>
                </div>
              </div>
            )}
          </div>





          <div className="flex gap-4 mt-4">
            {/* LEFT HALF */}
            <div className="w-1/2">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex-1">
                  {showAdd ? (
                    <input
                      ref={categoryInputRef}
                      value={newCategory}
                      onChange={(e) => setNewCategory(toTitleCase(e.target.value))}
                      onKeyDown={handleCategoryKeyDown}
                      placeholder="Enter category name"
                      type="text"
                      className="block w-full  border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  ) : (
                    <div></div>
                  )}
                </div>

                {!showAdd ? (
                  <>
                    <button
                      onClick={() => setShowAdd(true)}
                      disabled={!accountType}
                      className={`px-4 py-2 rounded text-sm flex items-center gap-2
                        ${!accountType
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-lavender--600 text-white hover:bg-lavender--700"}
                      `}
                      title={!accountType ? "Select Account Type first" : ""}
                    >
                      <FaPlus /> Category
                    </button>

                    <button
                      onClick={() => setShowDepModal(true)}
                      disabled={!accountType}
                      className={`px-4 py-2 rounded text-sm flex items-center gap-2
                        ${!accountType
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-lavender--600 text-white hover:bg-lavender--700"}
                      `}
                    >
                      <FaPlus /> Depreciation
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={addCategory}
                      disabled={addingCategory}
                      className={`w-9 h-9 rounded-md flex items-center justify-center
                      ${addingCategory
                          ? "bg-gray-400 cursor-not-allowed"
                          : "border-2 border-lavender--600 text-lavender--600 hover:bg-lavender--600 hover:text-white"}
                      `}
                    >
                      {addingCategory ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <FaPlus size={16} />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setShowAdd(false);
                        setNewCategory("");
                      }}
                      className="border-2 border-red-500 text-red-500 w-9 h-9 flex items-center justify-center rounded-md hover:bg-red-500 hover:text-white"
                    >
                      <FaTimes size={16} />
                    </button>
                  </div>
                )}
              </div>

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
        <th className="border p-2 text-center w-[70px]">SI No</th>
        <th className="border p-2 text-left">Ledger Name</th>
        <th className="border p-2 text-center w-[150px]">Depreciation %</th>
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
          <td className="border p-2 text-center">{index + 1}</td>

          <td className="border p-2 font-medium">
            {c.name}
          </td>

<td className="border p-2 text-center">
  {c.depreciationPercent !== null && c.depreciationPercent !== undefined
    ? `${c.depreciationPercent}%`
    : "-"}
</td>
        </tr>
      ))}
    </tbody>
  </table>
)}

                </div>
              </div>
            </div>

            {/* RIGHT HALF */}
            <div className="w-1/2">
              <div className="flex items-center justify-between gap-2 mb-2 h-[35px]">
                <div className="flex-1">
                  {selectedCategory && showLedgerInput ? (
                    <input
                      value={input}
                      type="text"
                      onChange={(e) => setInput(toTitleCase(e.target.value))}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter ledger"
                      className="block w-full  border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  ) : (
                    <div></div>
                  )}
                </div>

                {selectedCategory ? (
                  !showLedgerInput ? (
                  <>
                    <button
                      onClick={() => setShowLedgerInput(true)}
                      disabled={!accountType || !selectedCategory}
                      className={`px-4 py-2 rounded text-sm flex items-center gap-2
                    ${!accountType || !selectedCategory
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-lavender--600 text-white hover:bg-lavender--700"}
                        `}
                      title={
                        !accountType
                          ? "Select Account Type first"
                          : !selectedCategory
                            ? "Select a category first"
                            : ""
                      }
                    >
                      <FaPlus /> Ledger
                    </button>

<button
  onClick={() => setShowLedgerDepModal(true)}
  disabled={!selectedCategory}
  className={`px-4 py-2 rounded text-sm flex items-center gap-2
    ${!selectedCategory
      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
      : "bg-lavender--600 text-white hover:bg-lavender--700"}
  `}
>
  <FaPlus /> Dep.Value
</button>


                  </>
                  ) : (
                    <div className="flex items-center gap-3">
<button
  onClick={() => {
    if (!input.trim()) return;

    setLedgerList(prev => [
      ...prev,
      {
        name: input.trim(),
        code: nextLedgerCode
      }
    ]);

    // increment preview code
    const prefix = nextLedgerCode.replace(/\d/g, "");
    const num = Number(nextLedgerCode.replace(/\D/g, "")) + 1;
    setNextLedgerCode(prefix + String(num).padStart(4, "0"));

    setInput("");
  }}
  className="border-2 border-lavender--600 text-lavender--600 w-9 h-9 flex items-center justify-center rounded-md hover:bg-lavender--600 hover:text-white"
>
  <FaPlus size={16} />
</button>

                      <button
                        onClick={() => {
                          setShowLedgerInput(false);
                          setInput("");
                        }}
                        className="border-2 border-red-500 text-red-500 w-9 h-9 flex items-center justify-center rounded-md hover:bg-red-500 hover:text-white"
                      >
                        <FaTimes size={16} />
                      </button>
                    </div>
                  )
                ) : (
                  <div className="w-[130px]"></div>
                )}
              </div>

              <div className="bg-white shadow-md rounded-lg border p-4 h-[480px]">
                {selectedCategory ? (
                  <div className="flex flex-col h-full">
                    <div className="overflow-y-auto flex-1">
                      <h3 className="text-[23px] font-semibold mb-2">
                        {selectedCategory.name}
                      </h3>

                      {ledgerList.length === 0 ? (
                        <p className="text-xs text-gray-500">No ledgers added</p>
                      ) : (
                        ledgerList.map((l, i) => (
                          <div key={l.code || i} className="p-2 border-b flex gap-3">
                            <span className="text-gray-500 font-semibold">{l.code}</span>
                            <span>{l.name}</span>
                          </div>
                        ))
                      )}
                    </div>

                    {showLedgerInput && (
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={saveLedgers}
                          disabled={savingLedger}
                          className={`px-6 py-2 rounded text-sm text-white flex items-center gap-2
                        ${savingLedger ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}
                        `}
                        >
                          {savingLedger && (
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          )}
                          {savingLedger ? "Saving..." : "Save"}
                        </button>

                      </div>
                    )}
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

        {Response.status &&
          (Response.status === "Success" ? (
            <SuccessMessage Message={Response.message} />
          ) : (
            <FailedMessage Message={Response.message} />
          ))}
{/* ⭐ DEPRECIATION MODAL */}
{showDepModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg w-[400px]">

      <h2 className="text-lg font-semibold mb-4">
        Add Depreciation
      </h2>

      {/* row 1 */}
      <div className="grid grid-cols-2 gap-4 mb-4">

        {/* select category */}
        <select
          value={depCategory}
          onChange={(e) => setDepCategory(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">Select Category</option>
          {categories.map(c => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* depreciation */}
<input
  type="text"
  placeholder="Depreciation %"
  value={depPercent}
  onChange={(e) => {
    const value = e.target.value;

    // allow only numbers + one dot + max 2 decimals
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setDepPercent(value);
    }
  }}
  className="border rounded p-2"
/>

      </div>

      {/* row 2 */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowDepModal(false)}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>

        <button
          onClick={saveDepreciation}
          className="px-4 py-2 bg-lavender--600 text-white rounded"
        >
          Save
        </button>
      </div>

    </div>
  </div>
)}


{/* ⭐ LEDGER DEPRECIATION MODAL */}
{showLedgerDepModal && (
<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
<div className="bg-white p-6 rounded-lg w-[500px]">

<h2 className="text-lg font-semibold mb-4">
Depreciation Value
</h2>

{/* row 1 */}
<div className="grid grid-cols-2 gap-4 mb-4">

<select
value={depLedgerCategory}
onChange={(e)=>{
setDepLedgerCategory(e.target.value);
fetchCategoryLedgers(e.target.value);
}}
className="border p-2 rounded"
>
<option value="">Select Category</option>
{categories.map(c=>(
<option key={c._id} value={c._id}>{c.name}</option>
))}
</select>

<select
value={depLedger}
onChange={(e)=>setDepLedger(e.target.value)}
className="border p-2 rounded"
>
<option value="">Select Ledger</option>
{categoryLedgers.map(l=>(
<option key={l.code} value={l.code}>{l.name}</option>
))}
</select>

</div>

{/* row 2 */}
<div className="grid grid-cols-2 gap-4 mb-4">

<input
type="date"
value={depDate}
onChange={(e)=>setDepDate(e.target.value)}
className="border p-2 rounded"
/>

<input
type="text"
placeholder="Value"
value={depLedgerPercent}
onChange={(e)=>{
if(/^\d*\.?\d{0,2}$/.test(e.target.value)){
setDepLedgerPercent(e.target.value);
}
}}
className="border p-2 rounded"
/>

</div>

{/* row 3 */}
<div className="flex justify-end gap-3">
<button
onClick={()=>setShowLedgerDepModal(false)}
className="px-4 py-2 border rounded"
>
Cancel
</button>

<button
onClick={saveLedgerDepreciation}
className="px-4 py-2 bg-lavender--600 text-white rounded"
>
Save
</button>
</div>

</div>
</div>
)}


      </div>
    </>
  );
};
