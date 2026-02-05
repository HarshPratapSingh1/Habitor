import { BrowserRouter, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

import { auth } from "./firebase/config";

import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import CFTracker from "./pages/CFTracker";
import GateTracker from "./pages/GateTracker";
import Login from "./pages/Login";
import StudyLog from "./pages/StudyLog";
import Profile from "./pages/Profile";
import GoalTracker from "./pages/GoalTracker";
import Achievements from "./pages/Achievements";
import GateSubject from "./pages/GateSubject";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ⏳ Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
          Loading...
        </p>
      </div>
    );
  }

  // 🔐 Not logged in
  if (!user) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      {/* 🌙 ROOT WRAPPER */}
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white overflow-x-hidden">

        {/* 🧭 NAVBAR */}
        <Navbar />

        {/* 📱 CONTENT AREA */}
        <main className="w-full px-3 sm:px-6 py-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cf" element={<CFTracker />} />
            <Route path="/gate" element={<GateTracker />} />
            <Route path="/gate/:subject" element={<GateSubject />} />
            <Route path="/study" element={<StudyLog />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/goals" element={<GoalTracker />} />
            <Route path="/achievements" element={<Achievements />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;
  