import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { URL } from "../../App";
import { useLocation, useNavigate } from "react-router-dom";
import { GrPowerReset } from "react-icons/gr";
import { FaEdit } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";
import { FaArrowLeft } from "react-icons/fa6";

const monthOrder = [
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
  "january",
  "february",
  "march",
];

const monthLabel = (month, year) => {
  const shortYear = String(year).slice(2);
  const shortMonth = month.slice(0, 3);
  return `${shortMonth.charAt(0).toUpperCase() + shortMonth.slice(1)}-${shortYear}`;
};

const getMonthYear = (month, fyStartYear) =>
  ["january", "february", "march"].includes(month) ? fyStartYear + 1 : fyStartYear;

export const SubscriberDetails = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const token = window.sessionStorage.getItem("token");
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const member_id = params.get("member_id");

  const [response, setResponse] = useState({ status: null, message: "" });
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [filter, setFilter] = useState("current");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [harvestAllowed, setHarvestAllowed] = useState(false);
  const [harvestUnpaid, setHarvestUnpaid] = useState(0);

  const [editableMonths, setEditableMonths] = useState({});
  // const [monthDuplicate, setMonthDuplicate] = useState({});

  const [baseDate] = useState(new Date().toISOString().split("T")[0]);


  const months = monthOrder.slice();


  //For WebX
  const categories = [
    "total",

    "monthlySubscriptionOffering",
    "ims",
    "nms",
    "fmpb",
    "iem",
    "vishwavani",
    "bym",
    "dbm",
    "bibleSociety",
    "educationalAssistance",
    "helpThePoor",
    "medicalAssistance",
    "decimalPart",
    "cmm",
    "cgmm",
    "buildingFund",
    "ymm",
    "missionarySponsorship",
    "womensMinistry",
    "harvestAuction",
    "payment_method",
    "cheque_number",
    "cheque_date",     // ⭐ NEW
    "bank_name",
  ];

  // const categories = [
  //   "total",
  //   "payment_method",
  //   "cheque_number",
  //   "monthlySubscriptionOffering",
  //   "buildingFund",
  //   "missionarySponsorship",
  //   "decimalPart",
  //   "ims",
  //   "fmpb",
  //   "nms",
  //   "iem",
  //   "vishwavani",
  //   "bym",
  //   "dbm",
  //   "cgmm",
  //   "cmm",
  //   "ymm",
  //   "bibleSociety",
  //   "womensMinistry",
  //   "educationalAssistance",
  //   "helpThePoor",
  //   "medicalAssistance",
  //   "harvestAuction",
  // ];

  const labels = {
    payment_method: "Payment Method",
    cheque_number: "Cheque Number",
    cheque_date: "Cheque Date",   // ⭐ NEW
    bank_name: "Bank Name",
    monthlySubscriptionOffering: "Monthly Subscription Offering",
    buildingFund: "Building Fund",
    missionarySponsorship: "Missionary Sponsorship",
    decimalPart: "Tithe",
    ims: "IMS",
    fmpb: "FMPB",
    nms: "NMS",
    iem: "IEM",
    vishwavani: "VISHWAVANI",
    bym: "BYM",
    dbm: "DBM",
    cgmm: "CGMM",
    cmm: "CMM",
    ymm: "YMM",
    bibleSociety: "Bible Society",
    womensMinistry: "Women's Fund",
    educationalAssistance: "Educational Help",
    helpThePoor: "Poor Fund",
    medicalAssistance: "Medical Help",
    harvestAuction: "Harvest Auction",
    total: "Total",
  };

  const SPLIT_FIELDS = categories.filter((c) => !["payment_method", "cheque_number", "cheque_date",
    "bank_name", "total"].includes(c));

  useEffect(() => {
    if (!member_id) return;
    axios
      .get(`${URL}/subscriptions/member`, { params: { member_id }, headers: { Authorization: token } })
      .then((res) => {
        setSubscriptions(res.data || []);
        setFilteredSubscriptions(res.data || []);
      })
      .catch((err) => console.error("fetchSubscriptions:", err));
  }, [member_id, token]);


  useEffect(() => {
    const fetchHarvest = async () => {
      if (!member_id) return;
      try {
        const res = await axios.get(`${URL}/harvest-auctions/report`, {
          params: { memberId: member_id },
          headers: { Authorization: token },
        });

        const unpaid = Number(res.data?.overallUnpaid || 0);

        setHarvestUnpaid(unpaid);
        setHarvestAllowed(unpaid > 0);
      } catch (err) {
        console.error("fetchHarvest error:", err);
        setHarvestAllowed(false);
        setHarvestUnpaid(0);
      }
    };

    fetchHarvest();
  }, [member_id, token]);


  useEffect(() => {
    if (!subscriptions.length) return;
    let filtered = [...subscriptions];
    const today = new Date();
    const fyStartYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;

    if (filter === "current") filtered = subscriptions.filter((s) => s.year === fyStartYear);
    else if (filter === "previous") filtered = subscriptions.filter((s) => s.year === fyStartYear - 1);
    else if (filter === "past3")
      filtered = subscriptions.filter((s) => s.year === fyStartYear || s.year === fyStartYear - 1 || s.year === fyStartYear - 2);

    if (fromDate && toDate) {
      filtered = filtered.map((yearData) => {
        const newMonths = {};
        months.forEach((month) => {
          const data = yearData.months[month];
          if (data?.date) {
            const d = new Date(data.date);
            if (d >= new Date(fromDate) && d <= new Date(toDate)) newMonths[month] = data;
          }
        });
        return { ...yearData, months: newMonths };
      });
    }

    setFilteredSubscriptions(filtered);
  }, [filter, fromDate, toDate, subscriptions]);

  const latestPendingYear = useMemo(() => {
    const rev = [...subscriptions].reverse();
    return rev.find((s) => Number(s.remaining_amount || 0) > 0) || null;
  }, [subscriptions]);

  const remainingAmount = latestPendingYear?.remaining_amount || 0;
  const activeFyStartYear = latestPendingYear?.year || null;

  // financial months for chips
  const financialMonths = activeFyStartYear
    ? monthOrder.map((m) => {
      const labelYear = ["january", "february", "march"].includes(m) ? activeFyStartYear + 1 : activeFyStartYear;
      return { key: `${m}-${labelYear}`, month: m, year: labelYear, label: monthLabel(m, labelYear) };
    })
    : [];

  // useEffect(() => {
  //   if (!latestPendingYear || !activeFyStartYear) return;

  //   const dupMap = {};
  //   months.forEach((m) => {
  //     const data = latestPendingYear.months?.[m] || {};
  //     if (Number(data.total || 0) > 0) {
  //       const labelYear = ["january", "february", "march"].includes(m) ? activeFyStartYear + 1 : activeFyStartYear;
  //       const key = `${m}-${labelYear}`;
  //       dupMap[key] = true;
  //     }
  //   });
  //   setMonthDuplicate(dupMap);

  //   if (Object.keys(dupMap).length === 0 && Number(remainingAmount) > 0 && Object.keys(editableMonths).length === 0) {
  //     const today = new Date(baseDate);
  //     const jsMonth = today.getMonth(); // 0..11
  //     const map = [
  //       ["january", activeFyStartYear + 1],
  //       ["february", activeFyStartYear + 1],
  //       ["march", activeFyStartYear + 1],
  //       ["april", activeFyStartYear],
  //       ["may", activeFyStartYear],
  //       ["june", activeFyStartYear],
  //       ["july", activeFyStartYear],
  //       ["august", activeFyStartYear],
  //       ["september", activeFyStartYear],
  //       ["october", activeFyStartYear],
  //       ["november", activeFyStartYear],
  //       ["december", activeFyStartYear],
  //     ];
  //     const [monthName, year] = map[jsMonth] || ["april", activeFyStartYear];
  //     const key = `${monthName}-${year}`;
  //     const splitInit = {};
  //     SPLIT_FIELDS.forEach((f) => (splitInit[f] = ""));
  //     setEditableMonths({
  //       [key]: { month: monthName, year, payment_method: "Cash", cheque_number: "", splits: splitInit },
  //     });
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [latestPendingYear, activeFyStartYear]);


  //clear this after adding subscription for all members from spangles
  // useEffect(() => {
  //   if (!latestPendingYear || !activeFyStartYear) return;

  //   const dupMap = {};
  //   months.forEach((m) => {
  //     const data = latestPendingYear.months?.[m] || {};
  //     if (Number(data.total || 0) > 0) {
  //       const labelYear = ["january", "february", "march"].includes(m)
  //         ? activeFyStartYear + 1
  //         : activeFyStartYear;
  //       const key = `${m}-${labelYear}`;
  //       dupMap[key] = true;
  //     }
  //   });

  //   setMonthDuplicate(dupMap);
  // }, [latestPendingYear, activeFyStartYear]);

  //clear this after adding subscription for all members from spangles


  // toggle month chip => add/remove editable month
  // const toggleMonth = (monthObj) => {
  //   const key = monthObj.key;
  //   if (monthDuplicate[key]) {
  //     setResponse({ status: "Failed", message: `${monthObj.label} already has a subscription entry` });
  //     setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  //     return;
  //   }
  //   if (editableMonths[key]) {
  //     const copy = { ...editableMonths };
  //     delete copy[key];
  //     setEditableMonths(copy);
  //     return;
  //   }
  //   const splitInit = {};
  //   SPLIT_FIELDS.forEach((f) => (splitInit[f] = ""));
  //   setEditableMonths((prev) => ({ ...prev, [key]: { month: monthObj.month, year: monthObj.year, payment_method: "Cash", cheque_number: "", splits: splitInit } }));
  // };



  //clear this after adding subscription for all members from spangles
  const toggleMonth = (monthObj) => {
    const key = monthObj.key;

    

    // if (monthDuplicate[key]) {
    //   setResponse({
    //     status: "Failed",
    //     message: `${monthObj.label} already has a subscription entry`,
    //   });
    //   setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    //   return;
    // }

    if (editableMonths[key]) {
      const copy = { ...editableMonths };
      delete copy[key];
      setEditableMonths(copy);
      return;
    }

    const splitInit = {};
    SPLIT_FIELDS.forEach((f) => (splitInit[f] = ""));

    setEditableMonths((prev) => ({
      ...prev,
      [key]: {
        month: monthObj.month,
        year: monthObj.year,
        payment_method: "Cash",
        cheque_number: "",
        cheque_date: "",     // ⭐ NEW
        bank_name: "",
        splits: splitInit,
      },
    }));
  };


  const updateEditableMonthSplit = (key, splitKey, value) => {
    const cleaned = value === "" ? "" : value.toString().replace(/[^0-9.]/g, "");
    setEditableMonths((prev) => ({ ...prev, [key]: { ...prev[key], splits: { ...(prev[key].splits || {}), [splitKey]: cleaned } } }));
  };

  const updateEditableMonthField = (key, field, value) => {
    setEditableMonths((prev) => {
      const current = prev[key];

      // If payment method is switched to CASH → clear cheque number
      if (field === "payment_method" && value === "Cash") {
        return {
          ...prev,
          [key]: {
            ...current,
            payment_method: "Cash",
            cheque_number: "", // ⭐ auto clear
            cheque_date: "",
            bank_name: "",
          },
        };
      }

      return {
        ...prev,
        [key]: {
          ...current,
          [field]: value,
        },
      };
    });
  };


  const perRowTotal = (key) => {
    const m = editableMonths[key];
    if (!m) return 0;
    return SPLIT_FIELDS.reduce((s, f) => s + Number(m.splits?.[f] || 0), 0);
  };

  const totalEntered = Object.keys(editableMonths).reduce((sum, key) => sum + perRowTotal(key), 0);
  const remainingBalance = Number((remainingAmount || 0) - totalEntered);

  const validatePerMonthSplits = () => {
    for (const [key, m] of Object.entries(editableMonths)) {
      const rowSum = perRowTotal(key);
      if (rowSum < 0) return { ok: false, message: `Invalid split for ${monthLabel(m.month, m.year)}` };
    }
    return { ok: true };
  };

  useEffect(() => {
    const blockRefresh = (e) => {
      if (saving) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", blockRefresh);
    return () => window.removeEventListener("beforeunload", blockRefresh);
  }, [saving]);


  const handleSave = async () => {
    if (saving) return;
    if (!latestPendingYear || remainingAmount <= 0) {
      setResponse({ status: "Failed", message: "No pending subscription amount to allocate" });
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
      return;
    }

    const keys = Object.keys(editableMonths);
    if (!keys.length) {
      setResponse({ status: "Failed", message: "Select at least one month to allocate" });
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
      return;
    }

    for (const key of keys) {
      const sum = perRowTotal(key);
      if (sum <= 0) {
        setResponse({ status: "Failed", message: `Enter amounts in splits for ${monthLabel(editableMonths[key].month, editableMonths[key].year)}` });
        setTimeout(() => setResponse({ status: null, message: "" }), 3000);
        return;
      }
    }

    if (Math.abs(remainingBalance) > 0.0001) {
      setResponse({ status: "Failed", message: `Allocated ₹${totalEntered} must equal pending ₹${remainingAmount}` });
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
      return;
    }

    const splitCheck = validatePerMonthSplits();
    if (!splitCheck.ok) {
      setResponse({ status: "Failed", message: splitCheck.message });
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
      return;
    }

    const allocations = keys.map((key) => ({
      month: editableMonths[key].month,
      amount: perRowTotal(key),
      payment_method: editableMonths[key].payment_method,
      cheque_number: editableMonths[key].cheque_number || "",
      cheque_date: editableMonths[key].cheque_date || null,
      bank_name: editableMonths[key].bank_name || "",
    }));

    try {
      setSaving(true);
      await axios.post(
        `${URL}/subscriptions/allocate`,
        { member_id, year: latestPendingYear.year, date: baseDate, allocations },
        { headers: { Authorization: token } }
      );

      for (const key of keys) {
        const item = editableMonths[key];
        const contributions = {};
        SPLIT_FIELDS.forEach((f) => (contributions[f] = Number(item.splits?.[f] || 0)));
        const sumSplit = Object.values(contributions).reduce((s, v) => s + Number(v || 0), 0);
        if (sumSplit > 0) {
          await axios.put(
            `${URL}/subscriptions/split`,
            {
              member_id, year: latestPendingYear.year, month: item.month, contributions, payment_method: item.payment_method || "Cash", cheque_number: item.cheque_number || "", cheque_date: item.cheque_date || null,
              bank_name: item.bank_name || "",
            },
            { headers: { Authorization: token } }
          );
        }
      }

      const res = await axios.get(`${URL}/subscriptions/member`, { params: { member_id }, headers: { Authorization: token } });
      setSubscriptions(res.data || []);
      setFilteredSubscriptions(res.data || []);
      setEditableMonths({});
      // setMonthDuplicate({});

      try {
        const r2 = await axios.get(`${URL}/harvest-auctions/report`, {
          params: { memberId: member_id },
          headers: { Authorization: token },
        });
        if (r2.data?.overallUnpaid > 0) {
          setHarvestAllowed(true);
          setHarvestUnpaid(r2.data.overallUnpaid);
        } else {
          setHarvestAllowed(false);
          setHarvestUnpaid(0);
        }
      } catch (err) {
        setHarvestAllowed(false);
        setHarvestUnpaid(0);
      }

      setResponse({ status: "Success", message: "Allocation saved successfully" });
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    } catch (err) {
      console.error("Allocate error:", err);
      const msg = err.response?.data?.message || "Error allocating subscription";
      setResponse({ status: "Failed", message: msg });
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    } finally {
      setSaving(false);   // ⭐ STOP LOADING
    }
  };

  if (!subscriptions.length) {
    return (
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h2 className="text-lg font-semibold text-gray-700 p-4">No subscriptions found for this member.</h2>
      </div>
    );
  }

  const member_name = subscriptions[0]?.member_name || "";

  const getInputId = (year, month, category) =>
    `cell-${year}-${month}-${category}`;

  const handleTabNavigation = (e, year, month, category) => {
    if (e.key !== "Tab" || e.shiftKey) return;

    e.preventDefault();

    const currentCatIndex = categories.indexOf(category);

    for (let i = currentCatIndex + 1; i < categories.length; i++) {
      const nextCat = categories[i];

      if (["total", "payment_method", "cheque_number"].includes(nextCat))
        continue;

      if (nextCat === "harvestAuction" && !harvestAllowed) continue;

      const nextInput = document.getElementById(
        getInputId(year, month, nextCat)
      );

      if (nextInput && !nextInput.disabled) {
        nextInput.focus();
        return;
      }
    }

    const monthIndex = months.indexOf(month);
    const nextMonth = months[monthIndex + 1];

    if (!nextMonth) return;

    const nextYear = ["january", "february", "march"].includes(nextMonth)
      ? year + 1
      : year;

    const FIRST_SPLIT_FIELD = "monthlySubscriptionOffering";

    const firstInput = document.getElementById(
      getInputId(nextYear, nextMonth, FIRST_SPLIT_FIELD)
    );

    if (firstInput && !firstInput.disabled) {
      firstInput.focus();
    }
  };

  const getMonthCategoryValue = (monthData, category) => {
    if (!monthData) return "-";

    // total
    if (category === "total") {
      return Number(monthData.total || 0);
    }

    // payment meta → latest allocation
    if (["payment_method", "cheque_number", "cheque_date", "bank_name"].includes(category)) {
      const last = monthData.allocations?.[monthData.allocations.length - 1];
      if (!last) return "-";

      if (category === "cheque_date") {
        return last.cheque_date
          ? new Date(last.cheque_date).toLocaleDateString("en-GB")
          : "-";
      }

      return last[category] || "-";
    }

    // sum split categories
    return (monthData.allocations || []).reduce(
      (sum, alloc) => sum + Number(alloc[category] || 0),
      0
    );
  };


  const getRowTotal = (yearData, category) => {
    return months.reduce((sum, month) => {
      const actualYear = getMonthYear(month, yearData.year);
      const key = `${month}-${actualYear}`;

      // live edit mode
      if (editableMonths[key]) {
        if (category === "total") {
          return sum + perRowTotal(key);
        }
        return sum + Number(editableMonths[key]?.splits?.[category] || 0);
      }

      // saved data
      const data = yearData.months[month];
      return sum + getMonthCategoryValue(data, category);
    }, 0);
  };


  return (
    <>
      <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>
        <FaArrowLeft size={18} onClick={() => navigate(-1)} className="cursor-pointer" />
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-xl font-bold text-lavender--600 p-4">Subscription Details – {member_id} ({member_name})</h2>
          </div>

          <div className="flex flex-wrap gap-4 p-4 bg-gray-50 border rounded-md mb-6">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border p-2 rounded">
              <option value="all">All Years</option>
              <option value="current">Current Financial Year</option>
              <option value="previous">Previous Financial Year</option>
              <option value="past3">Past Three Financial Years</option>
            </select>

            <div className="flex items-center gap-2">
              <label>From:</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border p-2 rounded" />
            </div>

            <div className="flex items-center gap-2">
              <label>To:</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border p-2 rounded" />
            </div>

            <div className="flex items-center">
              <GrPowerReset onClick={() => { setFilter("all"); setFromDate(""); setToDate(""); }} title="Reset Filter" className="text-red-600 cursor-pointer text-[24px]" />
            </div>
          </div>

          {remainingAmount > 0 && activeFyStartYear && (
            <div className="mb-6 p-4 border rounded">
              <h5 className="text-md font-semibold text-gray-800 mb-4">
                Pending Amount for FY {activeFyStartYear} - {String(activeFyStartYear + 1).slice(2)}: <span className="text-red-600">₹{remainingAmount}</span>
              </h5>

              <div className="flex flex-wrap gap-2 mb-3">
                {financialMonths.map((m) => {
                  const key = m.key;
                  const isSelected = !!editableMonths[key];
                  // const isDuplicate = !!monthDuplicate[key];

                  const today = new Date(baseDate);
                  const monthIndex = {
                    april: 3,
                    may: 4,
                    june: 5,
                    july: 6,
                    august: 7,
                    september: 8,
                    october: 9,
                    november: 10,
                    december: 11,
                    january: 0,
                    february: 1,
                    march: 2,
                  }[m.month];

                  const monthDate = new Date(m.year, monthIndex, 1);
                  const isFuture = monthDate > today;
                  //clear this after adding subscription for all members from spangles
                  const isDisabledMonth = false;

                  let btnClass = "";
                  // if (isDuplicate) btnClass = "bg-green-600 text-white";
                  if (isSelected) btnClass = "bg-lavender--600 text-white border-2 border-lavender--600";
else if (isFuture) btnClass = "bg-white text-black border-2 border-gray-400";
else btnClass = "bg-white text-red-600 border-2 border-red-600";


                  return (

                    // <button type="button" key={key} onClick={() => toggleMonth(m)} className={`px-3 py-1 rounded-full text-sm ${btnClass}`}>
                    //   {m.label}
                    // </button>

                    //clear this after adding subscription for all members from spangles
                    <button
                      type="button"
                      key={key}
                      onClick={() => !isDisabledMonth && toggleMonth(m)}
                      className={`px-3 py-1 rounded-full text-sm
    ${isDisabledMonth
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : btnClass}
  `}
                      title={isDisabledMonth ? "This month cannot be selected" : ""}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between items-center">
                <p className="font-semibold">
                  Remaining Balance: <span className={remainingBalance === 0 ? "text-green-700" : "text-red-700"}>₹{remainingBalance}</span>
                </p>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || remainingBalance !== 0}
                  className={`px-6 py-2 rounded text-white font-semibold flex items-center gap-2
                  ${saving || remainingBalance !== 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-lavender--600 hover:bg-lavender--700"}
                    `}
                >
                  {saving && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  )}
                  {saving ? "Saving..." : "Save Subscription"}
                </button>

              </div>
            </div>
          )}

          {filteredSubscriptions.filter((y) => y.total_received > 0 || y.remaining_amount > 0).map((yearData) => {
            const hasPendingSplit = months.some((month) => {
              const data = yearData.months[month] || {};
              const hasSplit = categories.filter((cat) => !["total", "payment_method", "cheque_number"].includes(cat)).some((cat) => Number(data[cat] || 0) > 0);
              return data.total > 0 && !hasSplit;
            });

            return (
              <div key={yearData.year} className="mt-8">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Financial Year: {yearData.year} - {Number(yearData.year) + 1}
                  </h3>

                  <div className="text-lg font-semibold text-lavender--600">
                    Total: ₹{getRowTotal(yearData, "total")}
                  </div>
                </div>


                <div className="overflow-x-auto">
                  <table className="min-w-[1000px] border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 border text-center">Category</th>

                        {months.map((month) => {
                          const actualYear = getMonthYear(month, yearData.year);
                          const key = `${month}-${actualYear}`;
                          return (
                            <th key={key} className="p-2 border text-left capitalize">
                              {month}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>


                    <tbody>
                      {categories.map((cat) => (
                        <tr key={cat} className="border hover:bg-gray-50">
                          <td className="p-2 border font-medium text-center">
                            {labels[cat]}
                            {cat === "harvestAuction" && (
                              <div className="text-xs font-semibold mt-1">
                                {harvestUnpaid > 0 ? (
                                  <span className="text-red-600">
                                    Balance: ₹{harvestUnpaid}
                                  </span>
                                ) : (
                                  <span className="text-green-600">
                                    Balance: ₹0
                                  </span>
                                )}
                              </div>
                            )}
                          </td>


                          {months.map((month) => {
                            const data = yearData.months[month] || {};
                            const actualYear = getMonthYear(month, yearData.year);
                            const key = `${month}-${actualYear}`;
                            const isEditable = !!editableMonths[key];

                            if (cat === "payment_method") {
                              return (
                                <td key={key} className="p-2 border text-center">
                                  {isEditable ? (
                                    <select
                                      value={editableMonths[key]?.payment_method || "Cash"}
                                      onChange={(e) =>
                                        updateEditableMonthField(key, "payment_method", e.target.value)
                                      }
                                      className="border rounded px-1"
                                    >
                                      <option value="Cash">Cash</option>
                                      <option value="Cheque">Cheque</option>
                                    </select>
                                  ) : (
                                    getMonthCategoryValue(data, "payment_method")
                                  )}
                                </td>
                              );
                            }

                            if (cat === "cheque_number") {
                              return (
                                <td key={key} className="p-2 border text-center">
                                  {isEditable && editableMonths[key]?.payment_method === "Cheque" ? (
                                    <input
                                      type="text"
                                      value={editableMonths[key]?.cheque_number || ""}
                                      onChange={(e) =>
                                        updateEditableMonthField(key, "cheque_number", e.target.value)
                                      }
                                      className="border rounded px-1 w-24 text-center bg-white"
                                      placeholder="Cheque No"
                                    />
                                  ) : (
                                    getMonthCategoryValue(data, "cheque_number")
                                  )}
                                </td>
                              );
                            }

                            if (cat === "cheque_date") {
                              return (
                                <td key={key} className="p-2 border text-center">
                                  {isEditable && editableMonths[key]?.payment_method === "Cheque" ? (
                                    <input
                                      type="date"
                                      value={editableMonths[key]?.cheque_date || ""}
                                      onChange={(e) =>
                                        updateEditableMonthField(key, "cheque_date", e.target.value)
                                      }
                                      className="border rounded px-1 text-center bg-white w-[80%]"
                                    />
                                  ) : (
                                    getMonthCategoryValue(data, "cheque_date")
                                  )}
                                </td>
                              );
                            }

                            if (cat === "bank_name") {
                              return (
                                <td key={key} className="p-2 border text-center">
                                  {isEditable && editableMonths[key]?.payment_method === "Cheque" ? (
                                    <input
                                      type="text"
                                      value={editableMonths[key]?.bank_name || ""}
                                      onChange={(e) =>
                                        updateEditableMonthField(key, "bank_name", e.target.value)
                                      }
                                      className="border rounded px-1 w-28 text-center bg-white"
                                      placeholder="Bank"
                                    />
                                  ) : (
                                    getMonthCategoryValue(data, "bank_name")
                                  )}
                                </td>
                              );
                            }




                            if (cat === "total") {
                              return (
                                <td key={key} className="p-2 border text-center font-semibold">
                                  {isEditable ? perRowTotal(key) : Number(data.total) || 0}
                                </td>
                              );
                            }

                            return (
                              <td key={key} className="p-2 border text-center">
                                {isEditable ? (
                                  cat === "harvestAuction" ? (
                                    <input
                                      id={getInputId(actualYear, month, cat)}
                                      type="text"
                                      inputMode="numeric"
                                      className={`w-20 border rounded px-1 text-center ${harvestAllowed
                                        ? "bg-white"
                                        : "bg-gray-200 cursor-not-allowed"
                                        }`}
                                      value={editableMonths[key]?.splits?.[cat] ?? ""}
                                      disabled={!harvestAllowed}
                                      onChange={(e) =>
                                        harvestAllowed &&
                                        updateEditableMonthSplit(key, cat, e.target.value)
                                      }
                                      onKeyDown={(e) =>
                                        handleTabNavigation(e, actualYear, month, cat)
                                      }
                                      placeholder={harvestAllowed ? "0" : "No Bal"}
                                    />

                                  ) : (
                                    <input
                                      id={getInputId(actualYear, month, cat)}
                                      type="text"
                                      inputMode="numeric"
                                      value={editableMonths[key]?.splits?.[cat] ?? ""}
                                      onChange={(e) =>
                                        updateEditableMonthSplit(key, cat, e.target.value)
                                      }
                                      onKeyDown={(e) =>
                                        handleTabNavigation(e, actualYear, month, cat)
                                      }
                                      className="w-20 border rounded px-1 text-center"
                                      placeholder="0"
                                    />

                                  )
                                ) : (
                                  getMonthCategoryValue(data, cat)
                                )}

                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>
              </div>
            );
          })}

          {response.status && (response.status === "Success" ? <SuccessMessage Message={response.message} /> : <FailedMessage Message={response.message} />)}
        </div>
      </div>
    </>
  )
}
