export const achievementList = [

    {
        id: "streak7",
        name: "7 Day Streak",
        icon: "🔥",
        check: (data) => data.streak >= 7
    },

    {
        id: "streak30",
        name: "30 Day Streak",
        icon: "⚡",
        check: (data) => data.streak >= 30
    },

    {
        id: "weekly20",
        name: "Weekly Grinder",
        icon: "📚",
        check: (data) => data.weeklyHours >= 20
    },

    {
        id: "gate50",
        name: "GATE Halfway",
        icon: "🎯",
        check: (data) => data.gateProgress >= 50
    },

    {
        id: "goal5",
        name: "Goal Master",
        icon: "🏆",
        check: (data) => data.completedGoals >= 5
    }

];
