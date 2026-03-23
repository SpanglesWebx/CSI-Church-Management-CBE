import React, { useEffect, useRef, useState } from "react";
import { FaEye, FaPlus } from "react-icons/fa";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import { URL } from "../../App";
import moment from "moment";
import SmallSizedModal from "../../Components/Expense/SmallSizedModal";
import { useNavigate } from "react-router-dom";
import Modal from "../../Components/Expense/ExpenseFormModal";
import Pagination from "../../Components/Helpers/Pagination";

export const MarriageList = () => {
  const [isBannsModalOpen, setIsBannsModalOpen] = useState(false);
  const [isMrgPriceModalOpen, setIsMrgPriceModalOpen] = useState(false);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const token = window.sessionStorage.getItem("token");

  // listing states
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();
  // Price inputs
  const [bannsAmount, setBannsAmount] = useState("");
  const [marriageAmount, setMarriageAmount] = useState("");

  // Price history
  const [bannsPriceList, setBannsPriceList] = useState([]);
  const [marriagePriceList, setMarriagePriceList] = useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedPriceId, setSelectedPriceId] = useState(null);
  const [selectedPriceType, setSelectedPriceType] = useState(null); // "banns" or "marriage"
  const [marriageList, setMarriageList] = useState([]);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedMarriage, setSelectedMarriage] = useState(null);
  // pagination (standard across app)
