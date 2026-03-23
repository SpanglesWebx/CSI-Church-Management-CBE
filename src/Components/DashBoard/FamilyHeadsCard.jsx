import React, { useEffect, useState } from "react";
import Spinners from "../Spinners";
import { FaUserTie } from "react-icons/fa";

function FamilyHeadsCard({ headYes = 0, headNo = 0, loading }) {

    const [yesDisplay, setYesDisplay] = useState(0);
    const [noDisplay, setNoDisplay] = useState(0);

    const animateCount = (end, setter) => {
        let start = 0;

        const duration = 1200;
        const interval = 20;
        const steps = duration / interval;
        const increment = Math.ceil(end / steps);

        const counter = setInterval(() => {
            start += increment;

            if (start >= end) {
                setter(end);
                clearInterval(counter);
            } else {
                setter(start);
            }
        }, interval);
    };

    useEffect(() => {
        if (loading) return;

        animateCount(headYes, setYesDisplay);
        animateCount(headNo, setNoDisplay);

    }, [headYes, headNo, loading]);

    return (
        <div className="bg-white p-5 rounded-lg shadow-md border-2 border-lavender--600 h-full">

            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-lavender--600">Head</h2>
                <FaUserTie size={22} className="text-lavender--600" />
            </div>

            {loading ? (
                <Spinners />
            ) : (
                <div className="flex flex-col items-center justify-center gap-6 py-6">

                    {/* YES */}
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">
                            {yesDisplay.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                            Heads
                        </div>
                    </div>

                    {/* Divider */}
                    {/* <div className="w-12 h-[1px] bg-gray-300"></div> */}

                    {/* NO */}
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">
                            {noDisplay.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Non-Heads
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}

export default FamilyHeadsCard;