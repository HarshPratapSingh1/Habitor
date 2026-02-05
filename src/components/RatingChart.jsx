import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from "recharts";

function RatingChart({ history, target }) {

    const data = history.map((item, index) => ({
        name: index + 1,
        rating: item.rating
    }));

    return (

        <div>

            <h2 className="text-gray-900 dark:text-white text-lg font-semibold mb-4">
                Rating Progress
            </h2>

            <ResponsiveContainer width="100%" height={320}>

                <LineChart data={data}>

                    {/* Grid */}
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(148,163,184,0.2)"
                    />

                    {/* Axis */}
                    <XAxis
                        dataKey="name"
                        stroke="#94a3b8"
                        tick={{ fill: "#94a3b8" }}
                    />

                    <YAxis
                        stroke="#94a3b8"
                        tick={{ fill: "#94a3b8" }}
                        domain={["auto", "auto"]}
                    />

                    {/* Tooltip */}
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#0f172a",
                            borderRadius: "10px",
                            border: "none",
                            color: "#fff"
                        }}
                        labelStyle={{ color: "#38bdf8" }}
                    />

                    {/* Target Line */}
                    <ReferenceLine
                        y={target}
                        stroke="#ef4444"
                        strokeDasharray="6 6"
                        label={{
                            value: `🎯 Target ${target}`,
                            fill: "#ef4444",
                            position: "right"
                        }}
                    />

                    {/* Rating Line */}
                    <Line
                        type="monotone"
                        dataKey="rating"
                        stroke="#22c55e"
                        strokeWidth={3}
                        dot={{
                            fill: "#22c55e",
                            r: 4
                        }}
                        activeDot={{
                            r: 7,
                            stroke: "#22c55e",
                            strokeWidth: 2
                        }}
                    />

                </LineChart>

            </ResponsiveContainer>

        </div>
    );
}

export default RatingChart;