const [rowsPerPage, setRowsPerPage] = useState(25);
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");



  const fetchMarriageList = async () => {
    try {
      const res = await axios.get(`${URL}/marriages/list`, {
        params: {
          page: CurrentPage,
          limit: rowsPerPage,
          search: searchTerm,
          startDate,
          endDate
        },
        headers: { Authorization: token }
      });

      setMarriageList(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Fetch marriage list error:", err);
    }
  };

useEffect(() => {
  fetchMarriageList();
}, [CurrentPage, rowsPerPage, searchTerm, startDate, endDate]);




  const fetchBannsPriceList = async () => {
    try {
      const res = await axios.get(`${URL}/banns-price/list`, {
        headers: { Authorization: token }
      });

      setBannsPriceList(res.data.data || []);
    } catch (err) {
      console.log("Error fetching banns price:", err);
    }
  };

  const fetchMarriagePriceList = async () => {
    try {
      const res = await axios.get(`${URL}/marriage-price/list`, {
        headers: { Authorization: token }
      });

      setMarriagePriceList(res.data.data || []);
    } catch (err) {
      console.log("Error fetching marriage price:", err);
    }
  };

  // Fetch Banns Price List
  useEffect(() => {
    if (isBannsModalOpen) {
      fetchBannsPriceList();
    }
  }, [isBannsModalOpen]);

  // Fetch Marriage Price List
  useEffect(() => {
    if (isMrgPriceModalOpen) {
      fetchMarriagePriceList();
    }
  }, [isMrgPriceModalOpen]);


  const saveBannsPrice = async () => {
    if (!bannsAmount || isNaN(bannsAmount)) {
      // ❗ Validation toast
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Enter a valid amount",
        });
      }, 10);

      // Auto hide
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);

      return;
    }

    try {
      const res = await axios.post(
        `${URL}/banns-price/add`,
        { amount: Number(bannsAmount) },
        { headers: { Authorization: token } }
      );

      // 🟢 Success toast — forced re-render
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Success",
          message: res.data.message,
        });
      }, 10);

      // Auto hide
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);

      setBannsAmount("");
      fetchBannsPriceList();

    } catch (error) {
      console.error(error);

      // 🔴 Error toast — forced re-render
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Failed to save banns price",
        });
      }, 10);

      // Auto hide
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    }
  };


  const saveMarriagePrice = async () => {
    if (!marriageAmount || isNaN(marriageAmount)) {
      // ❗ Validation toast
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Enter a valid amount",
        });
      }, 10);

      // Auto hide
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);

      return;
    }

    try {
      const res = await axios.post(
        `${URL}/marriage-price/add`,
        { amount: Number(marriageAmount) },
        { headers: { Authorization: token } }
      );

      // 🟢 Success toast — forced re-render
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Success",
          message: res.data.message,
        });
      }, 10);

      // Auto hide
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);

      setMarriageAmount("");
      fetchMarriagePriceList();

    } catch (error) {
      console.error(error);

      // 🔴 Error toast — forced re-render
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Failed to save marriage price",
        });
      }, 10);

      // Auto hide
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    }
  };


  const handleToggleConfirm = async () => {
    if (!selectedPriceId) return;

    try {
      const url =
        selectedPriceType === "banns"
          ? `${URL}/banns-price/toggle/${selectedPriceId}`
          : `${URL}/marriage-price/toggle/${selectedPriceId}`;

      await axios.patch(url, {}, { headers: { Authorization: token } });

      // 🟢 SUCCESS TOAST — force re-render
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Success",
          message: "Price updated successfully",
        });
      }, 10);

      // Auto hide
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);

      // Refresh correct list
      if (selectedPriceType === "banns") fetchBannsPriceList();
      else fetchMarriagePriceList();

      // Reset UI
      setIsConfirmOpen(false);
      setSelectedPriceId(null);
      setSelectedPriceType(null);

    } catch (err) {
      console.error("Toggle price error:", err);

      // 🔴 ERROR TOAST — force re-render
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: err.response?.data?.message || "Cannot update price",
        });
      }, 10);

      // Auto hide
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    }
  };

  const canCloseBannsModal = () => {
    const activeCount = bannsPriceList.filter(x => x.isActive).length;

    // ❌ No active price
    if (activeCount === 0) {
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "At least one active price must remain.",
        });
      }, 10);
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
      return false;
    }

    // ❌ More than one active price
    if (activeCount > 1) {
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Only one Banns Price can be active at a time.",
        });
      }, 10);
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
      return false;
    }

    // ✔ Valid — exactly 1 active
    return true;
  };

  const canCloseMarriageModal = () => {
    const activeCount = marriagePriceList.filter(x => x.isActive).length;

    // ❌ No active price
    if (activeCount === 0) {
      // Force toast re-render
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "At least one active marriage price must remain.",
        });
      }, 10);

      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
      return false;
    }

    // ❌ More than one active price
    if (activeCount > 1) {
      // Force toast re-render
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Only one Marriage Price can be active at a time.",
        });
      }, 10);

      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
      return false;
    }

    // ✔ Exactly one active — valid
    return true;
  };





  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg font-semibold">Marriage</h1>
        <div className="flex items-center justify-between p-2">
          <div className="">
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                <svg className="w-3 h-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input
                type="search"
                id="default-search"
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <label>From</label>
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }} className="py-1 text-sm rounded border px-2" />
            <label>To</label>
            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }} className="py-1 text-sm rounded border px-2" />
          </div>
          <div>
            <button onClick={() => { setIsBannsModalOpen(true); }} className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg"><FaPlus /> Banns Price</button>
          </div>
          <div>
            <button onClick={() => { setIsMrgPriceModalOpen(true); }} className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg"><FaPlus /> Marriage Price</button>
          </div>
          <div>
            <button onClick={() => navigate("/admin/marriagelist/addmarriage")} className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg"><FaPlus /> Marriage</button>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Name</th>
                <th className="p-2 text-center">Type</th>
                <th className="p-2 text-center">Marriage Date</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {marriageList.map((m, index) => {
                const name = m.member
                  ? m.member.member_name
                  : m.non_member?.name || "N/A";

                return (
                  <tr key={m._id} className="border-b">
                    <td className="p-2 text-center">{(CurrentPage - 1) * rowsPerPage + index + 1}</td>
                    <td className="p-2 text-center">{name}</td>
                    <td className="p-2 text-center">{m.type}</td>
                    <td className="p-2 text-center">
                      {moment(m.date).format("DD-MM-YYYY")}
                    </td>
                    <td className="p-2 text-center">
                      <FaEye
                        size={18}
                        className="cursor-pointer text-lavender--600 mx-auto"
                        onClick={() => {
                          setSelectedMarriage(m);
                          setIsViewOpen(true);
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
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



        <SmallSizedModal
          isOpen={isBannsModalOpen}
          onClose={() => {
            if (!canCloseBannsModal()) return;
            setIsBannsModalOpen(false);
          }}
          title="Add Banns Price"
        >

          <div className="max-h-[400px] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Banns Price</label>
                <input type="text" placeholder="Enter Amount" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  value={bannsAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) { // only digits allowed
                      setBannsAmount(value);
                    }
                  }} />
              </div>
            </div>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm text-gray-500">
                <thead className="text-base text-gray-700 border-b">
                  <tr>
                    <th className="p-2 text-center">Sl No.</th>
                    <th className="p-2 text-center">Bans Price</th>
                    <th className="p-2 text-center">Date</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bannsPriceList.map((item, index) => (
                    <tr key={item._id}>
                      <td className="p-2 text-center">{index + 1}</td>
                      <td className="p-2 text-center">{item.amount}</td>
                      <td className="p-2 text-center">{moment(item.date).format("DD-MM-YYYY")}</td>
                      <td className="p-2 text-center">
                        {item.isActive ? (
                          // Active → Allow click (to deactivate)
                          <button
                            onClick={() => {
                              setSelectedPriceId(item._id);
                              setSelectedPriceType("banns");
                              setIsConfirmOpen(true);
                            }}
                          >
                            <span className="text-green-600 cursor-pointer">● Active</span>
                          </button>
                        ) : (
                          // Inactive → DO NOT allow click
                          <span className="text-red-500 font-semibold cursor-not-allowed">Inactive</span>
                        )}
                      </td>


                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={saveBannsPrice} className="px-4 py-2 bg-lavender--600 text-white rounded-md">Save</button>
            </div>
          </div>

        </SmallSizedModal>
        <SmallSizedModal
          isOpen={isMrgPriceModalOpen}
          onClose={() => {
            if (!canCloseMarriageModal()) return;
            setIsMrgPriceModalOpen(false);
          }}
          title="Add Marriage Price"
        >

          <div className="max-h-[400px] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Marriage Price</label>
                <input type="text" placeholder="Enter Amount" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  value={marriageAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {   // only digits allowed
                      setMarriageAmount(value);
                    }
                  }} />
              </div>
            </div>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm text-gray-500">
                <thead className="text-base text-gray-700 border-b">
                  <tr>
                    <th className="p-2 text-center">Sl No.</th>
                    <th className="p-2 text-center">Marriage Price</th>
                    <th className="p-2 text-center">Date</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {marriagePriceList.map((item, index) => (
                    <tr key={item._id}>
                      <td className="p-2 text-center">{index + 1}</td>
                      <td className="p-2 text-center">{item.amount}</td>
                      <td className="p-2 text-center">{moment(item.date).format("DD-MM-YYYY")}</td>
                      <td className="p-2 text-center">
                        {item.isActive ? (
                          <button
                            onClick={() => {
                              setSelectedPriceId(item._id);
                              setSelectedPriceType("marriage");
                              setIsConfirmOpen(true);
                            }}
                          >
                            <span className="text-green-600 cursor-pointer">● Active</span>
                          </button>
                        ) : (
                          <span className="text-red-500 cursor-not-allowed">Inactive</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={saveMarriagePrice} className="px-4 py-2 bg-lavender--600 text-white rounded-md">Save</button>
            </div>
          </div>
        </SmallSizedModal>

        <SmallSizedModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          title="Confirm Action"
        >
          <p className="text-gray-700 text-center my-4">
            Do you really want to mark this price as{" "}
            <strong>Inactive</strong>?
          </p>

          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => setIsConfirmOpen(false)}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              No
            </button>

            <button
              onClick={handleToggleConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Yes
            </button>
          </div>
        </SmallSizedModal>

        <Modal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          title="Marriage Details"
        >
          {selectedMarriage && (
            <div className="flex flex-col  ps-5 w-full  space-y-3 max-h-[650px] overflow-y-auto">

              {/* BASIC DETAILS */}
              <h3 className="text-lg font-semibold text-lavender--600 mt-2">
                Basic Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 p-3">
                {[
                  {
                    label: "Member Type",
                    value: selectedMarriage.member ? "Member" : "Non-Member",
                  },
                  {
                    label: "Name",
                    value: selectedMarriage.member
                      ? selectedMarriage.member.member_name
                      : selectedMarriage.non_member?.name,
                  },
                  {
                    label: "Phone",
                    value: selectedMarriage.member
                      ? selectedMarriage.member.phone || "-"
                      : selectedMarriage.non_member?.phone || "-",
                  },
                  { label: "Type", value: selectedMarriage.type },
                  {
                    label: "Marriage Date",
                    value: moment(selectedMarriage.date).format("DD-MM-YYYY"),
                  },
                  { label: "Amount", value: `₹ ${selectedMarriage.amount}` },
                ].map((item, i) => (
                  <div key={i} className="grid grid-cols-2 gap-4">
                    <span className="text-md font-bold text-gray-600">{item.label}</span>
                    <span className="text-gray-800">{item.value}</span>
                  </div>
                ))}
              </div>


              {/* NON-MEMBER DETAILS ONLY IF EXISTS */}
              {selectedMarriage.non_member && (
                <>
                  <h3 className="text-lg font-semibold text-lavender--600 mt-4">
                    Non-Member Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 p-3">
                    {[
                      { label: "Church", value: selectedMarriage.non_member.church || "-" },
                      { label: "Address", value: selectedMarriage.non_member.address || "-" },
                    ].map((item, i) => (
                      <div key={`non-${i}`} className="grid grid-cols-2 gap-4">
                        <span className="text-md font-bold text-gray-600">{item.label}</span>
                        <span className="text-gray-800">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}


              {/* HALL BOOKING DETAILS IF EXISTS */}
              {selectedMarriage.hallBooking && (
                <>
                  <h3 className="text-lg font-semibold text-lavender--600 mt-2 ">
                    Hall Booking Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 p-3">
                    {[
                      { label: "Hall", value: selectedMarriage.hallBooking.hallName },
                      {
                        label: "Category",
                        value: selectedMarriage.hallBooking.categoryName,
                      },
                      {
                        label: "Booked Date",
                        value: moment(selectedMarriage.hallBooking.bookingDate).format(
                          "DD-MM-YYYY"
                        ),
                      },
                      {
                        label: "Sessions",
                        value: selectedMarriage.hallBooking.sessions
                          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                          .join(", "),
                      },
                      {
                        label: "Hall Amount",
                        value: `₹ ${selectedMarriage.hallBooking.hallAmount}`,
                      },
                      {
                        label: "Advance Paid",
                        value: `₹ ${selectedMarriage.hallBooking.advanceAmount}`,
                      },
                    ].map((item, i) => (
                      <div key={`hall-${i}`} className="grid grid-cols-2 gap-4">
                        <span className="text-md font-bold text-gray-600">{item.label}</span>
                        <span className="text-gray-800">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

            </div>
          )}
        </Modal>


      </div>

      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}
    </>
  )
}
