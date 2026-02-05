import { useEffect, useState } from "react";
import { db, auth } from "../firebase/config";
import { onSnapshot } from "firebase/firestore";
import {
    collection,
    addDoc,
    query,
    where,
    updateDoc,
    doc
} from "firebase/firestore";

// ================= CONFETTI =================

function launchConfetti() {

    const duration = 1200;
    const end = Date.now() + duration;

    const interval = setInterval(() => {

        if (Date.now() > end) {
            clearInterval(interval);
            return;
        }

        window.confetti({
            particleCount: 35,
            spread: 70,
            startVelocity: 25,
            origin: { x: Math.random(), y: 0.6 }
        });

    }, 220);
}

// ================= PROGRESS RING =================

function ProgressRing({ percent }) {

    const radius = 30;
    const stroke = 6;
    const normalizedRadius = radius - stroke;
    const circumference = normalizedRadius * 2 * Math.PI;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <svg width="80" height="80">
            <circle
                stroke="#1e293b"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx="40"
                cy="40"
            />

            <circle
                stroke="#22c55e"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={`${circumference} ${circumference}`}
                style={{ strokeDashoffset: offset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx="40"
                cy="40"
            />

            <text
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                className="fill-slate-900 dark:fill-white"
                fontSize="14"
                fontWeight="bold"
            >
                {percent}%
            </text>
        </svg>
    );
}

// ================= MAIN =================

function GoalTracker() {

    const [title, setTitle] = useState("");
    const [target, setTarget] = useState("");
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [removingId, setRemovingId] = useState(null);

    // ================= REALTIME LOAD =================

    useEffect(() => {

        const unsubAuth = auth.onAuthStateChanged(user => {

            if (!user) return;

            const q = query(
                collection(db, "goals"),
                where("uid", "==", user.uid)
            );

            const unsubGoals = onSnapshot(q, snap => {

                const data = snap.docs.map(d => ({
                    id: d.id,
                    ...d.data()
                }));

                setGoals(data);
            });

            return () => unsubGoals();
        });

        return () => unsubAuth();

    }, []);

    // ================= ADD =================

    const addGoal = async () => {

        if (!title || !target) {
            alert("Fill all fields");
            return;
        }

        try {

            setLoading(true);

            await addDoc(collection(db, "goals"), {
                uid: auth.currentUser.uid,
                title: title.trim(),
                target: Number(target),
                progress: 0,
                completed: false,
                createdAt: new Date(),
                completedAt: null
            });

            setTitle("");
            setTarget("");

        } catch {
            alert("Failed to create goal");
        }

        setLoading(false);
    };

    // ================= UPDATE =================

    const updateProgress = async (id, value, target) => {

        const newValue = Math.min(Number(value), target);
        const completed = newValue >= target;

        await updateDoc(doc(db, "goals", id), {
            progress: newValue,
            completed,
            completedAt: completed ? new Date() : null
        });

        if (completed) {
            setRemovingId(id);
            launchConfetti();

            setTimeout(() => {
                setRemovingId(null);
            }, 1500);
        }
    };

    const visibleGoals = goals.filter(g =>
        !g.completed || g.id === removingId
    );

    // ================= UI =================

    return (

        <div className="
  min-h-screen px-2 sm:px-6 py-4
  bg-gradient-to-br from-slate-50 via-white to-slate-100
  dark:from-slate-950 dark:via-slate-900 dark:to-slate-950
  text-gray-900 dark:text-white
  transition-colors
">


            {/* HEADER */}

            <div className="mb-6">

                <h1 className="text-3xl font-bold">
                    🎯 Goal Tracker
                </h1>

                <p className="text-gray-500 dark:text-slate-400 mt-1">
                    Track long-term study & CP goals
                </p>

            </div>

            {/* ADD FORM */}

            <div className="glass p-4 rounded-xl mb-6">

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                    <input
                        placeholder="Goal title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="bg-white dark:bg-slate-800 p-2 rounded text-black dark:text-white"
                    />

                    <input
                        type="number"
                        placeholder="Target"
                        value={target}
                        onChange={e => setTarget(e.target.value)}
                        className="bg-white dark:bg-slate-800 p-2 rounded text-black dark:text-white"
                    />

                    <button
                        onClick={addGoal}
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded font-semibold py-2 text-white"
                    >
                        {loading ? "Creating..." : "Add Goal"}
                    </button>

                </div>

            </div>

            {/* EMPTY */}

            {visibleGoals.length === 0 && (

                <div className="glass p-8 rounded-xl text-center text-gray-500 dark:text-slate-400">

                    🚀 No active goals. Create your next milestone!

                </div>

            )}

            {/* GRID */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {visibleGoals.map(goal => {

                    const percent = Math.min(
                        Math.round((goal.progress / goal.target) * 100),
                        100
                    );

                    return (

                        <div
                            key={goal.id}
                            className={`glass p-5 rounded-xl transition-all duration-700

              ${goal.completed
                                    ? "border border-green-400/40 shadow-green-500/30 scale-[1.02]"
                                    : "hover:scale-[1.01]"}

              ${removingId === goal.id
                                    ? "opacity-0 translate-y-4"
                                    : "opacity-100 translate-y-0"}
            `}>

                            <div className="flex justify-between items-center mb-4">

                                <div>

                                    <h3 className="font-semibold text-lg">
                                        {goal.title}
                                    </h3>

                                    <p className="text-sm text-gray-500 dark:text-slate-400">
                                        {goal.progress} / {goal.target}
                                    </p>

                                </div>

                                <ProgressRing percent={percent} />

                            </div>

                            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-3">

                                <div
                                    className="h-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-500"
                                    style={{ width: `${percent}%` }}
                                />

                            </div>

                            <span
                                className={`inline-block px-3 py-1 rounded-full text-sm font-medium

                ${goal.completed
                                        ? "bg-green-500/20 text-green-500 animate-pulse"
                                        : percent < 40
                                            ? "bg-red-500/20 text-red-500"
                                            : percent < 75
                                                ? "bg-yellow-500/20 text-yellow-500"
                                                : "bg-blue-500/20 text-blue-500"}
              `}
                            >
                                {goal.completed ? "Completed 🎉" :
                                    percent < 40 ? "Behind" :
                                        percent < 75 ? "In Progress" : "Almost There"}
                            </span>

                            {!goal.completed && (

                                <input
                                    type="range"
                                    min="0"
                                    max={goal.target}
                                    value={goal.progress}
                                    onChange={e =>
                                        updateProgress(goal.id, e.target.value, goal.target)
                                    }
                                    className="w-full mt-4 accent-indigo-500"
                                />

                            )}

                        </div>

                    );

                })}

            </div>

        </div>
    );
}

export default GoalTracker;
