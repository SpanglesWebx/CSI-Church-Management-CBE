import React, { useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaPlus, FaTimes } from "react-icons/fa";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import { URL } from "../../App";
import { useNavigate } from "react-router-dom";

export const CemLedgerTypes = () => {
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
     ACCOUNT TYPE
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

  /* ===============================
     BLOCK REFRESH WHEN BUSY
  =============================== */
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

  /* ===============================
     GET NEXT LEDGER CODE
  =============================== */
  useEffect(() => {
    if (!selectedCategory) return;

    axios
      .get(
        `${URL}/cemetery-ledger-category/ledgers/${selectedCategory._id}/next-code`,
        { headers: { Authorization: token } }
      )
      .then((res) => setNextLedgerCode(res.data.next));
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
     FETCH CATEGORIES
  =============================== */
  const fetchCategories = async () => {
    if (!accountType) return;

    setLoadingCategories(true);
    try {
      const query = encodeURIComponent(accountType);

      const res = await axios.get(
        `${URL}/cemetery-ledger-category/categories?accountType=${query}${accountType === "Income" ? `&incomeType=${incomeType}` : ""
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

  useEffect(() => {
    fetchCategories();
    setSelectedCategory(null);
    setLedgerList([]);
  }, [accountType, incomeType]);

  /* ===============================
     ADD CATEGORY
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
        `${URL}/cemetery-ledger-category/categories/add`,
        {
          name: newCategory.trim(),
          accountType,
          incomeType: accountType === "Income" ? incomeType : null,
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
     FETCH LEDGERS
  =============================== */
  const fetchLedgers = async (id) => {
    if (!id) return;
    setLoadingLedger(true);

    try {
      const res = await axios.get(
        `${URL}/cemetery-ledger-category/ledgers/${id}`,
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

      setLedgerList((prev) => [
        ...prev,
        {
          name: input.trim(),
          code: nextLedgerCode,
        },
      ]);

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
        `${URL}/cemetery-ledger-category/ledgers/${selectedCategory._id}/save`,
        {
          ledgers: ledgerList.map((l) => l.name),
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

  /* ===============================
     TITLE CASE
  =============================== */
  const toTitleCase = (value) => {
    return value
      .split(" ")
      .map((word) => {
        if (word === word.toUpperCase() && word.length > 1) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  };

  return (
    <>
      <div className={`${isBusy ? "pointer-events-none opacity-60" : ""}`}>
        <FaArrowLeft
          size={18}
          title="Back"
          onClick={() => navigate("/admin/cemledger")}
          className="cursor-pointer mb-4"
        />

        <div className="p-2 mx-1 bg-white shadow-md rounded-[10px]">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-lg font-semibold text-lavender--600">
              Add Cemetery Ledgers
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
                    categories.map((c, index) => (
                      <div
                        key={c._id}
                        onClick={() => setSelectedCategory(c)}
                        className={`p-2 rounded mb-2 cursor-pointer ${selectedCategory?._id === c._id
                          ? "bg-lavender--100"
                          : "hover:bg-gray-100"
                          }`}
                      >
                        <span
                          className={`text-sm font-medium ${selectedCategory?._id === c._id
                            ? "text-lavender--600"
                            : "text-gray-700"
                            }`}
                        >
                          {index + 1}. {c.name}
                        </span>
                      </div>
                    ))
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

                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (input.trim() && !ledgerList.includes(input.trim())) {
                            setLedgerList([...ledgerList, input.trim()]);
                          }
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
      </div>
    </>
  );
};
