import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { Tooltip as ReactTooltip } from "react-tooltip";

function StudyHeatmap({ logs }) {

    // ================= BUILD DATE MAP =================

    const dateMap = {};

    logs.forEach(log => {
        if (!log.date) return;

        const dateKey = new Date(log.date.seconds * 1000)
            .toISOString()
            .slice(0, 10);

        dateMap[dateKey] = (dateMap[dateKey] || 0) + log.hours;
    });

    const values = Object.keys(dateMap).map(date => ({
        date,
        count: dateMap[date]
    }));

    // ================= DATE RANGE =================

    const today = new Date();
    const startDate = new Date();
    startDate.setFullYear(today.getFullYear() - 1);

    // ================= UI =================

    return (
        <div className="bg-white p-6 rounded-xl shadow-md dark:bg-gray-800">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-4 dark:text-white ">

                <h2 className="text-lg font-bold flex items-center gap-2 dark:text-white ">
                    📅 Study Consistency
                </h2>

                <span className="text-sm text-gray-500 dark:text-gray-400">
                    Last 12 Months
                </span>

            </div>

            {/* HEATMAP CONTAINER */}
            <div className="overflow-x-auto dark:bg-gray-800 p-2 rounded">

                <CalendarHeatmap
                    startDate={startDate}
                    endDate={today}
                    values={values}

                    horizontal={true}
                    gutterSize={3}
                    showWeekdayLabels={true}

                    weekdayLabels={["Mon", "", "Wed", "", "Fri", "", ""]}

                    tooltipDataAttrs={(value) => ({
                        "data-tooltip-id": "heatmap-tip",
                        "data-tooltip-content": value?.date
                            ? `${value.date} — ${value.count} hrs`
                            : "No study"
                    })}

                    classForValue={(value) => {
                        if (!value || value.count === 0) return "color-empty";
                        if (value.count < 2) return "color-scale-1";
                        if (value.count < 4) return "color-scale-2";
                        if (value.count < 6) return "color-scale-3";
                        return "color-scale-4";
                    }}
                />

                <ReactTooltip id="heatmap-tip" place="top" />

            </div>

            {/* LEGEND */}
            <div className="flex items-center gap-2 mt-4 text-sm">

                <span className="text-gray-400">Less</span>

                {/* No activity */}
                <div className="w-4 h-4 rounded-sm border border-gray-500 bg-gray-300 dark:bg-gray-700"></div>

                {/* Low */}
                <div className="w-4 h-4 rounded-sm border border-gray-500 bg-green-200 dark:bg-green-400"></div>

                {/* Medium */}
                <div className="w-4 h-4 rounded-sm border border-gray-500 bg-green-400 dark:bg-green-550"></div>

                {/* High */}
                <div className="w-4 h-4 rounded-sm border border-gray-500 bg-green-600 dark:bg-green-700"></div>

                {/* Very High */}
                <div className="w-4 h-4 rounded-sm border border-gray-500 bg-green-800 dark:bg-green-800"></div>

                <span className="text-gray-400">More</span>

            </div>



        </div>
    );
}

export default StudyHeatmap;
