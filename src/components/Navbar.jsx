import { Link } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";
import { auth } from "../firebase/config";

function Navbar() {

    const logout = () => {
        auth.signOut();
    };

    return (
        <nav className="
bg-white dark:bg-slate-800
text-gray-900 dark:text-white
border-b border-gray-200 dark:border-white/10
px-6 py-3 flex justify-between items-center
transition-colors
">

            {/* LEFT MENU */}
            <div className="flex gap-6 text-sm font-medium">

                <Link to="/" className="hover:text-blue-400">
                    Dashboard
                </Link>

                <Link to="/cf" className="hover:text-blue-400">
                    CF Tracker
                </Link>

                <Link to="/gate" className="hover:text-blue-400">
                    GATE Tracker
                </Link>

                <Link to="/study" className="hover:text-blue-400">
                    Study Log
                </Link>

                <Link to="/goals" className="hover:text-blue-400">
                    Goal Tracker
                </Link>

                <Link to="/achievements" className="hover:text-blue-400">
                    🏅 Achievements
                </Link>
                <Link to="/profile" className="hover:text-blue-400">
                    Profile
                </Link>

            </div>

            {/* RIGHT SIDE */}
            <div className="flex gap-4 items-center">

                <DarkModeToggle />

                <button
                    onClick={logout}
                    className="text-red-400 hover:text-red-500"
                >
                    Logout
                </button>

            </div>

        </nav>
    );
}

export default Navbar;
