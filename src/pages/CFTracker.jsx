import { useState, useEffect } from "react";
import axios from "axios";
import { db, auth } from "../firebase/config";
import {
    doc,
    setDoc,
    arrayUnion,
    getDoc
} from "firebase/firestore";

import RatingChart from "../components/RatingChart";

function CFTracker() {

    const [handle, setHandle] = useState("");
    const [rating, setRating] = useState(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [contestHistory, setContestHistory] = useState([]);

    const [solvedStats, setSolvedStats] = useState({
        total: 0,
        easy: 0,
        medium: 0,
        hard: 0
    });

    const [tagStats, setTagStats] = useState({});
    const [accuracy, setAccuracy] = useState(0);

    // 🎯 Target Rating (Saved Locally)
    const [targetRating, setTargetRating] = useState(
        Number(localStorage.getItem("cfTarget")) || 1600
    );

    useEffect(() => {
        localStorage.setItem("cfTarget", targetRating);
    }, [targetRating]);

    // 📊 Computed Stats

    const currentRating =
        history.length > 0 ? history[history.length - 1].rating : 0;

    const peakRating =
        history.length > 0
            ? Math.max(...history.map(item => item.rating))
            : 0;

    const expertProgress =
        currentRating > 0
            ? Math.min((currentRating / targetRating) * 100, 100).toFixed(1)
            : 0;

    // Weekly improvement
    let weeklyGain = 0;

    if (history.length >= 2) {
        const last = history[history.length - 1].rating;
        const prev = history[Math.max(history.length - 8, 0)].rating;
        weeklyGain = last - prev;
    }

    // Weakest topic
    let weakestTopic = "N/A";

    if (Object.keys(tagStats).length > 0) {
        weakestTopic = Object.entries(tagStats)
            .sort((a, b) => a[1] - b[1])[0][0];
    }

    // Load saved history

    useEffect(() => {

        const loadHistory = async () => {

            if (!auth.currentUser) return;

            try {
                const ref = doc(db, "cfRatings", auth.currentUser.uid);
                const snap = await getDoc(ref);

                if (snap.exists()) {
                    const data = snap.data();
                    setHistory(data.history || []);
                    setHandle(data.handle || "");
                }

            } catch (err) {
                console.log("History load error:", err);
            }
        };

        loadHistory();

    }, []);

    // Fetch CF Data

    const fetchRating = async () => {

        if (!auth.currentUser) {
            alert("User not authenticated");
            return;
        }

        if (!handle.trim()) {
            alert("Enter Codeforces handle");
            return;
        }

        try {
            setLoading(true);

            // Rating
            const res = await axios.get(
                `https://codeforces.com/api/user.info?handles=${handle.trim()}`
            );

            const userRating = res.data.result[0].rating || 0;
            setRating(userRating);

            const ref = doc(db, "cfRatings", auth.currentUser.uid);

            await setDoc(ref, {
                handle: handle.trim()
            }, { merge: true });

            await setDoc(ref, {
                history: arrayUnion({
                    rating: userRating,
                    date: new Date()
                })
            }, { merge: true });

            setHistory(prev => [
                ...prev,
                { rating: userRating, date: new Date() }
            ]);

            // Submissions
            const subRes = await axios.get(
                `https://codeforces.com/api/user.status?handle=${handle.trim()}`
            );

            const submissions = subRes.data.result;

            const solvedSet = new Set();
            const tagCount = {};

            let accepted = 0;
            let total = submissions.length;

            let easy = 0;
            let medium = 0;
            let hard = 0;

            submissions.forEach(sub => {

                if (sub.verdict === "OK") {

                    accepted++;

                    const key = sub.problem.contestId + "-" + sub.problem.index;

                    if (!solvedSet.has(key)) {

                        solvedSet.add(key);

                        const rating = sub.problem.rating || 0;

                        if (rating > 0 && rating < 1200) easy++;
                        else if (rating >= 1200 && rating < 1800) medium++;
                        else if (rating >= 1800) hard++;

                        sub.problem.tags.forEach(tag => {
                            tagCount[tag] = (tagCount[tag] || 0) + 1;
                        });
                    }
                }
            });

            const acc = ((accepted / total) * 100).toFixed(1);

            setAccuracy(acc);

            setSolvedStats({
                total: solvedSet.size,
                easy,
                medium,
                hard
            });

            setTagStats(tagCount);

            // Contest history
            const contestRes = await axios.get(
                `https://codeforces.com/api/user.rating?handle=${handle.trim()}`
            );

            setContestHistory(contestRes.data.result.slice(-10));

        } catch (error) {
            alert("Invalid Codeforces handle");
        }

        setLoading(false);
    };

    // ================= UI =================

    return (

        <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-8">

            {/* HEADER */}

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Codeforces Tracker
                </h1>
                <p className="text-gray-500 dark:text-slate-400">
                    Analyze your competitive programming journey
                </p>
            </div>

            {/* KPI GRID */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-9 gap-4 mb-8">

                {[
                    { label: "Current", value: currentRating },
                    { label: "Peak", value: peakRating },
                    { label: "Target %", value: `${expertProgress}%` },
                    { label: "Weekly", value: `${weeklyGain >= 0 ? "▲" : "▼"} ${weeklyGain}` },
                    { label: "Solved", value: solvedStats.total },
                    { label: "Easy", value: solvedStats.easy },
                    { label: "Medium", value: solvedStats.medium },
                    { label: "Accuracy", value: `${accuracy}%` },
                    { label: "Weak Topic", value: weakestTopic }
                ].map((item, i) => (

                    <div
                        key={i}
                        className="bg-white dark:bg-white/5 backdrop-blur border border-gray-200 dark:border-white/10 rounded-xl p-4 shadow-md dark:shadow-xl"
                    >

                        <p className="text-sm text-gray-500 dark:text-slate-400">
                            {item.label}
                        </p>

                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {item.value}
                        </p>

                    </div>

                ))}

            </div>

            {/* CONTROL PANEL */}

            <div className="bg-white dark:bg-white/5 backdrop-blur border border-gray-200 dark:border-white/10 rounded-xl p-6 mb-8 shadow-md dark:shadow-xl">

                <div className="flex flex-wrap gap-4 items-center">

                    <input
                        type="text"
                        placeholder="Enter CF handle"
                        className="px-4 py-2 rounded-lg border bg-gray-50 dark:bg-slate-900 dark:text-white outline-none"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                    />

                    <button
                        onClick={fetchRating}
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-lg shadow hover:opacity-90 disabled:opacity-50"
                    >
                        {loading ? "Fetching..." : "Fetch Rating"}
                    </button>

                    {/* TARGET */}

                    <div className="flex items-center gap-2 ml-auto">

                        <span className="text-gray-500 dark:text-slate-400 text-sm">
                            🎯 Target
                        </span>

                        <input
                            type="number"
                            value={targetRating}
                            onChange={(e) => setTargetRating(Number(e.target.value))}
                            className="w-24 px-3 py-2 rounded-lg border bg-gray-50 dark:bg-slate-900 dark:text-white outline-none"
                        />

                    </div>

                </div>

            </div>

            {/* CHART */}

            {history.length > 0 && (

                <div className="bg-white dark:bg-white/5 backdrop-blur border border-gray-200 dark:border-white/10 rounded-xl p-6 shadow-md dark:shadow-xl mb-8">

                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        📈 Rating Progress
                    </h2>

                    <RatingChart history={history} target={targetRating} />

                </div>

            )}

            {/* CONTEST TABLE */}

            {contestHistory.length > 0 && (

                <div className="bg-white dark:bg-white/5 backdrop-blur border border-gray-200 dark:border-white/10 rounded-xl p-6 shadow-md dark:shadow-xl">

                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        🏆 Recent Contest Performance
                    </h2>

                    <div className="overflow-x-auto">

                        <table className="w-full text-sm">

                            <thead className="bg-gray-100 dark:bg-slate-800">
                                <tr>
                                    <th className="p-3 text-left">Contest</th>
                                    <th className="p-3">Rank</th>
                                    <th className="p-3">Δ Rating</th>
                                </tr>
                            </thead>

                            <tbody>

                                {contestHistory.map((c, index) => {

                                    const diff = c.newRating - c.oldRating;

                                    return (
                                        <tr key={index} className="border-t text-center">

                                            <td className="p-3 text-left">
                                                {c.contestName}
                                            </td>

                                            <td className="p-3">
                                                {c.rank}
                                            </td>

                                            <td className={`p-3 font-bold ${diff >= 0 ? "text-green-500" : "text-red-500"}`}>
                                                {diff}
                                            </td>

                                        </tr>
                                    );

                                })}

                            </tbody>

                        </table>

                    </div>

                </div>

            )}

        </div>
    );
}

export default CFTracker;
