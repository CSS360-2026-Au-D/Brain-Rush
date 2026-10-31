import { questionBank } from "./questionBank.js";

export function createChallenge({
    interests = ["sports"],
    difficulty,
    count = 5,
    excludedIds = []
} = {}) {
    if (
        !Array.isArray(interests) ||
        interests.length === 0 ||
        interests.some(topic => typeof topic !== "string")
    ) {
        throw new TypeError("Provide at least one interest as text.");
    }

    const difficulties = ["easy", "medium", "hard"];

    if (difficulty !== undefined && !difficulties.includes(difficulty)) {
        throw new RangeError("Difficulty must be easy, medium, or hard.");
    }

    if (!Number.isInteger(count) || count < 1 || count > 5) {
        throw new RangeError("Choose between 1 and 5 questions.");
    }

    if (
        !Array.isArray(excludedIds) ||
        excludedIds.some(id => typeof id !== "string")
    ) {
        throw new TypeError("Excluded IDs must be an array of question IDs.");
    }

    const topics = interests.map(topic => topic.trim().toLowerCase());
    const excluded = new Set(excludedIds);

    const pool = questionBank.filter(item =>
        topics.includes(item.topic) &&
        (!difficulty || item.difficulty === difficulty) &&
        !excluded.has(item.id)
    );

    if (pool.length < count) {
        throw new RangeError("Not enough unseen questions match your choices.");
    }

    // Shuffle without changing the original question bank.
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Send only the question and choices to the display.
    return pool.slice(0, count).map(item => ({
        id: item.id,
        topic: item.topic,
        difficulty: item.difficulty,
        question: item.question,
        options: [...item.options]
    }));
}

export function checkAnswer(questionId, optionIndex) {
    const question = questionBank.find(item => item.id === questionId);

    if (!question) {
        throw new RangeError("Unknown question ID.");
    }

    if (
        !Number.isInteger(optionIndex) ||
        optionIndex < 0 ||
        optionIndex >= question.options.length
    ) {
        throw new RangeError("Answer must be an option index from 0 to 3.");
    }

    return {
        correct: optionIndex === question.correctOptionIndex,
        correctOptionIndex: question.correctOptionIndex,
        correctAnswer: question.options[question.correctOptionIndex]
    };
}