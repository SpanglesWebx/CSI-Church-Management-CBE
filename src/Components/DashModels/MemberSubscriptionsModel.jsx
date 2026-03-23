import React, { useEffect, useState } from "react";
import { URL } from "../../App";
import { FaTimes } from "react-icons/fa";

const months = [
    "april", "may", "june", "july", "august", "september",
    "october", "november", "december", "january", "february", "march"
];

const contributionTypes = [
    { label: "Monthly Subscription", key: "monthlySubscriptionOffering" },
    { label: "Building Fund", key: "buildingFund" },
    { label: "Missionary Sponsorship", key: "missionarySponsorship" },
    { label: "Tithe", key: "decimalPart" },
    { label: "IMS", key: "ims" },
    { label: "FMPB", key: "fmpb" },
    { label: "NMS", key: "nms" },
    { label: "IEM", key: "iem" },
    { label: "Vishwavani", key: "vishwavani" },
    { label: "BYM", key: "bym" },
    { label: "DBM", key: "dbm" },
    { label: "CGMM", key: "cgmm" },
    { label: "CMM", key: "cmm" },
    { label: "YMM", key: "ymm" },
    { label: "Bible Society", key: "bibleSociety" },
    { label: "Womens Ministry", key: "womensMinistry" },
    { label: "Educational Asst.", key: "educationalAssistance" },
    { label: "Help the Poor", key: "helpThePoor" },
    { label: "Medical Asst.", key: "medicalAssistance" },
    { label: "Auction Balance", key: "harvestAuction" },
];

export const MemberSubscriptionsModel = ({ isOpen, onClose, memberId }) => {

    const token = sessionStorage.getItem("token");
    const [data, setData] = useState(null);

    useEffect(() => {

        if (!isOpen) return;

        const fetchData = async () => {
            const encodedId = encodeURIComponent(memberId);

            const res = await fetch(
                `${URL}/dashboard/subscriptions/view?member_id=${encodedId}`,
                {
                    headers: { Authorization: token }
                }
            );

            const result = await res.json();
            setData(result);
        };

        fetchData();

    }, [isOpen, memberId, token]);


    if (!isOpen) return null;

    const currentSubscription = data?.subscriptions?.[0];

    return (

        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">

            <div className="bg-white w-[95%] max-h-[90vh] overflow-auto rounded-lg shadow-lg">

                <div className="flex justify-between items-center p-4 border-b">

                    <h2 className="text-lg font-semibold text-lavender--600">
                        Subscription Details
                    </h2>

                    <button onClick={onClose}>
                        <FaTimes />
                    </button>

                </div>

                <div className="p-4 overflow-x-auto">

                    <table className="w-full text-xs text-left border-collapse">

                        <thead>
                            <tr className="bg-lavender--50 border-b">

                                <th className="p-3  border-r font-bold sticky left-0 bg-lavender--50 z-10 w-40">
                                    Contributions
                                </th>

                                {months.map((m) => (
                                    <th key={m} className="p-3 text-center border-r capitalize">
                                        {m.substring(0, 3)}
                                    </th>
                                ))}

                                <th className="p-3 text-center font-bold bg-green-50">
                                    Total
                                </th>

                            </tr>
                        </thead>

                        <tbody>

                            {contributionTypes.map((type) => {

                                let rowTotal = 0;

                                return (

                                    <tr key={type.key} className="border-b hover:bg-gray-50">

                                        <td className="p-3 border-r font-medium sticky left-0 bg-white z-10">
                                            {type.label}
                                        </td>

                                        {months.map((m) => {

                                            const monthData = currentSubscription?.[m];

                                            const amount =
                                                monthData?.allocations?.reduce(
                                                    (sum, a) => sum + (a[type.key] || 0), 0
                                                ) || 0;

                                            rowTotal += amount;

                                            return (
                                                <td key={m} className="p-3  text-lavender--600 text-center font-bold border-r">
                                                    {amount || "-"}
                                                </td>
                                            );

                                        })}

                                        <td className="p-3 text-center font-bold bg-green-50">
                                            {rowTotal || "-"}
                                        </td>

                                    </tr>

                                );

                            })}

                        </tbody>


                        <tfoot>
                            <tr className="bg-green-50 font-bold">

                                <td className="p-3 border-r sticky left-0 bg-green-50">
                                    Monthly Total
                                </td>

                                {months.map((m) => { 

                                    const monthData = currentSubscription?.[m];

                                    const total =
                                        monthData?.allocations?.reduce(
                                            (sum, a) => sum + (a.total || 0),
                                            0
                                        ) || 0;

                                    return (
                                        <td key={m} className="p-3 text-center border-r text-gray-900">
                                            {total || "-"}
                                        </td>
                                    );
                                })}

                                <td className="p-3 text-center text-lavender--700 bg-lavender--100">
                                    {currentSubscription?.total_received || "-"}
                                </td>

                            </tr>
                        </tfoot>

                    </table>

                </div>

            </div>

        </div>

    );
};