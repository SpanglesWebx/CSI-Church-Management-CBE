import { useEffect, useState } from "react";

const AnimatedAmount = ({ value, duration = 1800 }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Number(value) || 0;

    if (end === 0) {
      setDisplay(0);
      return;
    }

    const interval = 20;
    const step = Math.ceil(end / (duration / interval));

    const counter = setInterval(() => {
      start += step;

      if (start >= end) {
        setDisplay(end);
        clearInterval(counter);
      } else {
        setDisplay(start);
      }
    }, interval);

    return () => clearInterval(counter);
  }, [value, duration]);

  return <span>₹ {display.toLocaleString()}</span>;
};

export default AnimatedAmount;