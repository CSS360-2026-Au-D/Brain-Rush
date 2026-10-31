export const questionBank = [
    {
        id: "sports-01",
        topic: "sports",
        difficulty: "easy",
        question: "How many players does a soccer team have on the field at the start of a match?",
        options: ["9", "10", "11", "12"],
        correctOptionIndex: 2
    },
    {
        id: "sports-02",
        topic: "sports",
        difficulty: "easy",
        question: "Which sport uses a shuttlecock?",
        options: ["Tennis", "Badminton", "Squash", "Golf"],
        correctOptionIndex: 1
    },
    {
        id: "sports-03",
        topic: "sports",
        difficulty: "easy",
        question: "How many points is a basketball free throw worth?",
        options: ["1", "2", "3", "4"],
        correctOptionIndex: 0
    },
    {
        id: "sports-04",
        topic: "sports",
        difficulty: "easy",
        question: "Which sport uses the terms strike and home run?",
        options: ["Soccer", "Tennis", "Baseball", "Swimming"],
        correctOptionIndex: 2
    },
    {
        id: "sports-05",
        topic: "sports",
        difficulty: "easy",
        question: "In tennis scoring, what word means zero?",
        options: ["Ace", "Love", "Deuce", "Fault"],
        correctOptionIndex: 1
    },
    {
        id: "sports-06",
        topic: "sports",
        difficulty: "medium",
        question: "How many points is a touchdown worth before any extra-point attempt?",
        options: ["3", "5", "6", "7"],
        correctOptionIndex: 2
    },
    {
        id: "sports-07",
        topic: "sports",
        difficulty: "medium",
        question: "How many legal deliveries make up a standard over in cricket?",
        options: ["4", "5", "6", "8"],
        correctOptionIndex: 2
    },
    {
        id: "sports-08",
        topic: "sports",
        difficulty: "medium",
        question: "In golf, what does a birdie mean?",
        options: [
            "One stroke under par",
            "One stroke over par",
            "Two strokes under par",
            "Equal to par"
        ],
        correctOptionIndex: 0
    },
    {
        id: "sports-09",
        topic: "sports",
        difficulty: "medium",
        question: "How many players per team are on the court in indoor volleyball?",
        options: ["5", "6", "7", "8"],
        correctOptionIndex: 1
    },
    {
        id: "sports-10",
        topic: "sports",
        difficulty: "medium",
        question: "Which swimming stroke is performed on the back?",
        options: ["Breaststroke", "Butterfly", "Backstroke", "Front crawl"],
        correctOptionIndex: 2
    },
    {
        id: "sports-11",
        topic: "sports",
        difficulty: "hard",
        question: "How many events make up a decathlon?",
        options: ["7", "8", "10", "12"],
        correctOptionIndex: 2
    },
    {
        id: "sports-12",
        topic: "sports",
        difficulty: "hard",
        question: "What is the official marathon distance in kilometers?",
        options: ["40", "42", "42.195", "45"],
        correctOptionIndex: 2
    },
    {
        id: "sports-13",
        topic: "sports",
        difficulty: "hard",
        question: "In rugby union, how many points is a try worth?",
        options: ["3", "4", "5", "6"],
        correctOptionIndex: 2
    },
    {
        id: "sports-14",
        topic: "sports",
        difficulty: "hard",
        question: "Which fencing weapon permits the entire body as a valid target?",
        options: ["Foil", "Epee", "Sabre", "All three"],
        correctOptionIndex: 1
    },
    {
        id: "sports-15",
        topic: "sports",
        difficulty: "hard",
        question: "In a standard snooker frame, how many red balls are on the table at the start?",
        options: ["10", "12", "15", "16"],
        correctOptionIndex: 2
    }
];

for (const question of questionBank) {
    Object.freeze(question.options);
    Object.freeze(question);
}

Object.freeze(questionBank);