import { Link } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";
import { auth } from "../firebase/config";

function Navbar() {

    const logout = () => {
        auth.signOut();
    };

    return (
        <nav
            className="
            bg-white dark:bg-slate-800
            text-gray-900 dark:text-white
            border-b border-gray-200 dark:border-white/10
            px-3 sm:px-6 py-2 sm:py-3
            transition-colors
            "
        >
            {/* LEFT MENU */}
            <div
                className="
                flex flex-wrap items-center
                gap-3 sm:gap-6
                text-[11px] sm:text-sm font-medium
                "
            >
                <Link to="/" className="hover:text-blue-400">
                    Dashboard
                </Link>

                <Link to="/cf" className="hover:text-blue-400">
                    CF
                </Link>

                <Link to="/gate" className="hover:text-blue-400">
                    GATE
                </Link>

                <Link to="/study" className="hover:text-blue-400">
                    Study
                </Link>

                <Link to="/goals" className="hover:text-blue-400">
                    Goals
                </Link>

                <Link to="/achievements" className="hover:text-blue-400">
                    🏅Achievements
                </Link>

                <Link to="/profile" className="hover:text-blue-400">
                    Profile
                </Link>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-3 mt-2 sm:mt-0 sm:absolute sm:right-6 sm:top-3">
                <DarkModeToggle />

                <button
                    onClick={logout}
                    className="text-red-400 hover:text-red-500 text-xs sm:text-sm"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
