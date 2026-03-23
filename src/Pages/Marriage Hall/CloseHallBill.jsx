import React, { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { URL } from "../../App";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export const CloseHallBill = () => {
  const { id } = useParams();
  const token = window.sessionStorage.getItem("token");

  // STATE
  const [halls, setHalls] = useState([]);
  const [selectedHallId, setSelectedHallId] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [calendarDate, setCalendarDate] = useState(null);
  const [selected, setSelected] = useState({ morning: false, evening: false });
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState(0); // FIXED DEPOSIT
  const [bookingStatus, setBookingStatus] = useState("");

  const [hallBookings, setHallBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [advanceHistory, setAdvanceHistory] = useState([]);
  const [newAdvance, setNewAdvance] = useState("");
  const [advErr, setAdvErr] = useState("");
  const [issuedAssets, setIssuedAssets] = useState([]);
  const [returnMap, setReturnMap] = useState({});
  const [fineAmount, setFineAmount] = useState(0);
  const [newFine, setNewFine] = useState("");
  const navigate = useNavigate();

  // Load halls
  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const res = await axios.get(`${URL}/marriage-halls`, {
          headers: { Authorization: token },
        });
        setHalls(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHalls();
  }, [token]);

  // Load booking details
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await axios.get(`${URL}/bookings/${id}`, {
          headers: { Authorization: token },
        });

        const b = res.data.data;
        if (!b) return;

        setSelectedHallId(b.hall?._id || "");
        setSelectedCategoryId(b.category?._id || "");
        setAmount(b.amount || "");
        setCalendarDate(new Date(b.date));
        setSelected({
          morning: b.sessions?.includes("morning"),
          evening: b.sessions?.includes("evening"),
        });
        setCustomerName(b.customerName);
        setCustomerPhone(b.customerPhone);
        setAdvanceAmount(b.advanceAmount || 0); // fixed original advance
        setBookingStatus(b.booking_status || "");
        setFineAmount(b.fineAmount || 0);
      } catch (err) {
        console.log("Error fetching booking:", err);
      }
    };

    fetchBooking();
  }, [id, token]);


  useEffect(() => {
    const hall = halls.find((h) => h._id === selectedHallId);
    if (hall) {
      setCategories(hall.categoryPrices || []);
    } else {
      setCategories([]);
      return;
    }

    const fetchHallBookings = async () => {
      try {
        const res = await axios.get(`${URL}/bookings/all?hallId=${selectedHallId}`, {
          headers: { Authorization: token },
        });
        setHallBookings(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    if (selectedHallId) fetchHallBookings();
  }, [selectedHallId, halls, token]);

  useEffect(() => {
    if (!id) return;

    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${URL}/bookings/${id}/advance-history`, {
          headers: { Authorization: token },
        });
        setAdvanceHistory(res.data.data.history || []);
      } catch (err) {
        console.log("History fetch error:", err);
      }
    };

    fetchHistory();
  }, [id]);

  // Correct balance calculation
  const totalPaidFromHistory = advanceHistory.reduce((sum, p) => sum + p.amount, 0);
  const balance =
    Number(amount) +
    Number(fineAmount || 0) -
    Number(advanceAmount) -
    totalPaidFromHistory;


  useEffect(() => {
    if (!id) return;

    axios.get(`${URL}/kitchen-asset-issues/by-booking/${id}`, {
      headers: { Authorization: token }
    })
      .then(res => {
        const issues = res.data.data || [];
        setIssuedAssets(issues);

        // 🔥 Preload returnMap
        const map = {};
        issues.forEach(issue => {
          issue.items.forEach(i => {
            map[i.asset_id] = {
              returned: i.issued_qty,
              damaged: 0,
              missing: 0
            };
          });
        });
        setReturnMap(map);
      });
  }, [id]);


  const showToast = (status, message) => {
    setResponse({ status: null, message: "" });
    setTimeout(() => setResponse({ status, message }), 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  };

  const reloadIssuedAssets = async () => {
    const res = await axios.get(`${URL}/kitchen-asset-issues/by-booking/${id}`, {
      headers: { Authorization: token }
    });

    const issues = res.data.data || [];
    setIssuedAssets(issues);

    // 🔥 Reset preload after save
    const map = {};
    issues.forEach(issue => {
      issue.items.forEach(i => {
        map[i.asset_id] = {
          returned: i.issued_qty,
          damaged: 0,
          missing: 0
        };
      });
    });
    setReturnMap(map);
  };



  const bulkUpdateReturn = async (issueId) => {
    if (!Object.keys(returnMap).length) {
      showToast("Failed", "No items to update");
      return;
    }

    try {
      await axios.put(
        `${URL}/kitchen-asset-issues/${issueId}/bulk-update`,
        { updates: returnMap },
        { headers: { Authorization: token } }
      );

      showToast("Success", "Assets updated successfully");

      setReturnMap({});
      await reloadIssuedAssets();
    } catch (err) {
      showToast(
        "Failed",
        err.response?.data?.message || "Update failed"
      );
    }
  };



  const onlyNumber = v => v.replace(/\D/g, "");
  const clampQty = (assetId, issuedQty, field, value, prevMap) => {
    const clean = Number(onlyNumber(value) || 0);

    const current = prevMap[assetId] || {
      returned: issuedQty,
      damaged: 0,
      missing: 0
    };

    let damaged = field === "damaged" ? clean : current.damaged;
    let missing = field === "missing" ? clean : current.missing;

    // ❌ prevent subtract overflow
    if (damaged + missing > issuedQty) return prevMap;

    const returned = issuedQty - (damaged + missing);

    return {
      ...prevMap,
      [assetId]: { returned, damaged, missing }
    };
  };


  const isItemClosed = (item) => {
    return (item.returned + item.damaged + item.missing) >= item.issued_qty;
  };

  const hasOpenItems = (issue) =>
    issue.items.some(i => !isItemClosed(i));

  return (
    <>
      <FaArrowLeft onClick={() => navigate("/admin/mrghallbookings")} className="cursor-pointer mb-4" />
      <div className="p-4 mt-3 bg-white shadow-md rounded-[10px]">
        <h2 className="text-lg font-semibold mb-3 text-lavender--600">
          Payment History
        </h2>
        <div className="mt-8 p-4 border rounded-lg bg-gray-50">

          {/* SUMMARY BOX */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <span className="font-medium text-gray-700">Total Amount:</span>
              <p className="text-xl font-bold text-gray-900">₹ {amount}</p>
            </div>

            <div>
              <span className="font-medium text-gray-700">Advance Paid:</span>
              <p className="text-xl font-bold text-green-700">₹ {advanceAmount}</p>
            </div>

            <div>
              <span className="font-medium text-gray-700">Remaining Balance:</span>
              <p className="text-xl font-bold text-red-700">₹ {balance}</p>
            </div>
          </div>

          {/* TABLE */}
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-gray-800 border-b">
                <tr>
                  <th className="p-2 border">Sl. No</th>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Amount Paid</th>
                  <th className="p-2 border">Balance After</th>
                </tr>
              </thead>
              <tbody>
                {advanceHistory.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center p-3 text-gray-500">
                      No payments yet.
                    </td>
                  </tr>
                )}

                {advanceHistory.map((item, i) => {
                  const paidBefore =
                    advanceAmount +
                    advanceHistory.slice(0, i).reduce((sum, h) => sum + h.amount, 0);

                  const balanceAfter =
                    Number(amount) +
                    Number(fineAmount || 0) -
                    paidBefore -
                    item.amount;


                  return (
                    <tr key={i} className="border-b">
                      <td className="p-2 border">{i + 1}</td>
                      <td className="p-2 border">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td className="p-2 border">₹ {item.amount}</td>
                      <td className="p-2 border">₹ {balanceAfter}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ADD PAYMENT */}
          {balance > 0 && (
            <div className="mt-6">
              <label className="font-medium text-gray-700">Today's Payment</label>

              <div className="flex items-center mt-2">
                <div className="w-1/2">
                  <input
                    type="text"
                    inputMode="numeric"      // mobile numeric keyboard
                    pattern="[0-9]*"         // hint for browsers
                    value={newAdvance}
                    onChange={(e) => {
                      const raw = e.target.value;

                      // ✅ Allow empty input
                      if (raw === "") {
                        setNewAdvance("");
                        setAdvErr("");
                        return;
                      }

                      // ❌ Block non-numeric characters
                      if (!/^\d+$/.test(raw)) return;

                      const v = Number(raw);

                      // ❌ Exceeds balance
                      if (v > balance) {
                        setAdvErr(`Cannot exceed balance (₹${balance})`);
                        setNewAdvance(balance.toString());
                      } else {
                        setAdvErr("");
                        setNewAdvance(raw); // keep as string
                      }
                    }}
                    className={`p-2 w-full border rounded-md ${advErr ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder="Enter amount"
                  />

                  {advErr && <p className="text-red-600 text-xs mt-1">{advErr}</p>}
                </div>

                <button
                  onClick={async () => {
                    if (!newAdvance) {
                      showToast("Failed", "Enter advance amount");
                      return;
                    }

                    try {
                      const res = await axios.post(
                        `${URL}/bookings/${id}/advance`,
                        { amount: Number(newAdvance) },
                        { headers: { Authorization: token } }
                      );

                      setAdvanceHistory(res.data.data.advanceHistory); // update only history
                      setNewAdvance("");
                      setAdvErr("");

                      showToast("Success", "Payment added successfully");
                    } catch (err) {
                      showToast(
                        "Failed",
                        err.response?.data?.message || "Error adding payment"
                      );
                    }
                  }}
                  className="ml-auto px-4 py-2 bg-lavender--600 text-white rounded whitespace-nowrap"
                >
                  Add Payment
                </button>

              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 mt-3 bg-white shadow-md rounded-[10px]">
        <h2 className="text-lg font-semibold mb-3 text-lavender--600">
          Issued Kitchen Assets
        </h2>

        {issuedAssets.length === 0 && (
          <p className="text-gray-500">No assets issued.</p>
        )}

        {issuedAssets.map(issue => (
          <div key={issue._id} className="mb-6 border rounded bg-white p-3">

            <p className="font-semibold mb-2">
              Hall : {issue.hall_id?.hall_name} | Customer : {issue.customer_name}
            </p>

            <table className="w-full text-sm border">
              <thead>
                <tr>
                  <th className="p-2 border text-center">Item</th>
                  <th className="p-2 border text-center bg-blue-100">Issued</th>
                  <th className="p-2 border text-center bg-green-100">Returned</th>
                  <th className="p-2 border text-center bg-yellow-100">Damaged</th>
                  <th className="p-2 border text-center bg-red-100">Missing</th>
                </tr>
              </thead>

              <tbody>
                {issue.items.map(i => (
                  <tr key={i._id} className="border-b text-center">

                    <td className="p-2 border">{i.item_name}</td>

                    <td className="p-2 border font-semibold bg-blue-100">{i.issued_qty}</td>

                    <td className="p-2 border text-center bg-green-100">
                      {isItemClosed(i) ? (
                        <span className="text-green-700 font-semibold">{i.returned}</span>
                      ) : (
                        <input
                          value={returnMap[i.asset_id]?.returned || ""}
                          onChange={e =>
                            setReturnMap(prev =>
                              clampQty(i.asset_id, i.issued_qty, "returned", e.target.value, prev)
                            )
                          }
                          className="w-16 border rounded text-center text-green-600 font-semibold"
                        />
                      )}
                    </td>


                    <td className="p-2 border text-center bg-yellow-100">
                      {isItemClosed(i) ? (
                        <span className="text-yellow-600 font-semibold">{i.damaged}</span>
                      ) : (
                        <input
                          value={returnMap[i.asset_id]?.damaged || ""}
                          onChange={e =>
                            setReturnMap(prev =>
                              clampQty(i.asset_id, i.issued_qty, "damaged", e.target.value, prev)
                            )
                          }
                          className="w-16 border rounded text-center text-yellow-600 font-semibold"
                        />
                      )}
                    </td>


                    <td className="p-2 border text-center bg-red-100">
                      {isItemClosed(i) ? (
                        <span className="text-red-600 font-semibold">{i.missing}</span>
                      ) : (
                        <input
                          value={returnMap[i.asset_id]?.missing || ""}
                          onChange={e =>
                            setReturnMap(prev =>
                              clampQty(i.asset_id, i.issued_qty, "missing", e.target.value, prev)
                            )
                          }
                          className="w-16 border rounded text-center text-red-600 font-semibold"
                        />
                      )}
                    </td>


                  </tr>
                ))}
              </tbody>
            </table>

            {/* 🔥 SAVE BUTTON PER BOOKING ISSUE */}
            {hasOpenItems(issue) && (
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => bulkUpdateReturn(issue._id)}
                  className="bg-lavender--600 text-white px-5 py-2 rounded-lg"
                >
                  Save Asset Updates
                </button>
              </div>
            )}


          </div>

        ))}
      </div>

      <div className="p-4 mt-3 bg-white shadow-md rounded-[10px]">
        <h2 className="text-lg font-semibold mb-3 text-lavender--600">
          Fine Amount
        </h2>
        <div className="mt-6">
        {/* <label className="font-medium text-gray-700">Fine Amount</label> */}
        <div className="flex items-center mt-2">
          <input
            value={newFine}
            onChange={e => setNewFine(e.target.value.replace(/\D/g, ""))}
            className="p-2 border rounded w-1/2"
            placeholder="Enter fine"
          />

          <button
            onClick={async () => {
              if (!newFine) return;

              await axios.post(
                `${URL}/bookings/${id}/fine`,
                { amount: Number(newFine) },
                { headers: { Authorization: token } }
              );

              setFineAmount(p => p + Number(newFine));
              setNewFine("");
              showToast("Success", "Fine added");
            }}
            className="ml-auto bg-red-600 text-white px-4 py-2 rounded"
          >
            Add Fine
          </button>
        </div>
      </div>
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
