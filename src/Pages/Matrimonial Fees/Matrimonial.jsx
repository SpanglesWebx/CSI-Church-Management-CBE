import React, { useEffect, useRef, useState } from "react";
import { FaEye, FaPlus } from "react-icons/fa";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import { URL } from "../../App";
import moment from "moment";
import SmallSizedModal from "../../Components/Expense/SmallSizedModal";

export const Matrimonial = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFeesModalOpen, setIsFeesModalOpen] = useState(false);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const token = window.sessionStorage.getItem("token");
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isMember, setIsMember] = useState(true);
  const [memberIdSearch, setMemberIdSearch] = useState("");
  const [memberNameSearch, setMemberNameSearch] = useState("");
  const [dropdownById, setDropdownById] = useState([]);
  const [dropdownByName, setDropdownByName] = useState([]);
  const [phone, setPhone] = useState("");
  const [memberId, setMemberId] = useState("");
  const [memberName, setMemberName] = useState("");

  // non-member fields
  const [nonMemberName, setNonMemberName] = useState("");
  const [nonMemberPhone, setNonMemberPhone] = useState("");
  const [nonMemberChurch, setNonMemberChurch] = useState("");
  const [nonMemberAddress, setNonMemberAddress] = useState("");

  const [feesAmount, setFeesAmount] = useState("");
  const [feesList, setFeesList] = useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedFeesId, setSelectedFeesId] = useState(null);
  const [description, setDescription] = useState("");



  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedSearchById = useRef(
    debounce(async (val) => {
      if (!val) return setDropdownById([]);
      try {
        const res = await axios.get(`${URL}/member-search/by-id`, {
          headers: { Authorization: token },
          params: { id: val },
        });
        setDropdownById(res.data || []);
      } catch (err) {
        setDropdownById([
          { member_id: "none", member_name: "No members found" },
        ]);
      }
    }, 300)
  ).current;

  const debouncedSearchByName = useRef(
    debounce(async (val) => {
      if (!val) return setDropdownByName([]);
      try {
        const res = await axios.get(`${URL}/member-search`, {
          headers: { Authorization: token },
          params: { name: val },
        });
        setDropdownByName(res.data || []);
      } catch (err) {
        setDropdownByName([
          { member_id: "none", member_name: "No members found" },
        ]);
      }
    }, 300)
  ).current;

  const fetchMatrimonialFeesList = async () => {
    try {
      const res = await axios.get(`${URL}/matrimonial-fees/list`, {
        headers: { Authorization: token }
      });
      setFeesList(res.data.data || []);
    } catch (err) {
      console.log("Error fetching fees", err);
    }
  };

  useEffect(() => {
    if (isFeesModalOpen) fetchMatrimonialFeesList();
  }, [isFeesModalOpen]);

  const saveMatrimonialFees = async () => {
    if (!feesAmount || isNaN(feesAmount)) {
      setResponse({ status: "Failed", message: "Enter valid amount" });
      return;
    }

    try {
      const res = await axios.post(
        `${URL}/matrimonial-fees/add`,
        { amount: Number(feesAmount) },
        { headers: { Authorization: token } }
      );

      setResponse({ status: "Success", message: res.data.message });
      setFeesAmount("");
      fetchMatrimonialFeesList();
    } catch (err) {
      setResponse({ status: "Failed", message: "Failed to save fees" });
    }

    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  };

  const handleToggleFees = async () => {
    if (!selectedFeesId) return;

    try {
      await axios.patch(
        `${URL}/matrimonial-fees/toggle/${selectedFeesId}`,
        {},
        { headers: { Authorization: token } }
      );

      setResponse({ status: "Success", message: "Status updated" });
      fetchMatrimonialFeesList();
    } catch (err) {
      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Error updating"
      });
    }

    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    setIsConfirmOpen(false);
    setSelectedFeesId(null);
  };

  const canCloseFeesModal = () => {
    const activeCount = feesList.filter(x => x.isActive).length;
    if (activeCount !== 1) {
      setResponse({
        status: "Failed",
        message: "Exactly one active fees must remain."
      });
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
      return false;
    }
    return true;
  };

  useEffect(() => {
  if (isModalOpen) {
    loadActiveFees();
  }
}, [isModalOpen]);

