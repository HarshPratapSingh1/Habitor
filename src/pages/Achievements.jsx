import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { achievementList } from "../utils/achievementRules";

function Achievements() {

    const [unlocked, setUnlocked] = useState({});

    useEffect(() => {

        const loadAchievements = async () => {

            if (!auth.currentUser) return;

            const ref = doc(db, "achievements", auth.currentUser.uid);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                setUnlocked(snap.data());
            }
        };

        loadAchievements();

    }, []);

    return (
        <div className="p-6">

            <h1 className="text-2xl font-bold mb-6">
                🏅 Achievements
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">

                {achievementList.map(a => {

                    const isUnlocked = unlocked[a.id];

                    return (
                        <div
                            key={a.id}
                            className={`p-4 rounded shadow text-center transition
                ${isUnlocked
                                    ? "bg-green-400 dark:bg-green-800"
                                    : "bg-gray-400 dark:bg-gray-800 opacity-60"
                                }`}
                        >

                            <div className="text-3xl mb-2">
                                {a.icon}
                            </div>

                            <p className="font-semibold">
                                {a.name}
                            </p>

                            <p className="text-sm mt-1">
                                {isUnlocked ? "Unlocked ✅" : "Locked 🔒"}
                            </p>

                        </div>
                    );
                })}

            </div>

        </div>
    );
}

export default Achievements;
