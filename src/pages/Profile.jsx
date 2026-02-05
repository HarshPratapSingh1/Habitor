import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase/config";

// ---------------- CARD ----------------

function StatCard({ title, value, icon, accent }) {
    return (
        <div className="
            relative p-5 rounded-2xl
            bg-white dark:bg-white/5
            border border-gray-200 dark:border-white/10
            shadow-md dark:shadow-xl
            hover:scale-[1.03] transition
            overflow-hidden
        ">
            <div className={`absolute left-0 top-0 h-full w-1 ${accent}`} />

            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                        {title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        {value}
                    </p>
                </div>
                <div className="text-4xl opacity-80">{icon}</div>
            </div>
        </div>
    );
}

// ---------------- MAIN ----------------

function Profile() {

    const [profileData, setProfileData] = useState({
        streak: 0,
        bestStreak: 0,
        cfRating: 0,
        gateProgress: 0
    });

    useEffect(() => {

        const loadProfile = async () => {

            if (!auth.currentUser) return;
            const uid = auth.currentUser.uid;

            try {
                const streakSnap = await getDoc(doc(db, "studyStreaks", uid));
                const cfSnap = await getDoc(doc(db, "cfRatings", uid));
                const gateSnap = await getDoc(doc(db, "gateProgress", uid));

                // STREAK
                let streak = 0, best = 0;
                if (streakSnap.exists()) {
                    streak = streakSnap.data().currentStreak || 0;
                    best = streakSnap.data().bestStreak || 0;
                }

                // CODEFORCES
                let cfRating = 0;
                if (cfSnap.exists()) {
                    const hist = cfSnap.data().history || [];
                    if (hist.length) cfRating = hist.at(-1).rating;
                }

                // GATE PROGRESS
                let gateProgress = 0;
                if (gateSnap.exists()) {
                    let total = 0, done = 0;

                    Object.values(gateSnap.data()).forEach(subject =>
                        Object.values(subject).forEach(topic =>
                            Object.values(topic).forEach(val => {
                                total++;
                                if (val === true) done++;
                            })
                        )
                    );

                    gateProgress = total
                        ? Math.round((done / total) * 100)
                        : 0;
                }

                setProfileData({
                    streak,
                    bestStreak: best,
                    cfRating,
                    gateProgress
                });

            } catch (err) {
                console.error("Profile load error:", err);
            }
        };

        loadProfile();
    }, []);

    return (
        <div className="
            min-h-screen px-4 sm:px-8 py-6
            bg-gradient-to-br
            from-slate-100 via-white to-slate-100
            dark:from-slate-950 dark:via-slate-900 dark:to-slate-950
            transition-colors
        ">

            {/* HEADER */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    👤 Profile Summary
                </h1>
                <p className="text-gray-500 dark:text-slate-400 mt-1">
                    Your performance overview
                </p>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Current Streak"
                    value={`${profileData.streak} days`}
                    icon="🔥"
                    accent="bg-orange-500"
                />
                <StatCard
                    title="Best Streak"
                    value={`${profileData.bestStreak} days`}
                    icon="🏆"
                    accent="bg-purple-500"
                />
                <StatCard
                    title="Codeforces Rating"
                    value={profileData.cfRating}
                    icon="⭐"
                    accent="bg-emerald-500"
                />
                <StatCard
                    title="GATE Progress"
                    value={`${profileData.gateProgress}%`}
                    icon="🎯"
                    accent="bg-blue-500"
                />
            </div>

        </div>
    );
}

export default Profile;
