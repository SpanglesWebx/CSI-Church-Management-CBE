


import React, { useEffect, useState } from "react";
import Spinners from "../Spinners";
import { FaUsers } from "react-icons/fa6";
import { MdCategory } from "react-icons/md";

function MemberTypesCard({ types = [], loading }) {

  const [typeDisplay, setTypeDisplay] = useState({});

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

    return () => clearInterval(counter);
  };

  useEffect(() => {
    if (loading) return;

    const animators = types.map(t =>
      animateCount(t.count, val =>
        setTypeDisplay(prev => ({ ...prev, [t._id]: val }))
      )
    );

    return () => animators.forEach(fn => fn && fn());

  }, [types, loading]);

  return (
    <div className="bg-white p-5 rounded-lg shadow-md border-2 border-lavender--600 h-full">

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-lavender--600">
          Member Types
        </h2>

        <MdCategory size={22} className="text-lavender--600" />
      </div>

      {loading ? (
        <Spinners />
      ) : (

       
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">

          {types.map((type) => (
            <div
              key={type._id}
              className="text-center rounded-lg p-3 flex flex-col items-center justify-center"
            >
              <div className="text-2xl font-bold text-lavender--600">
                {(typeDisplay[type._id] ?? 0).toLocaleString()}
              </div>

              <div className="text-xs text-gray-600 mt-1 text-center leading-snug max-w-[150px]">
                {type._id}
              </div>
            </div>
          ))}

        </div>

      )}
    </div>
  );
}

export default MemberTypesCard;