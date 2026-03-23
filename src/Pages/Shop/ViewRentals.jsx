import React, { useEffect, useState } from "react";
import axios from "axios";
import { URL } from "../../App";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";
import { FaArrowLeft } from "react-icons/fa";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";

export const ViewRentals = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = window.sessionStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [rental, setRental] = useState(null);

  // 🔥 NEW STATES FOR PAYMENT HISTORY
  const [payments, setPayments] = useState([]);
  const [payDate, setPayDate] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [Response, setResponse] = useState({ status: null, message: "" });

  useEffect(() => {
    const fetchRental = async () => {
      try {
        const res = await axios.get(`${URL}/rentals/get/${id}`, {
          headers: { Authorization: token },
        });
        setRental(res.data);
      } catch (err) {
        console.error("Failed to fetch rental:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRental();
  }, [id]);



  useEffect(() => {
  const fetchPayments = async () => {
    try {
      setLoadingPayments(true);
      const res = await axios.get(
        `${URL}/rentals/${id}/payments?page=${CurrentPage}&limit=10`,
        { headers: { Authorization: token } }
      );

      setPayments(res.data?.payments || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.log("Failed to load payments:", err);
    } finally {
      setLoadingPayments(false);
    }
  };

  fetchPayments();
}, [id, CurrentPage]);


  // 🔥 ADD NEW PAYMENT
  const addPayment = async () => {
  if (!payDate || !payAmount) {
    // ❗ Validation toast
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({
        status: "Failed",
        message: "Please select a date and enter an amount",
      });
    }, 10);

    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    return;
  }

  try {
    const payload = {
      date: payDate,
      amount: Number(payAmount),
    };

    await axios.post(`${URL}/rentals/${id}/payments`, payload, {
      headers: { Authorization: token },
    });

    // 🟢 Success toast — forced re-render
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({
        status: "Success",
        message: "Payment added successfully",
      });
    }, 10);

    // Auto-hide
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);

    // Refresh payments
    const res = await axios.get(`${URL}/rentals/${id}/payments`, {
      headers: { Authorization: token },
    });

    setPayments(res.data?.payments || []);

    // Reset fields
    setPayDate("");
    setPayAmount("");

  } catch (err) {
    console.error("Add payment error:", err);

    // 🔴 Error toast — forced re-render
    setResponse({ status: null, message: "" });
    setTimeout(() => {
      setResponse({
        status: "Failed",
        message: "Failed to add payment",
      });
    }, 10);

    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  }
};


  if (loading)
    return <div className="p-10 text-center text-lg">Loading...</div>;
  if (!rental)
    return (
      <div className="p-10 text-center text-lg text-red-600">
        Rental not found
      </div>
    );

  const isInvalidAmount =
    !payAmount ||
    Number(payAmount) !== Number(rental.rental_amount);

    // Extract billing cycle day
const billingCycleDay = rental.billing_cycle_date
  ? Number(moment(rental.billing_cycle_date).format("DD"))
  : null;



  return (
    <>
      <FaArrowLeft
        size={18}
        onClick={() => navigate(-1)}
        className="cursor-pointer"
      />

      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">
          Rental Details
        </h1>

        {/* 🔥 SAME STYLE AS YOUR MODAL VIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 p-3">
          {[
            { label: "Lesse ID", value: rental.lesse_id || "-" },
            { label: "Shop Keeper Name", value: rental.shopkeeper_name || "-" },
            { label: "Mobile Number", value: rental.mobile_number || "-" },
            { label: "Aadhar Number", value: rental.aadhar_number || "-" },
            { label: "Address", value: rental.address || "-" },
            { label: "Shop Name", value: rental.shop_name || "-" },
            { label: "Shop Location", value: rental.shop_location || "-" },
            { label: "Type of Business", value: rental.type_of_business || "-" },
            { label: "Advance Amount", value: `₹ ${rental.advance_amount || 0}` },
            { label: "Rental Amount", value: `₹ ${rental.rental_amount || 0}` },
            {
              label: "Billing Cycle",
              value: rental.billing_cycle_date
                ? moment(rental.billing_cycle_date).format("DD-MMM-YYYY")
                : "-",
            },
            {
              label: "Rental Start Date",
              value: rental.rental_start_date
                ? moment(rental.rental_start_date).format("DD-MMM-YYYY")
                : "-",
            },
            { label: "Number of Months", value: rental.number_of_months || "-" },
            {
              label: "Renewal Period",
              value: rental.renewal_date
                ? moment(rental.renewal_date).format("DD-MMM-YYYY")
                : "-",
            },
            { label: "Description", value: rental.description || "-" },
            { label: "Status", value: rental.rental_status || "-" },
          ].map((item, i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">
                {item.label}
              </span>

              <span
                className={
                  item.label === "Status"
                    ? item.value === "Active"
                      ? "text-green-600 font-semibold"
                      : item.value === "Inactive"
                        ? "text-red-600 font-semibold"
                        : "text-gray-800"
                    : "text-gray-800"
                }
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-semibold mb-4">Rent Payment History</h2>

        {/* Payment Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b border-t">
              <tr>
                <th className="p-2 text-center">Sl. No</th>
                <th className="p-2 text-center">Date</th>
                <th className="p-2 text-center">Rent Paid</th>
              </tr>
            </thead>

            <tbody>
              {loadingPayments ? (
                <tr>
                  <td colSpan="3" className="text-center p-3">
                    Loading...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center p-3 text-gray-500">
                    No rent payments yet.
                  </td>
                </tr>
              ) : (
                payments.map((p, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2 text-center">{(CurrentPage - 1) * 10 + (i + 1)}</td>
                    <td
                      className={`p-2 text-center ${Number(moment(p.date).format("DD")) > billingCycleDay
                          ? "text-red-600 font-semibold"
                          : "text-gray-800"
                        }`}
                    >
                      {moment(p.date).format("DD-MMM-YYYY")}
                    </td>
                    <td className="p-2 text-center">₹ {p.amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="relative flex items-center justify-center mt-4 space-x-3 select-none">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={CurrentPage === 1} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">Previous</button>
          <button className="px-4 py-2 bg-lavender--600 text-white rounded">{CurrentPage}</button>
          <button onClick={() => setCurrentPage((p) => Math.min(TotalPages || p + 1, p + 1))} disabled={CurrentPage === TotalPages} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">Next</button>

          <div className="absolute right-2 flex space-x-2 px-4">
            <span className="px-4 py-2 bg-gray-100 rounded">Total Pages: {TotalPages}</span>
            <span onClick={() => TotalPages !== CurrentPage && setCurrentPage(TotalPages)} className={`${TotalPages === CurrentPage ? "opacity-50 cursor-not-allowed bg-gray-100 px-4 py-2" : "px-4 py-2 text-blue-600 bg-gray-100 rounded cursor-pointer"}`}>Last Page</span>
          </div>
        </div>
      </div>
      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}
    </>
  );
};
