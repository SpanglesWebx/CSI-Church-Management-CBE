import React, { useEffect, useState } from 'react'
import { FaEye, FaPlus } from 'react-icons/fa';
import Modal from '../../Components/Expense/ExpenseFormModal';
import { FailedMessage, SuccessMessage } from '../../Components/ToastMessage';
import axios from 'axios';
import { URL } from "../../App";
import { HiDocumentCurrencyRupee } from "react-icons/hi2";
import Pagination from '../../Components/Helpers/Pagination';
import { jwtDecode } from "jwt-decode";

export const CemBanks = () => {

  const token = window.sessionStorage.getItem("token");
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isACtypeModalOpen, setIsACtypeModalOpen] = useState(false);
  const [accountTypes, setAccountTypes] = useState([]);
  const [accountTypeName, setAccountTypeName] = useState("");
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [isSavingAccountType, setIsSavingAccountType] = useState(false);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [micrCode, setMicrCode] = useState("");
  const [branchName, setBranchName] = useState("");
  const [branchPhone, setBranchPhone] = useState("");
  const [bankAddress, setBankAddress] = useState("");
  const [errors, setErrors] = useState({});
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [bankList, setBankList] = useState([]);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [openingDate, setOpeningDate] = useState("");
  const [openingAmount, setOpeningAmount] = useState("");
  const [isSavingOpeningBalance, setIsSavingOpeningBalance] = useState(false);
  const [obPage, setObPage] = useState(1);
  const [bankLedgers, setBankLedgers] = useState([]);
  const [selectedLedger, setSelectedLedger] = useState("");
  const [ledgerCategoryId, setLedgerCategoryId] = useState("");
  const [userRole, setUserRole] = useState("");

      useEffect(() => {
    if (!token) return;
  
    try {
      const decoded = jwtDecode(token);
      console.log("Decoded roles:", decoded.roles);
  
      // If multiple roles exist, pick the active/stored one
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

  /* =====================================================
     🔥 ONLY REQUIRED CHANGE (your instruction)
  ===================================================== */
  useEffect(() => {
    if (isModalOpen) {
      axios.get(`${URL}/ledger-category/bank-ledgers`, {
        headers: { Authorization: token },
      })
        .then(res => {
          setBankLedgers(res.data.ledgers);
          setLedgerCategoryId(res.data.categoryId);
        })
        .catch(err => {
          console.error("Error fetching cemetery bank ledgers:", err);
        });
    }
  }, [isModalOpen]);

  // reusable pagination
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");

  const OB_LIMIT = 5;

  useEffect(() => {
    if (isViewOpen) setObPage(1);
  }, [isViewOpen]);

  const openingBalances = selectedBank?.opening_balances || [];

  const sortedOpeningBalances = [...openingBalances].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const latestOpeningBalance = sortedOpeningBalances[0];

  const totalObPages = Math.ceil(sortedOpeningBalances.length / OB_LIMIT);
  const paginatedOpeningBalances = sortedOpeningBalances.slice(
    (obPage - 1) * OB_LIMIT,
    obPage * OB_LIMIT
  );

  /* ===============================
     FETCH BANKS
  =============================== */
  const fetchBanks = async () => {
    try {
      const res = await axios.get(`${URL}/cem-banks/list`, {
        headers: { Authorization: token },
        params: {
          page: CurrentPage,
          limit: rowsPerPage,
          search: searchTerm || undefined,
          status: statusFilter !== "All" ? statusFilter : undefined,
        },
      });

      setBankList(res.data.banks || []);
      setTotalPages(res.data.totalPages || 1);

      if (CurrentPage > res.data.totalPages) {
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Fetch banks error:", err);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, [CurrentPage, searchTerm, statusFilter, rowsPerPage]);

  /* ===============================
     ACCOUNT TYPES
  =============================== */
  useEffect(() => {
    if (isACtypeModalOpen || isModalOpen) {
      axios.get(`${URL}/account-types/list`, {
        headers: { Authorization: token },
      }).then(res => {
        setAccountTypes(res.data.data || []);
      });
    }
  }, [isACtypeModalOpen, isModalOpen]);

  /* ===============================
     TOAST
  =============================== */
  const showToast = (status, message) => {
    setResponse({ status: null, message: "" });
    setTimeout(() => setResponse({ status, message }), 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  };

  /* ===============================
     SAVE ACCOUNT TYPE
  =============================== */
  const saveAccountType = async () => {
    if (isSavingAccountType) return;

    if (!accountTypeName.trim()) {
      showToast("Failed", "Enter account type name");
      return;
    }

    try {
      setIsSavingAccountType(true);

      const res = await axios.post(
        `${URL}/account-types/add`,
        { name: accountTypeName },
        { headers: { Authorization: token } }
      );

      setAccountTypes(prev => [res.data.data, ...prev]);
      setAccountTypeName("");

      showToast("Success", "Account type added");
    } catch (err) {
      showToast(
        "Failed",
        err.response?.data?.message || "Account type add failed"
      );
    } finally {
      setIsSavingAccountType(false);
    }
  };

  /* ===============================
     VALIDATION
  =============================== */
  const validateBankForm = () => {
    const e = {};

    if (!selectedAccountType) e.selectedAccountType = "Please select account type";
    if (!bankName.trim()) e.bankName = "Please fill the bank name";
    if (!accountNumber.trim()) e.accountNumber = "Please fill the account number";
    if (!ifscCode.trim()) e.ifscCode = "Please fill the IFSC code";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const clearError = (field) => {
    setErrors(prev => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  /* ===============================
     SAVE BANK
  =============================== */
  const saveBank = async () => {
    if (isSavingBank) return;
    if (!validateBankForm()) return;

    try {
      setIsSavingBank(true);

      const payload = {
        account_type_id: selectedAccountType,
        ledger_code: selectedLedger,
        ledger_name: bankName,
        ledger_category_id: ledgerCategoryId,
        bank_name: bankName,
        account_number: accountNumber,
        ifsc_code: ifscCode,
        micr_code: micrCode,
        branch_name: branchName,
        branch_phone: branchPhone,
        bank_address: bankAddress,
      };

      await axios.post(`${URL}/cem-banks/add`, payload, {
        headers: { Authorization: token },
      });

      showToast("Success", "Bank added successfully");

      setIsModalOpen(false);
      resetBankForm();
      fetchBanks();

    } catch (err) {
      showToast(
        "Failed",
        err.response?.data?.message || "Bank add failed"
      );
    } finally {
      setIsSavingBank(false);
    }
  };

  const resetBankForm = () => {
    setSelectedAccountType("");
    setBankName("");
    setAccountNumber("");
    setIfscCode("");
    setMicrCode("");
    setBranchName("");
    setBranchPhone("");
    setBankAddress("");
    setErrors({});
  };

  /* ===============================
     SAVE OPENING BALANCE
  =============================== */
  const saveOpeningBalance = async () => {
    if (isSavingOpeningBalance) return;

    if (!openingDate || !openingAmount) {
      showToast("Failed", "Please fill date and amount");
      return;
    }

    try {
      setIsSavingOpeningBalance(true);

      await axios.post(
        `${URL}/cem-banks/opening-balance/add`,
        {
          bank_id: selectedBank._id,
          date: openingDate,
          amount: Number(openingAmount),
        },
        { headers: { Authorization: token } }
      );

      showToast("Success", "Opening balance added");
      fetchBanks();

      setOpeningDate("");
      setOpeningAmount("");
      setIsBalanceModalOpen(false);
    } catch (err) {
      showToast(
        "Failed",
        err.response?.data?.message || "Failed to add opening balance"
      );
    } finally {
      setIsSavingOpeningBalance(false);
    }
  };

  /* ===============================
     UI (IDENTICAL)
  =============================== */
  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-2">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                <svg className="w-3 h-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input
                type="search"
                id="shop-search"
                className="block py-1 text-sm text-gray-900 rounded w-64 ps-8 bg-gray-50"
                placeholder="Search by Bank Name or ID"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
            <label className="text-l font-medium text-gray-600 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          {["admin", "churchofficeworker"].includes(userRole) && (
          <button onClick={() => { setIsModalOpen(true); }} className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg">
            <FaPlus /> Bank
          </button>
          )}
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Bank ID</th>
                <th className="p-2 text-center">Bank Name</th>
                <th className="p-2 text-center">Account Type</th>
                <th className="p-2 text-center">Current Balance</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {bankList.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center p-3">
                    No records found
                  </td>
                </tr>
              )}

              {bankList.map((item, index) => (
                <tr key={item._id} className="border-b text-center">
                  <td className="p-2">
                    {(CurrentPage - 1) * rowsPerPage + index + 1}
                  </td>
                  <td>{item.ledger_code}</td>
                  <td>{item.bank_name}</td>
                  <td>{item.account_type_id?.name || "-"}</td>
                  <td>{item.current_balance}</td>
                  <td>
                    <span
                      className={
                        item.status === "Active"
                          ? "text-green-600 font-semibold"
                          : "text-red-600 font-semibold"
                      }
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-3">
                      {["admin", "churchofficeworker"].includes(userRole) && (
                      <HiDocumentCurrencyRupee
                        size={20}
                        className="text-lavender--600 cursor-pointer"
                        onClick={() => {
                          if (item.opening_balance > 0) {
                            showToast("Failed", "Opening balance already added for this bank");
                            return;
                          }
                          setSelectedBank(item);
                          setIsBalanceModalOpen(true);
                        }}
                      />
                      )}
                      <FaEye
                        title="View"
                        size={18}
                        className="text-lavender--600 cursor-pointer"
                        onClick={() => {
                          setSelectedBank(item);
                          setIsViewOpen(true);
                        }}
                      />
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>

        <Pagination
          currentPage={CurrentPage}
          totalPages={TotalPages}
          rowsPerPage={rowsPerPage}
          rowsInput={rowsInput}
          jumpInput={jumpInput}
          setCurrentPage={setCurrentPage}
          setRowsPerPage={setRowsPerPage}
          setRowsInput={setRowsInput}
          setJumpInput={setJumpInput}
          defaultRows={25}
        />

        <Modal isOpen={isModalOpen} onClose={() => { resetBankForm(); setIsModalOpen(false); }} title="Add Bank">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Ledger <span className='text-red-500'>*</span>
              </label>

              <select
                value={selectedLedger}
                onChange={(e) => {
                  const ledger = bankLedgers.find(l => l.code === e.target.value);

                  setSelectedLedger(e.target.value);
                  setBankName(ledger.name); // auto fill
                  clearError("bankName");
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">Select Bank Ledger</option>
                {bankLedgers.map(l => (
                  <option key={l.code} value={l.code}>
                    {l.name} ({l.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Account Type <span className='text-red-500 text-[16px]'>*</span></label>
                <button
                  type="button"
                  onClick={() => setIsACtypeModalOpen(true)}
                  className="block mb-1 font-semibold text-sm text-lavender--600"
                >
                  + Account Types
                </button>
              </div>
              <select
                value={selectedAccountType}
                onChange={(e) => {
                  setSelectedAccountType(e.target.value);
                  clearError("selectedAccountType");
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">Select Account Type</option>
                {accountTypes.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
              {errors.selectedAccountType && (
                <p className="text-red-500 text-xs mt-1">{errors.selectedAccountType}</p>
              )}

            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Account Number <span className='text-red-500 text-[16px]'>*</span></label>
              <input
                type="text"
                placeholder='Enter Account Number'
                value={accountNumber}
                onChange={(e) => {
                  setAccountNumber(e.target.value);
                  clearError("accountNumber");
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
              {errors.accountNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">IFSC Code <span className='text-red-500 text-[16px]'>*</span></label>
              <input
                type="text"
                placeholder='Enter IFSC Code of the Bank'
                value={ifscCode}
                onChange={(e) => {
                  setIfscCode(e.target.value);
                  clearError("ifscCode");
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
              {errors.ifscCode && (
                <p className="text-red-500 text-xs mt-1">{errors.ifscCode}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">MICR Code</label>
              <input
                type="text"
                placeholder='Enter MICR Code of the Bank'
                value={micrCode}
                onChange={(e) => setMicrCode(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Branch Code / Name</label>
              <input
                type="text"
                placeholder='Enter Branch code with Branch Name'
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Branch Phone</label>
              <input
                type="text"
                placeholder='Enter Branch Phone Number'
                value={branchPhone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setBranchPhone(val);
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bank Address
              </label>

              <textarea
                rows={6}
                placeholder="Enter Bank Address"
                value={bankAddress}
                onChange={(e) => setBankAddress(e.target.value)}
                className="block w-full mt-1 border border-gray-300 rounded-md shadow-sm sm:text-sm resize-none overflow-y-auto"
              />
            </div>

          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={saveBank}
              disabled={isSavingBank}
              className={`px-4 py-2 rounded-md text-white
              ${isSavingBank
                  ? "bg-lavender--600/60 cursor-not-allowed"
                  : "bg-lavender--600 hover:bg-lavender--700"}`}
            >
              {isSavingBank ? "Saving..." : "Add Bank"}
            </button>

          </div>
        </Modal>

        <Modal isOpen={isACtypeModalOpen} onClose={() => setIsACtypeModalOpen(false)} title="Add New A/C Type">
          <div className="flex items-end gap-4 mt-3">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700">
                Account Type
              </label>
              <input
                type="text"
                placeholder="Enter Account Type"
                value={accountTypeName}
                onChange={(e) => setAccountTypeName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isSavingAccountType) {
                    e.preventDefault();
                    saveAccountType();
                  }
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            <button
              type="button"
              onClick={saveAccountType}
              disabled={isSavingAccountType}
              className={`px-2 py-2 rounded-md whitespace-nowrap flex items-center justify-center
              ${isSavingAccountType
                  ? "bg-lavender--600/60 cursor-not-allowed"
                  : "bg-lavender--600 hover:bg-lavender--700"}
                  text-white`}
            >
              {isSavingAccountType ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <FaPlus className="text-white" size={18} />
              )}
            </button>

          </div>
          <h5 className='text-lavender--600'>Account Types</h5>
          <div className="flex flex-wrap gap-2 mt-2">
            {accountTypes.map((item) => (
              <span
                key={item._id}
                className="px-3 py-1 text-sm rounded-full bg-lavender--600 text-white"
              >
                {item.name}
              </span>
            ))}
          </div>

        </Modal>

        <Modal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          title="Bank Details"
        >
          {selectedBank && (
            <div className="flex flex-col pt-5 ps-5 w-full max-w-4xl space-y-5 max-h-[650px] overflow-y-auto">

              {/* =======================
          BANK BASIC DETAILS
      ======================= */}
              {[
                { label: "Account Code", value: selectedBank.account_code },
                { label: "Account Type", value: selectedBank.account_type_id?.name || "-" },
                { label: "Bank Name", value: selectedBank.bank_name },
                { label: "Account Number", value: selectedBank.account_number },
                { label: "IFSC Code", value: selectedBank.ifsc_code },
                { label: "MICR Code", value: selectedBank.micr_code || "-" },
                { label: "Branch Name", value: selectedBank.branch_name || "-" },
                { label: "Branch Phone", value: selectedBank.branch_phone || "-" },
                { label: "Bank Address", value: selectedBank.bank_address || "-" },
                {
                  label: "Status",
                  value: (
                    <span
                      className={
                        selectedBank.status === "Active"
                          ? "text-green-600 font-semibold"
                          : "text-red-600 font-semibold"
                      }
                    >
                      {selectedBank.status}
                    </span>
                  ),
                },
              ].map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 pb-2">
                  <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700">
                    {item.label}
                  </div>
                  <div className="col-span-12 sm:col-span-8 text-base text-gray-800">
                    {item.value}
                  </div>
                </div>
              ))}

              {/* =======================
          LATEST OPENING BALANCE
      ======================= */}
              {latestOpeningBalance && (
                <div className="bg-gray-50 border rounded-md p-4">
                  <div className="text-lg font-semibold text-gray-700 mb-1">
                    Latest Opening Balance
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {new Date(latestOpeningBalance.date).toLocaleDateString("en-GB")}
                    </span>
                    <span className="text-xl font-bold text-green-700">
                      ₹ {latestOpeningBalance.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* =======================
          OPENING BALANCE HISTORY
      ======================= */}
              {sortedOpeningBalances.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">
                    Opening Balance History
                  </h4>

                  <div className="overflow-x-auto border rounded-md">
                    <table className="w-full text-sm text-gray-700">
                      <thead className="bg-gray-100 border-b">
                        <tr>
                          <th className="p-2 text-center">Sl No</th>
                          <th className="p-2 text-center">Date</th>
                          <th className="p-2 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedOpeningBalances.map((ob, index) => (
                          <tr key={index} className="border-b last:border-b-0">
                            <td className="p-2 text-center">
                              {(obPage - 1) * OB_LIMIT + index + 1}
                            </td>
                            <td className="p-2 text-center">
                              {new Date(ob.date).toLocaleDateString("en-GB")}
                            </td>
                            <td className="p-2 text-right font-medium">
                              ₹ {ob.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* =======================
              PAGINATION (limit = 5)
          ======================= */}
                  {totalObPages > 1 && (
                    <div className="flex justify-center items-center gap-3 mt-3">
                      <button
                        disabled={obPage === 1}
                        onClick={() => setObPage(obPage - 1)}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                      >
                        Prev
                      </button>

                      <span className="px-3 py-1 bg-lavender--600 text-white rounded">
                        {obPage}
                      </span>

                      <button
                        disabled={obPage === totalObPages}
                        onClick={() => setObPage(obPage + 1)}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </Modal>


        <Modal isOpen={isBalanceModalOpen} onClose={() => { setIsBalanceModalOpen(false); }} title="Add Opening Balance">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <div className="text-base">
              <span className="font-semibold text-gray-700">
                Bank Name:
              </span>{" "}
              <span className="text-gray-900">
                {selectedBank?.bank_name || "-"}
              </span>
            </div>

            <div className="text-base sm:text-right">
              <span className="font-semibold text-gray-700">
                A/C No:
              </span>{" "}
              <span className="text-gray-900">
                {selectedBank?.account_number || "-"}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Opening Balance Date</label>
              <input
                type="date"
                value={openingDate}
                onChange={(e) => setOpeningDate(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Opening Balance</label>
              <input
                type="text"
                placeholder='Enter the amount'
                value={openingAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  // allow numbers + only ONE decimal point
                  if (/^\d*\.?\d*$/.test(value)) {
                    setOpeningAmount(value);
                  }
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={saveOpeningBalance}
                disabled={isSavingOpeningBalance}
                className={`px-4 py-2 rounded-md text-white flex items-center justify-center
                ${isSavingOpeningBalance
                    ? "bg-lavender--600/60 cursor-not-allowed"
                    : "bg-lavender--600 hover:bg-lavender--700"}`}
              >
                {isSavingOpeningBalance ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Add Balance"
                )}
              </button>
            </div>


          </div>
        </Modal>



      </div>

      {Response.status &&
        (Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : (
          <FailedMessage Message={Response.message} />
        ))}
    </>
  )
}
