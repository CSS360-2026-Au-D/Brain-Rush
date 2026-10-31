import { db } from "../xp/xpStorage";
import { awardXP } from "../xp/xpManager";
import { createChallenge, checkAnswer } from "./challenge.js";
import { questionBank } from "./questionBank.js";

const XP_PER_CORRECT = 10;

db.exec(`
    CREATE TABLE IF NOT EXISTS daily_challenges (
        server_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        day TEXT NOT NULL,
        question_ids TEXT NOT NULL,
        answered INTEGER NOT NULL DEFAULT 0,
        history TEXT NOT NULL,
        PRIMARY KEY (server_id, user_id)
    );
`);

function todayUTC() {
    return new Date().toISOString().slice(0, 10);
}

function readState(serverId, userId) {
    return db.prepare(`
        SELECT * FROM daily_challenges
        WHERE server_id = ? AND user_id = ?
    `).get(serverId, userId);
}

function displayProgress(state) {
    const ids = JSON.parse(state.question_ids);

    if (state.answered >= ids.length) {
        return {
            complete: true,
            answered: state.answered,
            total: ids.length
        };
    }

    const item = questionBank.find(
        question => question.id === ids[state.answered]
    );

    return {
        complete: false,
        answered: state.answered,
        total: ids.length,
        question: {
            id: item.id,
            question: item.question,
            options: [...item.options],
            difficulty: item.difficulty,
            topic: item.topic
        }
    };
}

const startTransaction = db.transaction((serverId, userId) => {
    const day = todayUTC();
    let state = readState(serverId, userId);

    // Resume today's challenge instead of generating extra questions.
    if (state && state.day === day) {
        return displayProgress(state);
    }

    let history = state ? JSON.parse(state.history) : [];

    const remaining = questionBank.filter(
        question =>
            question.topic === "sports" &&
            !history.includes(question.id)
    );

    // Reuse the bank only after fewer than five unseen questions remain.
    if (remaining.length < 5) {
        history = [];
    }

    const questions = createChallenge({
        interests: ["sports"],
        count: 5,
        excludedIds: history
    });

    const ids = questions.map(question => question.id);
    const updatedHistory = [...new Set([...history, ...ids])];

    db.prepare(`
        INSERT INTO daily_challenges
            (server_id, user_id, day, question_ids, answered, history)
        VALUES (?, ?, ?, ?, 0, ?)
        ON CONFLICT(server_id, user_id) DO UPDATE SET
            day = excluded.day,
            question_ids = excluded.question_ids,
            answered = 0,
            history = excluded.history
    `).run(
        serverId,
        userId,
        day,
        JSON.stringify(ids),
        JSON.stringify(updatedHistory)
    );

    return displayProgress(readState(serverId, userId));
});

export function startDailyChallenge(serverId, userId) {
    return startTransaction.immediate(serverId, userId);
}

const answerTransaction = db.transaction(
    (serverId, userId, questionId, optionIndex) => {
        const state = readState(serverId, userId);

        if (!state || state.day !== todayUTC()) {
            throw new Error("Start today's challenge with !daily sports.");
        }

        const ids = JSON.parse(state.question_ids);

        if (state.answered >= ids.length) {
            throw new Error("You finished today's five questions!");
        }

        // Reject answers from old prompts or already answered questions.
        if (ids[state.answered] !== questionId) {
            throw new Error("That question is no longer active.");
        }

        const result = checkAnswer(questionId, optionIndex);

        const xpResult = result.correct
            ? awardXP(serverId, userId, XP_PER_CORRECT)
            : null;

        db.prepare(`
            UPDATE daily_challenges
            SET answered = answered + 1
            WHERE server_id = ? AND user_id = ?
        `).run(serverId, userId);

        return {
            ...result,
            xpAwarded: result.correct ? XP_PER_CORRECT : 0,
            xpResult,
            progress: displayProgress(readState(serverId, userId))
        };
    }
);

export function answerDailyQuestion(
    serverId,
    userId,
    questionId,
    optionIndex
) {
    return answerTransaction.immediate(
        serverId,
        userId,
        questionId,
        optionIndex
    );
}