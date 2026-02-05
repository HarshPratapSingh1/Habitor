import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase/config";
import { doc, onSnapshot } from "firebase/firestore";

// ================= SUBJECT WEIGHTAGE =================

const subjectWeightage = {
    "Engineering Mathematics": 15,
    "Digital Logic": 10,
    "COA": 10,
    "Programming & Data Structures": 15,
    "Algorithms": 15,
    "TOC": 10,
    "Compiler Design": 5,
    "Operating Systems": 10,
    "DBMS": 10,
    "Computer Networks": 10,
    "Aptitude": 15
};

function GateTracker() {

    const [progress, setProgress] = useState({});
    const navigate = useNavigate();

    // ================= LIVE FIRESTORE SYNC =================

    useEffect(() => {

        if (!auth.currentUser) return;

        const ref = doc(db, "gateProgress", auth.currentUser.uid);

        const unsub = onSnapshot(ref, snap => {
            if (snap.exists()) {
                setProgress(snap.data());
            }
        });

        return () => unsub();

    }, []);

    // ================= SUBJECT PROGRESS =================

    const subjectProgress = (subject) => {

        const topics = progress?.[subject];
        if (!topics) return 0;

        let done = 0;
        let total = 0;

        Object.values(topics).forEach(subs => {
            Object.values(subs).forEach(val => {
                total++;
                if (val) done++;
            });
        });

        return total ? Math.round((done / total) * 100) : 0;
    };

    // ================= EXPECTED MARKS =================

    const expectedMarks = () => {

        let weightedScore = 0;
        let totalWeight = 0;

        Object.keys(subjectWeightage).forEach(subject => {

            const weight = subjectWeightage[subject];
            const percent = subjectProgress(subject);

            weightedScore += percent * weight;
            totalWeight += weight;

        });

        // Normalize to 100
        const normalizedMarks = weightedScore / totalWeight;

        return Number(normalizedMarks.toFixed(1));
    };



    // ================= RANK ESTIMATOR =================

    const estimateRank = () => {

        const m = expectedMarks();

        if (m >= 75) return "< 100";
        if (m >= 65) return "100 - 500";
        if (m >= 55) return "500 - 1500";
        if (m >= 45) return "1500 - 4000";
        if (m >= 35) return "4000 - 8000";
        return "> 8000";
    };

    // ================= WEAK SUBJECT =================

    const weakestSubject = () => {

        let min = 101;
        let weak = null;

        Object.keys(subjectWeightage).forEach(subject => {

            const p = subjectProgress(subject);

            if (p < min) {
                min = p;
                weak = subject;
            }

        });

        // If everything is completed
        if (min === 100) return null;

        return weak;
    };

    // ================= MARKS GAIN =================

    const weakGain = () => {

        const weak = weakestSubject();
        if (!weak) return 0;

        const weight = subjectWeightage[weak];
        const percent = subjectProgress(weak);

        return (((100 - percent) * weight) / 100).toFixed(1);
    };

    // ================= DAILY HOURS =================

    const dailyHours = () => {

        const g = weakGain();

        if (g >= 10) return "3 - 4 hrs/day";
        if (g >= 6) return "2 - 3 hrs/day";
        if (g >= 3) return "1.5 - 2 hrs/day";
        return "1 hr/day";
    };

    // ================= UI =================

    return (

        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-8">

            <h1 className="text-3xl font-bold dark:text-white mb-6">
                GATE Performance Predictor
            </h1>

            {/* DASHBOARD */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

                {/* MARKS */}

                <div className="card p-6">

                    <p className="text-sm opacity-70">
                        Expected Marks
                    </p>

                    <h2 className="text-3xl font-bold text-emerald-400 mt-2">
                        {expectedMarks()} / 100
                    </h2>

                </div>

                {/* RANK */}

                <div className="card p-6">

                    <p className="text-sm opacity-70">
                        Estimated Rank
                    </p>

                    <h2 className="text-3xl font-bold text-indigo-400 mt-2">
                        {estimateRank()}
                    </h2>

                </div>

                {/* SMART TARGET */}

                {weakestSubject() ? (

                    // ---------- WEAK SUBJECT CARD ----------

                    <div
                        onClick={() => navigate(`/gate/${weakestSubject()}`)}
                        className="cursor-pointer bg-gradient-to-r from-indigo-500 to-blue-600 p-6 rounded-xl text-white hover:scale-[1.02] transition"
                    >

                        <p className="text-sm opacity-80">
                            🎯 Next Target
                        </p>

                        <h2 className="text-xl font-bold mt-1">
                            {weakestSubject()}
                        </h2>

                        <div className="text-sm mt-3 space-y-1">

                            <p>📈 Gain: +{weakGain()} marks</p>
                            <p>⏱ Study: {dailyHours()}</p>

                        </div>

                    </div>

                ) : (

                    // ---------- ALL DONE CARD ----------

                    <div
                        className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 rounded-xl text-white"
                    >

                        <p className="text-sm opacity-90">
                            ✅ Syllabus Status
                        </p>

                        <h2 className="text-xl font-bold mt-1">
                            All Subjects Completed 🎉
                        </h2>

                        <div className="text-sm mt-3 space-y-1">

                            <p>🚀 Focus on Revision</p>
                            <p>📝 Start Full-Length Mock Tests</p>
                            <p>📊 Analyze Weak Areas from Tests</p>

                        </div>

                    </div>

                )}


            </div>

            {/* SUBJECT GRID */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {Object.keys(subjectWeightage).map(subject => {

                    const percent = subjectProgress(subject);

                    return (

                        <div
                            key={subject}
                            onClick={() => navigate(`/gate/${subject}`)}
                            className="card p-6 cursor-pointer hover:scale-[1.02] transition"
                        >

                            <div className="flex justify-between">

                                <h2 className="font-semibold">
                                    {subject}
                                </h2>

                                <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-full">
                                    {subjectWeightage[subject]} Marks
                                </span>

                            </div>

                            <p className="text-sm opacity-70 mt-1">
                                {percent}% Completed
                            </p>

                            <div className="mt-3 w-full h-2 bg-slate-800 rounded-full overflow-hidden">

                                <div
                                    className="h-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-700"
                                    style={{ width: `${percent}%` }}
                                />

                            </div>

                        </div>

                    );

                })}

            </div>

        </div>

    );
}

export default GateTracker;
