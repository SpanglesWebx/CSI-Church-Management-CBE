import React, { useEffect, useState } from 'react'
import { FaEye, FaPlus } from 'react-icons/fa'
import Modal from "../../Components/Expense/ExpenseFormModal";
import { URL } from "../../App";
import axios from 'axios';

export const ServiceActivities = () => {
    const [serviceModal, setServiceModal] = useState(false);
    const [notificationModal, setNotificationModal] = useState(false);
    const [CurrentPage, setCurrentPage] = useState(1);
    const [TotalPages, setTotalPages] = useState(1);
    const [viewModal, setViewModal] = useState(false);
    const [showTextarea, setShowTextarea] = useState(false);
    const [showNotifTextarea, setShowNotifTextarea] = useState(false);
    const [serviceDate, setServiceDate] = useState("");
    const [notificationDate, setNotificationDate] = useState("");
    const [serviceDay, setServiceDay] = useState("");
    const [notificationDay, setNotificationDay] = useState("");
    const [heading, setHeading] = useState("");
    const [title, setTitle] = useState("");
    const [notes, setNotes] = useState("");
    const [points, setPoints] = useState([]);
    const [notifTitle, setNotifTitle] = useState("");
    const [notifNotes, setNotifNotes] = useState("");
    const [notifPoints, setNotifPoints] = useState([]);
    const [activities, setActivities] = useState([]);
    const token = window.sessionStorage.getItem("token");
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");




    const handleOpenServiceModal = () => {
        setServiceModal(true);
        reset();
    };

    const handleCloseServiceModal = () => setServiceModal(false);

    const handleOpenNotificationModal = () => {
        setNotificationModal(true);
        reset();
    };

    const handleCloseNotificationModal = () => setNotificationModal(false);

    const handleOpenViewModal = () => {
        setViewModal(true);
        reset();
    };

    const handleCloseViewModal = () => setViewModal(false);



    useEffect(() => {
        const today = new Date();
        const isoDate = today.toISOString().split("T")[0]; // YYYY-MM-DD
        setServiceDate(isoDate);

        const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
        setServiceDay(dayName);
    }, []);

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setServiceDate(newDate);

        if (newDate) {
            const dayName = new Date(newDate).toLocaleDateString("en-US", {
                weekday: "long",
            });
            setServiceDay(dayName);
        } else {
            setServiceDay("");
        }
    };

    useEffect(() => {
        const today = new Date();
        const isoDate = today.toISOString().split("T")[0]; // YYYY-MM-DD
        setNotificationDate(isoDate);

        const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
        setNotificationDay(dayName);
    }, []);

    const handleNotificationDateChange = (e) => {
        const newDate = e.target.value;
        setNotificationDate(newDate);

        if (newDate) {
            const dayName = new Date(newDate).toLocaleDateString("en-US", {
                weekday: "long",
            });
            setNotificationDay(dayName);
        } else {
            setNotificationDay("");
        }
    };

    const handleAddPoint = () => {
        if (!title && !notes) return;

        setPoints([...points, { title, notes }]);
        setTitle("");
        setNotes("");
        setShowTextarea(true);
    };
    const handleAddNotifPoint = () => {
        if (!notifTitle) return;

        setNotifPoints([
            ...notifPoints,
            { title: notifTitle, notes: showNotifTextarea ? notifNotes : "" },
        ]);

        // reset after adding
        setNotifTitle("");
        setNotifNotes("");
        setShowNotifTextarea(true);
    };

    // 👉 Fetch activities
    // const fetchActivities = async () => {
    //     try {
    //         const res = await axios.get(
    //             `${URL}/serviceactivity/activities?page=${CurrentPage}&limit=10`,
    //             {
    //                 headers: { Authorization: token },
    //             }
    //         );
    //         setActivities(res.data.activities);
    //         setTotalPages(res.data.totalPages);
    //     } catch (error) {
    //         console.error("Error fetching activities:", error);
    //     }
    // };

    const fetchActivities = async () => {
        try {
            const params = {
                page: CurrentPage,
                limit: 10,
            };
            if (fromDate) params.from = fromDate;
            if (toDate) params.to = toDate;
            if (search) params.search = search;
            if (status && status !== "All") params.type = status;

            const res = await axios.get(`${URL}/serviceactivity/activities`, {
                headers: { Authorization: token },
                params,
            });

            setActivities(res.data.activities);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error("Error fetching activities:", error);
        }
    };


    useEffect(() => {
        fetchActivities();
    }, [CurrentPage, fromDate, toDate, search, status]);

    // 👉 Save Service Notes
    const handleSaveService = async () => {
        const payload = {
            type: "service",
            date: serviceDate,
            day: serviceDay,
            heading,
            points
        };

        try {
            await axios.post(`${URL}/serviceactivity/activities`, payload, {
                headers: { Authorization: token },
            });
            setServiceModal(false);
            fetchActivities();
        } catch (error) {
            console.error("Error saving service notes:", error);
        }
    };

    // 👉 Save Notifications
    const handleSaveNotification = async () => {
        const payload = {
            type: "notification",
            date: notificationDate,
            day: notificationDay,
            points: notifPoints
        };

        try {
            await axios.post(`${URL}/serviceactivity/activities`, payload, {
                headers: { Authorization: token },
            });
            setNotificationModal(false);
            fetchActivities();
        } catch (error) {
            console.error("Error saving notification:", error);
        }
    };



 

    return (
        <>
            <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
                <div className="flex flex-col items-center justify-between lg:flex-row">
                    <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">

                        <label className="text-l font-medium text-gray-600 mb-1">From</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 
                         border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
                        />

                        <label className="text-l font-medium text-gray-600 mb-1">To</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 
                         border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
                        />
                        <div>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
                            >
                                <option value="All">All</option>
                                <option value="notification">Notification</option>
                                <option value="service">Service Notes</option>
                            </select>
                        </div>


                    </div>


                    <div className="flex w-full gap-x-4 lg:w-auto">
                        <button className="flex items-center w-full gap-2 px-4 py-1.5 text-white bg-lavender--600 rounded-lg lg:w-auto" onClick={handleOpenServiceModal}>
                            <FaPlus /> Add Service Notes
                        </button>
                        <button className="flex items-center w-full gap-2 px-4 py-1.5 text-white bg-lavender--600 rounded-lg lg:w-auto" onClick={handleOpenNotificationModal}>
                            <FaPlus /> Add Notifications
                        </button>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-between lg:flex-row">

                </div>



                <div className="overflow-x-auto mt-8">
                    <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
                        <thead className="text-base text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-400 text-center">
                            <tr>
                                <th className="p-2 text-center">Sl No.</th>
                                <th className="p-2 text-center">Date</th>
                                <th className="p-2 text-center">Day</th>
                                <th className="p-2 text-center">Service Notes / Notifications</th>
                                <th className="p-2 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {activities.length > 0 ? (
                                activities.map((item, index) => (
                                    <tr key={item._id} className="border-b">
                                        <td className="p-2">{(CurrentPage - 1) * 10 + index + 1}</td>
                                        <td className="p-2">
                                            {new Date(item.date).toLocaleDateString("en-GB")}
                                        </td>
                                        <td className="p-2">{item.day}</td>
                                        <td className="p-2">
                                            {item.type === "service" ? "Service Notes" : "Notification"}
                                        </td>
                                        <td className="p-2 text-center">
                                            <FaEye
                                                size={18}
                                                className="cursor-pointer text-blue-600 hover:text-blue-800 inline-block"
                                                onClick={() => {
                                                    setSelectedActivity(item); // pass the current row activity
                                                    handleOpenViewModal();
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-4 text-gray-500">
                                        No Data Found
                                    </td>
                                </tr>
                            )}
                        </tbody>


                    </table>
                </div>

                <div className="relative flex flex-wrap items-center justify-center mt-4 space-x-3 select-none ">
                    <button
                        onClick={() => setCurrentPage(CurrentPage - 1)}
                        disabled={CurrentPage === 1}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        className={`px-4 py-2 rounded ${CurrentPage
                            ? "bg-lavender--600 text-white"
                            : "bg-gray-200 text-gray-700"
                            }`}
                    >
                        {CurrentPage}
                    </button>
                    <button
                        onClick={() => setCurrentPage(CurrentPage + 1)}
                        disabled={CurrentPage === TotalPages || TotalPages === 0}
                        className="px-4 py-2 w-[100px] text-gray-700 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                    <div className="absolute flex px-5 space-x-2 rounded right-1 ">
                        <span className="px-4 py-2 text-center text-gray-700 bg-gray-100 rounded" >Total Page: <span >{TotalPages}</span>
                        </span>
                        <span
                            onClick={() => setCurrentPage(TotalPages)}
                            className={`${TotalPages === CurrentPage ? 'disabled opacity-50  bg-gray-100 px-4 py-2 cursor-not-allowed' : 'px-4 py-2 text-blue-400 bg-gray-100 rounded active:text-blue-800 hover:cursor-pointer'} `}
                        >
                            Last Page
                        </span>
                    </div>
                </div>
            </div>



            {/* Service notes MOdal */}
            <Modal isOpen={serviceModal} onClose={handleCloseServiceModal} title="Add Service Notes">
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="servicedate" className="block text-sm font-medium text-gray-700">
                                Date
                            </label>
                            <input
                                id="servicedate"
                                type="date"
                                value={serviceDate}
                                onChange={handleDateChange}
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-lavender--600 focus:ring-lavender--600 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="serviceday" className="block text-sm font-medium text-gray-700">
                                Day
                            </label>
                            <input
                                id="serviceday"
                                type="text"
                                value={serviceDay}
                                readOnly
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-lavender--600 focus:ring-lavender--600 sm:text-sm"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                        <div>
                            <label htmlFor="heading" className="block text-sm font-medium text-gray-700">
                                Heading
                            </label>
                            <input
                                id="heading"
                                type="text"
                                value={heading}
                                onChange={(e) => setHeading(e.target.value)}
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-lavender--600 focus:ring-lavender--600 sm:text-sm"
                            />
                        </div>

                    </div>
                    <div className="p-4 border rounded-lg bg-gray-50">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                Title
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-lavender--600 focus:ring-lavender--600 sm:text-sm"
                            />
                        </div>
                        <div className=" mt-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <div className="text-lg fw-medium text-gray-700">
                                    {showTextarea && <label className="mb-0">Notes</label>}
                                </div>

                                <div className="form-check mb-0">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="showNotes"
                                        checked={showTextarea}
                                        onChange={() => setShowTextarea(!showTextarea)}
                                    />
                                    <label className="form-check-label" htmlFor="showNotes">
                                        Add Notes
                                    </label>
                                </div>
                            </div>

                            {showTextarea && (
                                <textarea
                                    rows={4}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="form-control mt-2 border-gray-300 rounded-md shadow-sm"
                                    placeholder="Enter your notes here..."
                                />
                            )}
                        </div>
                        <div className="flex justify-end">
                            <button className="flex items-center w-full gap-2 px-4 py-1.5 mt-[25px] text-white bg-lavender--600 rounded-lg lg:w-auto" type="button" onClick={handleAddPoint}>
                                <FaPlus /> Add Point
                            </button>
                        </div>
                    </div>
                    <div className="p-6 border bg-white shadow-inner rounded-md min-h-[400px]">
                        {heading && <h2 className="text-center text-lg font-bold mb-4">{heading}</h2>}
                        {serviceDate && serviceDay && (
                            <p className="text-sm">
                                <span className="font-semibold">Date:</span>{" "}
                                {new Date(serviceDate).toLocaleDateString("en-GB")} {" "}
                                <span className="font-semibold">Day:</span> {serviceDay}
                            </p>
                        )}
                        <div className="mt-4 space-y-3">
                            {points.map((point, index) => (
                                <div key={index}>
                                    {/* Serial number + Title */}
                                    <p className="font-semibold">
                                        {index + 1}. {point.title}
                                    </p>

                                    {/* Notes (only if added) */}
                                    {point.notes && (
                                        <p className="text-sm text-gray-700 ml-6">{point.notes}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-lavender--600 text-white rounded-md"
                            onClick={handleSaveService}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Notification Notes Modal */}
            <Modal isOpen={notificationModal} onClose={handleCloseNotificationModal} title="Add Service Notifications">
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="notifidate" className="block text-sm font-medium text-gray-700">
                                Date
                            </label>
                            <input
                                id="notifydate"
                                type="date"
                                value={notificationDate}
                                onChange={handleNotificationDateChange}
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-lavender--600 focus:ring-lavender--600 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="notifyday" className="block text-sm font-medium text-gray-700">
                                Day
                            </label>
                            <input
                                id="notifyday"
                                type="text"
                                value={notificationDay}
                                readOnly
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-lavender--600 focus:ring-lavender--600 sm:text-sm"
                            />
                        </div>
                    </div>
                    <div className="p-4 border rounded-lg bg-gray-50">
                        <div>
                            <label htmlFor="notificationtitle" className="block text-sm font-medium text-gray-700">
                                Title
                            </label>
                            <input
                                id="notificationtitle"
                                type="text"
                                value={notifTitle}
                                onChange={(e) => setNotifTitle(e.target.value)}
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-lavender--600 focus:ring-lavender--600 sm:text-sm"
                            />
                        </div>
                        <div className=" mt-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <div className="text-lg fw-medium text-gray-700">
                                    {showNotifTextarea && <label className="mb-0">Notes</label>}
                                </div>

                                <div className="form-check mb-0">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="showNotifNotes"
                                        checked={showNotifTextarea}
                                        onChange={() => setShowNotifTextarea(!showNotifTextarea)}
                                    />
                                    <label className="form-check-label" htmlFor="showNotes">
                                        Add Notes
                                    </label>
                                </div>
                            </div>

                            {showNotifTextarea && (
                                <textarea
                                    rows={4}
                                    value={notifNotes}
                                    onChange={(e) => setNotifNotes(e.target.value)}
                                    className="form-control mt-2 border-gray-300 rounded-md shadow-sm"
                                    placeholder="Enter your notes here..."
                                />
                            )}
                        </div>
                        <div className="flex justify-end">
                            <button className="flex items-center w-full gap-2 px-4 py-1.5 mt-[25px] text-white bg-lavender--600 rounded-lg lg:w-auto" type="button" onClick={handleAddNotifPoint}>
                                <FaPlus /> Add Point
                            </button>
                        </div>
                    </div>
                    <div className="p-6 border bg-white shadow-inner rounded-md min-h-[300px]">
                        {notificationDate && notificationDay && (
                            <p className="text-sm">
                                <span className="font-semibold">Date:</span>{" "}
                                {new Date(notificationDate).toLocaleDateString("en-GB")}{" "}
                                <span className="font-semibold">Day:</span> {notificationDay}
                            </p>
                        )}
                        <div className="mt-4 space-y-3">
                            {notifPoints.map((point, index) => (
                                <div key={index}>
                                    <p className="font-semibold">{index + 1}. {point.title}</p>
                                    {point.notes && (
                                        <p className="text-sm text-gray-700 ml-6">{point.notes}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-lavender--600 text-white rounded-md"
                            onClick={handleSaveNotification}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </Modal>

            {/* View Modal */}
            <Modal isOpen={viewModal} onClose={handleCloseViewModal} title="View">
                {selectedActivity && (
                    <div>
                        <h2 className="text-lg font-bold mb-2">
                            {selectedActivity.type === "service" ? "Service Notes" : "Notification"}
                        </h2>
                        <p>Date: {new Date(selectedActivity.date).toLocaleDateString("en-GB")}</p>
                        <p>Day: {selectedActivity.day}</p>
                        {selectedActivity.heading && <p>Heading: {selectedActivity.heading}</p>}
                        <div className="mt-3">
                            {selectedActivity.points.map((p, i) => (
                                <div key={i}>
                                    <p className="font-semibold">{i + 1}. {p.title}</p>
                                    {p.notes && <p className="ml-6">{p.notes}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </Modal>
        </>

    )
}