const loadActiveFees = async () => {
  try {
    const res = await axios.get(`${URL}/matrimonial-fees/active`, {
      headers: { Authorization: token }
    });
    setFeesAmount(res.data.data?.amount || "");
  } catch (err) {
    console.log("Error loading active fee", err);
  }
};

const saveMatrimonialEntry = async () => {
  try {
    const payload = {
      isMember,
      member_id,
      member_name: memberName,
      phone,
      nonMemberName,
      nonMemberPhone,
      nonMemberChurch,
      nonMemberAddress,
      description,
      
    };

    const res = await axios.post(`${URL}/matrimonial/add`, payload, {
      headers: { Authorization: token }
    });

    setResponse({ status: "Success", message: res.data.message });
    setIsModalOpen(false);

  } catch (err) {
    setResponse({
      status: "Failed",
      message: "Failed to save"
    });
  }

  setTimeout(() => setResponse({ status: null, message: "" }), 3000);
};

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg font-semibold">Matrimony</h1>
        <div className="flex items-center justify-between p-2">
          <div className="">
            <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                <svg className="w-3 h-3 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input
                type="search"
                id="default-search"
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-lavender--600 dark:focus:border-lavender--600"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
            <label className="text-l font-medium text-gray-600 mb-1">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
            />
            <label className="text-l font-medium text-gray-600 mb-1">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
            />
          </div>
          <button onClick={() => setIsFeesModalOpen(true)} className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg">
            <FaPlus /> Fees
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg">
            <FaPlus /> Person
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Member Name</th>
                <th className="p-2 text-center">Fees</th>
                <th className="p-2 text-center">Date</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
          </table>
        </div>

        <div className="relative flex flex-wrap items-center justify-center mt-4 space-x-3 select-none ">
          <button onClick={() => setCurrentPage(CurrentPage - 1)} disabled={CurrentPage === 1} className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50">
            Previous
          </button>
          <button className={`px-4 py-2 rounded ${CurrentPage ? "bg-lavender--600 text-white" : "bg-gray-200 text-gray-700"}`}>
            {CurrentPage}
          </button>
          <button onClick={() => setCurrentPage(CurrentPage + 1)} disabled={CurrentPage === TotalPages || TotalPages === 0} className="px-4 py-2 w-[100px] text-gray-700 bg-gray-200 rounded disabled:opacity-50">
            Next
          </button>
          <div className="absolute flex px-5 space-x-2 rounded right-1 ">
            <span className="px-4 py-2 text-center text-gray-700 bg-gray-100 rounded">Total Page: <span>{TotalPages}</span></span>
            <span onClick={() => setCurrentPage(TotalPages)} className={`${TotalPages === CurrentPage ? 'disabled opacity-50  bg-gray-100 px-4 py-2 cursor-not-allowed' : 'px-4 py-2 text-blue-400 bg-gray-100 rounded active:text-blue-800 hover:cursor-pointer'} `}>
              Last Page
            </span>
          </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Service">
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="mb-4 flex justify-end">
              <div className="relative flex bg-gray-200 rounded-full p-1 text-sm font-medium w-56">
                <div
                  className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
                  style={{
                    width: "calc(50% - 0.25rem)",
                    transform: isMember ? "translateX(0)" : "translateX(100%)",
                  }}
                />
                <button type="button" onClick={() => {
                  setIsMember(true); setMemberIdSearch(""); setMemberNameSearch(""); setDropdownById([]); setDropdownByName([]);
                }} className={`relative flex-1 py-1 text-center rounded-full ${isMember ? "text-white" : "text-gray-700"}`}>Member</button>
                <button type="button" onClick={() => {
                  setIsMember(false); setMemberIdSearch(""); setMemberNameSearch(""); setDropdownById([]); setDropdownByName([]);
                }} className={`relative flex-1 py-1 text-center rounded-full ${!isMember ? "text-white" : "text-gray-700"}`}>Non-Member</button>
              </div>
            </div>

            {isMember ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Member ID</label>
                  <input type="text" placeholder="Search ID" value={memberIdSearch}
                    onChange={(e) => { setMemberIdSearch(e.target.value); debouncedSearchById(e.target.value); }}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Member Name</label>
                  <input type="text" placeholder="Search Name" value={memberNameSearch}
                    onChange={(e) => { setMemberNameSearch(e.target.value); debouncedSearchByName(e.target.value); }}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <input type="text" value={phone} readOnly className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100" />
                </div>

                {(dropdownById.length > 0 || dropdownByName.length > 0) && (
                  <ul className="absolute left-1/2 -translate-x-1/2 mt-[75px] w-[85%] bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {(dropdownById.length > 0 ? dropdownById : dropdownByName).map(m => (
                      <li key={m.member_id}
                        className={`flex px-3 py-2 text-sm ${m.member_id === "none" ? "text-gray-500 cursor-default" : "hover:bg-indigo-50 cursor-pointer"}`}
                        onClick={() => {
                          if (m.member_id === "none") return;
                          setMemberIdSearch(m.member_id);
                          setMemberNameSearch(m.member_name);
                          setPhone(m.mobile_number || "");
                          setMemberId(m.member_id);
                          setMemberName(m.member_name);
                          setDropdownById([]); setDropdownByName([]);
                        }}>
                        <span className="w-[250px] font-medium">{m.member_id}</span>
                        <span className="flex-1">{m.member_name}</span>
                        <span className="w-[200px] text-gray-500">{m.mobile_number}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">

                {/* LEFT SIDE */}
                <div className="flex flex-col space-y-4">

                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      placeholder="Enter Name"
                      value={nonMemberName}
                      onChange={(e) => setNonMemberName(e.target.value)}
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="text"
                      placeholder="Enter Phone"
                      maxLength={10}
                      value={nonMemberPhone}
                      onChange={(e) => setNonMemberPhone(e.target.value.replace(/\D/g, ""))}
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Church Name</label>
                    <input
                      type="text"
                      placeholder="Enter Church Name"
                      value={nonMemberChurch}
                      onChange={(e) => setNonMemberChurch(e.target.value)}
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>

                </div>

                {/* RIGHT SIDE */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    placeholder="Enter Address"
                    rows={9}
                    value={nonMemberAddress}
                    onChange={(e) => setNonMemberAddress(e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm overflow-y-auto resize-none"
                    style={{ maxHeight: "12.5rem" }}
                  ></textarea>
                </div>

              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fees</label>
              <input type="text" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" value={feesAmount}
                readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input type="text" placeholder="Enter Description" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" value={description}
                onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={saveMatrimonialEntry} className="px-4 py-2 bg-lavender--600 text-white rounded-md">Save</button>
          </div>
        </Modal>

        <SmallSizedModal
          isOpen={isFeesModalOpen}
          onClose={() => {
            if (!canCloseFeesModal()) return;
            setIsFeesModalOpen(false);
          }}
          title="Add Matrimonial Fees"
        >
          <div className="max-h-[400px] overflow-y-auto">

            <div className="grid grid-cols-1 gap-4 mb-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Fees</label>
                <input
                  type="text"
                  placeholder="Enter Amount"
                  value={feesAmount}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value)) setFeesAmount(e.target.value);
                  }}
                  className="block w-full mt-1 border-gray-300 rounded-md sm:text-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm text-gray-500">
                <thead className="text-base text-gray-700 border-b">
                  <tr>
                    <th className="p-2 text-center">Sl No.</th>
                    <th className="p-2 text-center">Fees</th>
                    <th className="p-2 text-center">Date</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {feesList.map((item, index) => (
                    <tr key={item._id}>
                      <td className="p-2 text-center">{index + 1}</td>
                      <td className="p-2 text-center">{item.amount}</td>
                      <td className="p-2 text-center">{moment(item.date).format("DD-MM-YYYY")}</td>
                      <td className="p-2 text-center">

                        {item.isActive ? (
                          <button
                            onClick={() => {
                              setSelectedFeesId(item._id);
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

            <div className="flex justify-end mt-4">
              <button
                onClick={saveMatrimonialFees}
                className="px-4 py-2 bg-lavender--600 text-white rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </SmallSizedModal>

        <SmallSizedModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          title="Confirm Action"
        >
          <p className="text-gray-700 text-center my-4">
            Do you really want to mark this fee as{" "}
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
              onClick={handleToggleFees}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Yes
            </button>
          </div>
        </SmallSizedModal>


      </div>

      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}
    </>
  )
}
