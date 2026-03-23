import { useEffect, useRef, useState } from "react";

export default function SessionTimeout({ onTimeout }) {
  const timer = useRef(null);
  const TIME_LIMIT = 30 * 60 * 1000; // 1 min testing
  const [token, setToken] = useState(sessionStorage.getItem("token"));

  useEffect(() => {
    const interval = setInterval(() => {
      const newToken = sessionStorage.getItem("token");
      if (newToken !== token) {
        setToken(newToken);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const logout = () => onTimeout();

    const resetTimer = () => {
      clearTimeout(timer.current);
      timer.current = setTimeout(logout, TIME_LIMIT);
    };

    const events = ["mousemove","keydown","scroll","click","touchstart"];

    events.forEach((e) => window.addEventListener(e, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(timer.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [token]);

  return null;
}