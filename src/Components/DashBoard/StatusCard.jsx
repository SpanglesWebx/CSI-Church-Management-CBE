// import React, { useEffect, useState } from "react";
// import Spinners from "../Spinners";

// function StatsCard({ title, value, icon, loading }) {
//   const [displayValue, setDisplayValue] = useState(0);
//   const isImage = typeof icon === "string";

//   useEffect(() => {
//     if (loading) {
//       setDisplayValue(0);
//       return;
//     }

//     let start = 0;
//     const end = Number(value) || 0;

//     if (end === 0) {
//       setDisplayValue(0);
//       return;
//     }

//     const duration = 800; // total animation time (ms)
//     const incrementTime = 20;
//     const steps = duration / incrementTime;
//     const increment = Math.ceil(end / steps);

//     const counter = setInterval(() => {
//       start += increment;
//       if (start >= end) {
//         setDisplayValue(end);
//         clearInterval(counter);
//       } else {
//         setDisplayValue(start);
//       }
//     }, incrementTime);

//     return () => clearInterval(counter);
//   }, [value, loading]);

//   return (
//     <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between border-2 border-lavender--600">
//       <div className="ml-4">
//         {loading ? (
//           <Spinners />
//         ) : (
//           <div className="text-5xl font-bold text-lavender--600">
//             {displayValue}
//           </div>
//         )}
//         <div className="text-sm text-gray-600">{title}</div>
//       </div>

//       <div className="flex-shrink-0 pt-14">
//         {isImage ? (
//           <img
//             src={icon}
//             alt={`${title} icon`}
//             className="w-8 sm:w-10 md:w-12 lg:w-16 h-auto"
//           />
//         ) : (
//           icon
//         )}
//       </div>
//     </div>
//   );
// }

// export default StatsCard;

import React, { useEffect, useState } from "react";
import Spinners from "../Spinners";

function StatsCard({ title, value, icon, loading }) {
  const [displayValue, setDisplayValue] = useState(0);
  const isImage = typeof icon === "string";

  useEffect(() => {
    if (loading) {
      setDisplayValue(0);
      return;
    }

    let start = 0;
    const end = Number(value) || 0;

    if (end === 0) {
      setDisplayValue(0);
      return;
    }

    const duration = 700; // slightly quicker than members
    const incrementTime = 20;
    const steps = duration / incrementTime;
    const increment = Math.ceil(end / steps);

    const counter = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(counter);
      } else {
        setDisplayValue(start);
      }
    }, incrementTime);

    return () => clearInterval(counter);
  }, [value, loading]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border-2 border-lavender--600 flex flex-col justify-between">

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-lavender--600">
          {title}
        </h2>

        <div className="text-lavender--600">
          {isImage ? (
            <img
              src={icon}
              alt={`${title} icon`}
              className="w-6 h-6"
            />
          ) : (
            icon
          )}
        </div>
      </div>

      {/* Value */}
      {loading ? (
        <Spinners />
      ) : (<>
        <div className="text-5xl font-bold text-lavender--600">
          {displayValue}
        </div>
        <div className="text-sm text-gray-600">
          Total Families
        </div>
      </>

      )}
    </div>
  );
}

export default StatsCard;
