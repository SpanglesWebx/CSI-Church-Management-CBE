import React, { useEffect, useState } from "react";
import Spinners from "../Spinners";
import { FiUsers } from "react-icons/fi";

function MembersSummaryCard({
  subscribed,
  total,
  loading,
}) {
  const [subscribedDisplay, setSubscribedDisplay] = useState(0);
  const [totalDisplay, setTotalDisplay] = useState(0);

  const animate = (end, setter) => {
    let start = 0;
    if (end === 0) {
      setter(0);
      return;
    }

    const duration = 1500;
    const interval = 20;
    const step = Math.ceil(end / (duration / interval));

    const counter = setInterval(() => {
      start += step;
      if (start >= end) {
        setter(end);
        clearInterval(counter);
      } else {
        setter(start);
      }
    }, interval);

    return () => clearInterval(counter);
  };

  useEffect(() => {
    if (loading) {
      setSubscribedDisplay(0);
      setTotalDisplay(0);
      return;
    }

    const clear1 = animate(subscribed, setSubscribedDisplay);
    const clear2 = animate(total, setTotalDisplay);

    return () => {
      clear1 && clear1();
      clear2 && clear2();
    };
  }, [subscribed, total, loading]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border-2 border-lavender--600 flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-lavender--600">
          Members
        </h2>
        <FiUsers size={36} color="#8aaee0" />
      </div>

      {/* Content */}
      {loading ? (
        <Spinners />
      ) : (
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-5xl font-bold text-lavender--600">
              {subscribedDisplay}
            </div>
            <div className="text-sm text-gray-600">
              Subscribed Members
            </div>
          </div>

          <div>
            <div className="text-5xl font-bold text-lavender--600">
              {totalDisplay}
            </div>
            <div className="text-sm text-gray-600">
              Total Members
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MembersSummaryCard;
