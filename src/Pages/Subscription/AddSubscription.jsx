import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { URL } from "../../App";
import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";

export const AddSubscription = () => {
  const token = window.sessionStorage.getItem("token");
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [active, setActive] = useState("Morning");
  const options = ["Morning", "Evening", "Office Payment"];
  const [rows, setRows] = useState([
    { member_id: "", member_name: "", amount: "", payment_method: "Cash", }
  ]);
  const [rowErrors, setRowErrors] = useState({});
  const [activeRow, setActiveRow] = useState(null);
  const memberIdRefs = useRef([]);
  const amountRefs = useRef([]);
  const dropdownItemRefs = useRef([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const [memberId, setMemberId] = useState("");
  const [memberName, setMemberName] = useState("");
  const [selectedMember, setSelectedMember] = useState(false);

  const [idDropdown, setIdDropdown] = useState([]);
  const [nameDropdown, setNameDropdown] = useState([]);
  const debounceRef = useRef(null);
  const latestSearchRef = useRef("");

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [amount, setAmount] = useState("");

  const [response, setResponse] = useState({
    status: null,
    message: "",
  });

  const [idSearch, setIdSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [dropdown, setDropdown] = useState([]);

  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedSearchById = useRef(
    debounce(async (val) => {
      if (!val) {
        setDropdown([]);
        return;
      }

      latestSearchRef.current = val; // 🔥 track latest query

      const res = await axios.get(`${URL}/member-search/by-id`, {
        headers: { Authorization: token },
        params: { id: val },
      });

      // 🔐 Ignore outdated responses
      if (latestSearchRef.current === val) {
        setDropdown(res.data || []);
      }
    }, 300)
  ).current;


  const debouncedSearchByName = useRef(
    debounce(async (val) => {
      if (!val) {
        setDropdown([]);
        return;
      }

      latestSearchRef.current = val;

      const res = await axios.get(`${URL}/member-search`, {
        headers: { Authorization: token },
        params: { name: val },
      });

      if (latestSearchRef.current === val) {
        setDropdown(res.data || []);
      }
    }, 300)
  ).current;


  // ✅ Validate before saving
  const validate = () => {
    if (!memberId || !memberName) {
      showMessage("Failed", "Select a member first");
      return false;
    }
    if (!date) {
      showMessage("Failed", "Select a date");
      return false;
    }
    if (!amount || Number(amount) <= 0) {
      showMessage("Failed", "Enter a valid amount");
      return false;
    }
    return true;
  };
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [dropdown]);
  const selectMember = (member, index) => {
    const data = [...rows];
    data[index].member_id = member.member_id;
    data[index].member_name = member.member_name;
    setRows(data);

    setIdSearch(member.member_id);
    setNameSearch(member.member_name);
    setDropdown([]);
    setHighlightedIndex(-1);
    setActiveRow(index);

    // 🔥 focus amount
    setTimeout(() => {
      amountRefs.current[index]?.focus();
    }, 0);
  };

  const handleSearchKeyDown = (e, index) => {
    if (!dropdown.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < dropdown.length - 1 ? prev + 1 : 0
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : dropdown.length - 1
      );
    }

    if (e.key === "Enter") {
      if (highlightedIndex < 0) return;
      e.preventDefault();
      selectMember(dropdown[highlightedIndex], index);
    }

    if (e.key === "Escape") {
      setDropdown([]);
      setHighlightedIndex(-1);
    }
  };


  const showMessage = (type, msg) => {
    setResponse({ status: type, message: msg });
    setTimeout(() => setResponse({ status: null, message: "" }), 3500);
  };
  const handleAmountKeyDown = (e, index, row) => {
    if (e.key !== "Enter") return;

    e.preventDefault();

    // only last row + valid data
    if (index !== rows.length - 1) return;
    if (!row.member_id || !row.amount) return;

    setRows((prev) => {
      const next = [...prev, { member_id: "", member_name: "", amount: "", payment_method: "Cash", }];

      // 🔥 focus AFTER render
      setTimeout(() => {
        const nextIndex = next.length - 1;
        memberIdRefs.current[nextIndex]?.focus();
        setActiveRow(nextIndex);
      }, 0);

      return next;
    });
  };

  const cashTotal = rows.reduce(
    (sum, r) =>
      r.payment_method === "Cash" ? sum + Number(r.amount || 0) : sum,
    0
  );

  const chequeTotal = rows.reduce(
    (sum, r) =>
      r.payment_method === "Cheque" ? sum + Number(r.amount || 0) : sum,
    0
  );

  const grandTotal = cashTotal + chequeTotal;


const checkDuplicateMembers = (rowsData) => {
  const errors = {};
  const seen = {};

  rowsData.forEach((row, index) => {
    if (!row.member_id) return;

    if (seen[row.member_id] !== undefined) {
      const firstIndex = seen[row.member_id];

      errors[index] = `${row.member_name || row.member_id} has allocated in row ${firstIndex + 1}`;
    } else {
      seen[row.member_id] = index;
    }
  });

  setRowErrors(errors);
  return Object.keys(errors).length === 0;
};

  // ✅ Submit amount
  const handleSave = async () => {
    if (isSaving) return; // 🛑 HARD GUARD (same as BankList)

    const validRows = rows.filter(
      r => r.member_id && r.member_name && Number(r.amount) > 0
    );

    if (!validRows.length) {
      showMessage("Failed", "Add at least one valid entry");
      return;
    }
    // 🔴 DUPLICATE MEMBER VALIDATION
    if (!checkDuplicateMembers(rows)) {
      showMessage("Failed", "Duplicate members found");
      return;
    }


    try {
      setIsSaving(true); // 🔒 LOCK UI

      await axios.post(
        `${URL}/subscriptions/amount`,
        {
          date,
          payment_session: active,
          receipts: validRows.map(r => ({
            ...r,
            payment_method: r.payment_method || "Cash",
          })),
          cash_total: cashTotal,
          cheque_total: chequeTotal,
          total_amount: grandTotal,
        },
        { headers: { Authorization: token } }
      );


      showMessage("Success", "Subscription amount saved");

      // reset UI
      setRows([{ member_id: "", member_name: "", amount: "", payment_method: "Cash", }]);
      setActiveRow(null);
      setIdSearch("");
      setNameSearch("");
      setDropdown([]);
      setDate(new Date().toISOString().split("T")[0]);

    } catch (err) {
      // console.error(err);
      // showMessage(
      //   "Failed",
      //   err.response?.data?.message || "Failed to save subscription"
      // );
      const errorType = err.response?.data?.type;

      if (errorType === "VALIDATION") {
        // ✅ expected user mistake
        showMessage(
          "Failed",
          err.response?.data?.message || "Validation failed"
        );
      } else {
        // 🔴 real unexpected error
        console.error("Subscription save error:", err);
        showMessage("Failed", "Something went wrong");
      }
    } finally {
      setIsSaving(false); // 🔓 UNLOCK UI (ALWAYS)
    }
  };
  useEffect(() => {
    if (highlightedIndex < 0) return;

    const el = dropdownItemRefs.current[highlightedIndex];
    if (el) {
      el.scrollIntoView({
        block: "nearest", // 🔥 THIS is the key
        behavior: "smooth"
      });
    }
  }, [highlightedIndex]);



  return (
    <>
      <div className={`relative ${isSaving ? "pointer-events-none opacity-70" : ""}`}>
        <FaArrowLeft
          size={18}
          onClick={() => navigate(-1)}
          className="cursor-pointer"
        />
        <h1 className="text-xl font-semibold text-lavender--600 mb-3">
          Add Subscription Receipt
        </h1>
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          {response.status &&
            (response.status === "Success" ? (
              <SuccessMessage Message={response.message} />
            ) : (
              <FailedMessage Message={response.message} />
            ))}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2 relative">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div className="flex justify-center mt-6 mb-6">
              <div className="relative flex bg-gray-200 rounded-full p-1 text-sm font-medium w-[28rem]">
                {/* Sliding active pill */}
                <div
                  className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
                  style={{
                    width: "calc(33.333% - 0.25rem)",
                    transform:
                      active === "Morning"
                        ? "translateX(0%)"
                        : active === "Evening"
                          ? "translateX(100%)"
                          : "translateX(200%)",
                  }}
                />

                {options.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setActive(label)}
                    className={`relative flex-1 py-1 text-center rounded-full transition-colors duration-200
          ${active === label
                        ? "text-white"
                        : "text-gray-700 hover:text-gray-900"
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>





          {rows.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-2 relative"
            >

              {/* Member ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Member ID
                </label>
                <input
                  ref={(el) => (memberIdRefs.current[index] = el)}
                  type="text"
                  placeholder="Search Member ID"
                  value={activeRow === index ? idSearch : row.member_id}
                  onFocus={() => {
                    setActiveRow(index);
                    setIdSearch(row.member_id || "");
                    setNameSearch("");
                    setDropdown([]); // 🔧 close stale dropdown
                  }}
                  onChange={(e) => {
                    const val = e.target.value;

                    setActiveRow(index);
                    setIdSearch(val);
                    setNameSearch("");

                    if (!val) {
                      setDropdown([]); // 🔧 EXACT OLD BEHAVIOUR
                      return;
                    }

                    debouncedSearchById(val);
                  }}
                  onKeyDown={(e) => handleSearchKeyDown(e, index)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
                {rowErrors[index] && (
                  <p className="text-red-500 text-xs mt-1">
                    {rowErrors[index]}
                  </p>
                )}

              </div>

              {/* Member Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Member Name
                </label>
                <input
                  type="text"
                  placeholder="Search Member Name"
                  value={activeRow === index ? nameSearch : row.member_name}
                  onFocus={() => {
                    setActiveRow(index);
                    setNameSearch(row.member_name || "");
                    setIdSearch("");
                    setDropdown([]); // 🔧 close stale dropdown
                  }}
                  onChange={(e) => {
                    const val = e.target.value;

                    setActiveRow(index);
                    setNameSearch(val);
                    setIdSearch("");

                    if (!val) {
                      setDropdown([]); // 🔧 EXACT OLD BEHAVIOUR
                      return;
                    }

                    debouncedSearchByName(val);
                  }}
                  onKeyDown={(e) => handleSearchKeyDown(e, index)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>

              {/* Cash / Cheque Toggle (same style as session toggle) */}
              <div className="">
                <label className="block text-sm font-medium text-gray-700">
                  Payment Method
                </label>
                <div className="relative flex bg-gray-200 rounded-full p-1 text-xs font-medium w-full mt-2">
                  <div
                    className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
                    style={{
                      width: "calc(50% - 0.25rem)",
                      transform:
                        row.payment_method === "Cash"
                          ? "translateX(0%)"
                          : "translateX(100%)",
                    }}
                  />

                  {["Cash", "Cheque"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        const data = [...rows];
                        data[index].payment_method = type;
                        setRows(data);
                      }}
                      className={`relative flex-1 py-1 text-center rounded-full transition-colors duration-200
          ${row.payment_method === type
                          ? "text-white"
                          : "text-gray-700 hover:text-gray-900"
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>


              {/* Amount + buttons */}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Total Amount
                  </label>
                  <input
                    ref={(el) => (amountRefs.current[index] = el)}
                    type="text"
                    value={row.amount}
                    onChange={(e) => {
                      const data = [...rows];
                      data[index].amount = e.target.value.replace(/[^0-9]/g, "");
                      setRows(data);
                    }}
                    onKeyDown={(e) => handleAmountKeyDown(e, index, row)}
                    placeholder="Enter Amount"
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

                {index === rows.length - 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setRows([...rows, { member_id: "", member_name: "", amount: "", payment_method: "Cash", }])
                    }
                    disabled={!row.member_id || !row.amount}
                    className={`px-3 py-2 rounded text-white
            ${row.member_id && row.amount
                        ? "bg-lavender--600"
                        : "bg-gray-300 cursor-not-allowed"}
          `}
                  >
                    <FaPlus className='text-white' size={20} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRows(rows.filter((_, i) => i !== index))}
                    className="px-3 py-2 bg-red-500 text-white rounded"
                  >
                    <MdDelete className='text-white' size={20} />
                  </button>
                )}
              </div>

              {/* 🔥 SAME DROPDOWN — SAME RULES */}
              {dropdown.length > 0 && activeRow === index && (
                <ul className="absolute mt-[75px] w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto">
                  {dropdown.map((m, i) => (
                    <li
                      key={m.member_id}
                      ref={(el) => (dropdownItemRefs.current[i] = el)}
                      className={`flex px-3 py-2 text-sm cursor-pointer
                    ${i === highlightedIndex
                          ? "bg-indigo-100 text-black"
                          : "hover:bg-indigo-50"}
                      `}
                      onMouseEnter={() => setHighlightedIndex(i)}
                      onClick={() => {
                        const data = [...rows];
                        data[index].member_id = m.member_id;
                        data[index].member_name = m.member_name;
                        setRows(data);

                        // 🔥 KEEP inputs controlled correctly
                        setIdSearch(m.member_id);
                        setNameSearch(m.member_name);

                        setDropdown([]);
                        setActiveRow(index); // ❗ DO NOT set null here

                        // 🔥 focus amount AFTER render
                        setTimeout(() => {
                          amountRefs.current[index]?.focus();
                        }, 0);
                      }}


                    >
                      <span className="w-1/2 font-medium">{m.member_id}</span>
                      <span className="w-1/2">{m.member_name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* Cash / Cheque / Total Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border rounded-lg bg-blue-50 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cash
              </label>
              <input
                readOnly
                type="text"
                value={cashTotal}
                placeholder="Cash Total"
                className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cheque
              </label>
              <input
                readOnly
                type="text"
                value={chequeTotal}
                placeholder="Cheque Total"
                className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Grand Total
              </label>
              <input
                readOnly
                type="text"
                value={grandTotal}
                placeholder="Total Amount"
                className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm font-semibold mt-1"
              />
            </div>
          </div>



          {/* Save Button */}
          <div className="flex justify-end mt-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`px-8 py-2 rounded font-semibold text-white flex items-center justify-center gap-2
              ${isSaving
                  ? "bg-lavender--600/60 cursor-not-allowed"
                  : "bg-lavender--600 hover:bg-lavender--700"}
                `}
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>

        </div>
      </div>

    </>
  );
};
