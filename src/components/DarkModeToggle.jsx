import { useEffect, useState } from "react";

function ThemeToggle() {

  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {

    const root = window.document.documentElement;

    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

  }, [dark]);

  return (

    <button
      onClick={() => setDark(!dark)}
      className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600 transition"
    >
      {dark ? "🌞" : "🌙"}
    </button>

  );
}

export default ThemeToggle;
