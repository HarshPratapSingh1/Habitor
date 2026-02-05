import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    doc,
    getDoc,
    getDocs,
    collection,
    query,
    where,
    setDoc
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { achievementList } from "../utils/achievementRules";

function Dashboard() {

    const [streak, setStreak] = useState({ current: 0, best: 0, lastDate: null });
    const [weeklyHours, setWeeklyHours] = useState(0);
    const [gateProgress, setGateProgress] = useState(0);
    const [cfRating, setCfRating] = useState(0);

    const [planner, setPlanner] = useState({
        remaining: 0,
        perDay: 0,
        status: ""
    });

    const [goalSummary, setGoalSummary] = useState({
        total: 0,
        completed: 0,
        active: 0,
        progress: 0
    });

    const WEEKLY_TARGET = 20;

    // ================= ACHIEVEMENTS =================

    const updateAchievements = async (stats) => {

        if (!auth.currentUser) return;

        const unlocked = {};

        achievementList.forEach(a => {
            unlocked[a.id] = a.check(stats);
        });

        await setDoc(
            doc(db, "achievements", auth.currentUser.uid),
            unlocked,
            { merge: true }
        );
    };

    // ================= LOAD DASHBOARD =================

    useEffect(() => {

        const loadDashboard = async () => {

            if (!auth.currentUser) return;

            const uid = auth.currentUser.uid;
            const today = new Date();

            try {

                /* STREAK */

                let currentStreak = 0;
                let bestStreak = 0;

                const streakSnap = await getDoc(doc(db, "studyStreaks", uid));

                if (streakSnap.exists()) {
                    const d = streakSnap.data();
                    currentStreak = d.currentStreak || 0;
                    bestStreak = d.bestStreak || 0;

                    setStreak({
                        current: currentStreak,
                        best: bestStreak,
                        lastDate: d.lastDate
                    });
                }

                /* WEEKLY STUDY */

                const logsSnap = await getDocs(
                    query(collection(db, "studyLogs"), where("uid", "==", uid))
                );

                let weeklyTotal = 0;

                logsSnap.forEach(docSnap => {
                    const log = docSnap.data();
                    if (!log.date) return;

                    const logDate = new Date(log.date.seconds * 1000);
                    const diff = (today - logDate) / (1000 * 60 * 60 * 24);

                    if (diff <= 7) weeklyTotal += log.hours;
                });

                setWeeklyHours(weeklyTotal);

                /* SMART PLANNER */

                const remaining = Math.max(WEEKLY_TARGET - weeklyTotal, 0);
                const day = today.getDay() || 7;
                const daysLeft = Math.max(7 - day + 1, 1);

                const perDay = Math.ceil(remaining / daysLeft);

                let status = "On Track";
                if (remaining === 0) status = "Completed";
                else if (perDay <= 2) status = "Ahead";
                else if (perDay >= 5) status = "Behind";

                setPlanner({ remaining, perDay, status });

                /* GATE */

                let done = 0;
                let curTotal = 0;

                const gateSnap = await getDoc(doc(db, "gateProgress", uid));

                if (gateSnap.exists()) {

                    const subjects = gateSnap.data();

                    Object.values(subjects).forEach(subject => {

                        Object.values(subject).forEach(topic => {

                            Object.values(topic).forEach(val => {

                                curTotal++;

                                if (val === true) done++;

                            });

                        });

                    });

                }

                const percent = curTotal ? Math.round((done / curTotal) * 100) : 0;

                setGateProgress(percent);


                /* CODEFORCES */

                const cfSnap = await getDoc(doc(db, "cfRatings", uid));

                if (cfSnap.exists()) {
                    const history = cfSnap.data().history;
                    if (history?.length) {
                        setCfRating(history.at(-1).rating);
                    }
                }

                /* GOALS */

                const goalsSnap = await getDocs(
                    query(collection(db, "goals"), where("uid", "==", uid))
                );

                let total = goalsSnap.size;
                let completed = 0;
                let progressSum = 0;

                goalsSnap.forEach(d => {
                    const g = d.data();
                    if (g.completed) completed++;

                    const gPercent = Math.min(Math.round((g.progress / g.target) * 100), 100);
                    progressSum += gPercent;

                });

                const avgProgress = total ? Math.round(progressSum / total) : 0;

                setGoalSummary({
                    total,
                    completed,
                    active: total - completed,
                    progress: avgProgress
                });

                /* UPDATE ACHIEVEMENTS */

                updateAchievements({
                    streak: currentStreak,
                    weeklyHours: weeklyTotal,
                    gateProgress: percent,
                    completedGoals: completed
                });

            } catch (err) {
                console.log(err);
            }
        };

        loadDashboard();

    }, []);

    // ================= PDF EXPORT =================

    const exportPDF = () => {

        const pdf = new jsPDF();
        const date = new Date().toLocaleDateString();

        pdf.text("CP + GATE Progress Report", 14, 18);

        autoTable(pdf, {
            startY: 30,
            head: [["Metric", "Value"]],
            body: [
                ["Current Streak", streak.current],
                ["Best Streak", streak.best],
                ["Weekly Hours", weeklyHours],
                ["Goals Completed", `${goalSummary.completed}/${goalSummary.total}`],
                ["GATE Progress", `${gateProgress}%`],
                ["Codeforces", cfRating]
            ],
            headStyles: { fillColor: [37, 99, 235] }
        });

        pdf.save("progress_report.pdf");
    };

    // ================= UI =================
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-10 transition-colors">

            <div className="max-w-7xl mx-auto px-6 space-y-10">

                {/* HEADER */}

                <div className="flex flex-wrap justify-between items-center gap-4">

                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                            Dashboard
                        </h1>
                        <p className="text-gray-600 dark:text-slate-400 mt-1">
                            Track your consistency & performance
                        </p>
                    </div>

                    <button
                        onClick={exportPDF}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 transition px-5 py-2.5 rounded-xl text-white font-medium shadow-lg"
                    >
                        📄 Export Report
                    </button>

                </div>

                {/* KPI GRID */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                    {[
                        { label: "Current Streak", value: streak.current, icon: "🔥", color: "from-orange-500 to-red-500" },
                        { label: "Best Streak", value: streak.best, icon: "🏆", color: "from-yellow-400 to-amber-500" },
                        { label: "Weekly Study", value: `${weeklyHours} hrs`, icon: "📚", color: "from-emerald-500 to-teal-500" },
                        { label: "Codeforces", value: cfRating, icon: "⭐", color: "from-indigo-500 to-blue-600" }
                    ].map((card, i) => (

                        <div
                            key={i}
                            className="bg-white dark:bg-white/5 backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:scale-[1.02] transition shadow-md dark:shadow-xl"
                        >

                            <div className="flex justify-between items-center">

                                <div>
                                    <p className="text-gray-500 dark:text-slate-400 text-sm">
                                        {card.label}
                                    </p>

                                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                        {card.value}
                                    </p>
                                </div>

                                <div className={`bg-gradient-to-r ${card.color} p-3 rounded-xl text-xl`}>
                                    {card.icon}
                                </div>

                            </div>

                        </div>

                    ))}

                </div>

                {/* MIDDLE GRID */}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* WEEKLY PLANNER */}

                    <div className="lg:col-span-2 bg-white dark:bg-white/5 backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-2xl p-7 shadow-md dark:shadow-xl">

                        <h2 className="text-gray-900 dark:text-white text-lg font-semibold mb-6">
                            📅 Weekly Planner
                        </h2>

                        <div className="grid grid-cols-2 gap-6">

                            <div>
                                <p className="text-gray-500 dark:text-slate-400 text-sm">
                                    Remaining
                                </p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {planner.remaining} hrs
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500 dark:text-slate-400 text-sm">
                                    Daily Target
                                </p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {planner.perDay} hrs
                                </p>
                            </div>

                            <div className="col-span-2">

                                <p className="text-gray-500 dark:text-slate-400 text-sm">
                                    Status
                                </p>

                                <span className={`inline-block mt-1 px-4 py-1 rounded-full text-sm font-semibold
                ${planner.status === "Completed" && "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"}
                ${planner.status === "Ahead" && "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400"}
                ${planner.status === "Behind" && "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"}
                ${planner.status === "On Track" && "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"}
              `}>
                                    {planner.status}
                                </span>

                            </div>

                        </div>

                    </div>

                    {/* GOALS */}

                    <div className="bg-white dark:bg-white/5 backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-2xl p-7 shadow-md dark:shadow-xl">

                        <h2 className="text-gray-900 dark:text-white text-lg font-semibold mb-4">
                            🎯 Goals Progress
                        </h2>

                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {goalSummary.completed}/{goalSummary.total}
                        </p>

                        <div className="mt-4 h-3 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">

                            <div
                                className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"
                                style={{ width: `${goalSummary.progress}%` }}
                            />

                        </div>

                        <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm">
                            {goalSummary.progress}% completed
                        </p>

                    </div>

                </div>

                {/* GATE */}

                <div className="bg-white dark:bg-white/5 backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-2xl p-7 shadow-md dark:shadow-xl">

                    <h2 className="text-gray-900 dark:text-white text-lg font-semibold mb-3">
                        🎯 GATE Progress
                    </h2>

                    <p className="text-4xl font-bold text-gray-900 dark:text-white">
                        {gateProgress}%
                    </p>

                    <div className="mt-4 h-3 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">

                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full"
                            style={{ width: `${gateProgress}%` }}
                        />

                    </div>

                </div>

            </div>
        </div>
    );


}

export default Dashboard;
