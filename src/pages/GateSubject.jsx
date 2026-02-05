import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db, auth } from "../firebase/config";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

import syllabus from "../data/syllabus"; // OPTIONAL if you externalize later

function GateSubject() {

    const { subject } = useParams();

    const [data, setData] = useState({});
    const [openTopic, setOpenTopic] = useState(null);

    // ================= LIVE SUBJECT SYNC =================

    useEffect(() => {

        if (!auth.currentUser) return;

        const ref = doc(db, "gateProgress", auth.currentUser.uid);

        const unsub = onSnapshot(ref, snap => {

            if (!snap.exists()) return;

            const subjectData = snap.data()[subject] || {};
            const filled = {};

            Object.keys(syllabus[subject]).forEach(topic => {

                filled[topic] = {};

                syllabus[subject][topic].forEach(sub => {
                    filled[topic][sub] = subjectData?.[topic]?.[sub] || false;
                });

            });

            setData(filled);

        });

        return () => unsub();

    }, [subject]);

    // ================= TOGGLE =================

    const toggle = async (topic, sub) => {

        if (!auth.currentUser) return;

        const ref = doc(db, "gateProgress", auth.currentUser.uid);

        const newValue = !data?.[topic]?.[sub];

        // ONLY update ONE FIELD — not whole object
        await setDoc(ref, {
            [subject]: {
                [topic]: {
                    [sub]: newValue
                }
            }
        }, { merge: true });

    };


    // ================= PROGRESS =================

    const topicProgress = (topic) => {

        const syllabusSubs = syllabus[subject][topic];

        if (!syllabusSubs) return 0;

        let done = 0;

        syllabusSubs.forEach(sub => {
            if (data?.[topic]?.[sub] === true) {
                done++;
            }
        });

        return Math.round((done / syllabusSubs.length) * 100);
    };


    const weakTopic = () => {

        let weakest = null;
        let min = 100;

        Object.keys(syllabus[subject]).forEach(topic => {

            const percent = topicProgress(topic);

            if (percent < min) {
                min = percent;
                weakest = topic;
            }

        });

        return min === 100 ? null : weakest;
    };



    // ================= UI =================

    return (

        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-24">

            {/* HEADER */}

            <div className="sticky top-0 bg-slate-900 border-b border-white/10 p-4 z-20">

                <h1 className="font-bold text-white">
                    {subject}
                </h1>

                {weakTopic() ? (

                    <p className="text-xs text-red-400">
                        Weak Topic: {weakTopic()}
                    </p>

                ) : (

                    <p className="text-xs text-green-400">
                        All topics completed ✅
                    </p>

                )}


            </div>

            {/* TOPICS */}

            <div className="p-4 space-y-4">

                {Object.keys(syllabus[subject]).map(topic => {

                    const percent = topicProgress(topic);
                    const weak = topic === weakTopic();

                    return (

                        <div
                            key={topic}
                            className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                        >

                            {/* HEADER */}

                            <div
                                onClick={() => setOpenTopic(openTopic === topic ? null : topic)}
                                className="flex justify-between items-center px-4 py-4 cursor-pointer"
                            >

                                <div>

                                    <p className="font-semibold text-white">
                                        {topic}
                                    </p>

                                    <p className="text-xs text-slate-400">
                                        {percent}% completed
                                    </p>

                                </div>

                                <div className="flex gap-2 items-center">

                                    {percent === 100 && <span className="text-green-400">✔</span>}
                                    {weak && percent < 100 && <span className="text-red-400">⚠</span>}

                                    <span>{openTopic === topic ? "−" : "+"}</span>

                                </div>

                            </div>

                            {/* EXPAND */}

                            {openTopic === topic && (

                                <div className="px-4 pb-4 space-y-3">

                                    {/* BAR */}

                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">

                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-500"
                                            style={{ width: `${percent}%` }}
                                        />

                                    </div>

                                    {/* SUBTOPICS */}

                                    {syllabus[subject][topic].map(sub => (

                                        <label
                                            key={sub}
                                            className="flex gap-3 items-center text-slate-300"
                                        >

                                            <input
                                                type="checkbox"
                                                checked={Boolean(data?.[topic]?.[sub])}
                                                onChange={() => toggle(topic, sub)}
                                                className="accent-indigo-500 w-5 h-5"
                                            />

                                            {sub}

                                        </label>

                                    ))}

                                </div>

                            )}

                        </div>

                    );

                })}

            </div>

        </div>

    );
}

export default GateSubject;
