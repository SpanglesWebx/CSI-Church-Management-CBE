import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const el = document.getElementById("main-scroll");

    if (el) {
      el.scrollTo({
        top: 0,
        behavior: "instant"
      });
    }
  }, [pathname]);

  return null;
}