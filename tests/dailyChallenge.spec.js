const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

describe("Daily sports challenges", function () {
    let db;
    let startDailyChallenge;
    let answerDailyQuestion;
    let getXP;
    let questionBank;
    let temporaryFolder;

    before(function () {
        const projectFolder = process.cwd();
        temporaryFolder = fs.mkdtempSync(
            path.join(os.tmpdir(), "brain-rush-test-")
        );

        // Open a separate test database, not the bot's real database.
        process.chdir(temporaryFolder);

        try {
            ({ db, getXP } = require(
                path.join(projectFolder, "src/xp/xpStorage.js")
            ));

            ({ startDailyChallenge, answerDailyQuestion } = require(
                path.join(projectFolder, "src/trivia/dailyChallenge.js")
            ));

            ({ questionBank } = require(
                path.join(projectFolder, "src/trivia/questionBank.js")
            ));
        } finally {
            process.chdir(projectFolder);
        }
    });

    after(function () {
        if (db) db.close();
        if (temporaryFolder) {
            fs.rmSync(temporaryFolder, { recursive: true, force: true });
        }
    });

    function correctOption(questionId) {
        return questionBank.find(q => q.id === questionId)
            .correctOptionIndex;
    }

    it("resumes the same challenge", function () {
        const first = startDailyChallenge("server", "resume-user");
        const second = startDailyChallenge("server", "resume-user");

        assert.equal(first.question.id, second.question.id);
        assert.equal(second.answered, 0);
        assert.equal(second.total, 5);
    });

    it("awards 10 XP once and rejects a repeated answer", function () {
        const first = startDailyChallenge("server", "correct-user");
        const option = correctOption(first.question.id);

        const result = answerDailyQuestion(
            "server", "correct-user", first.question.id, option
        );

        assert.equal(result.xpAwarded, 10);
        assert.equal(getXP("server", "correct-user"), 10);
        assert.equal(result.progress.answered, 1);

        assert.throws(() => answerDailyQuestion(
            "server", "correct-user", first.question.id, option
        ), /no longer active/);

        assert.equal(getXP("server", "correct-user"), 10);
    });

    it("gives no XP for a wrong answer but counts the question", function () {
        const first = startDailyChallenge("server", "wrong-user");
        const wrongOption = (correctOption(first.question.id) + 1) % 4;

        const result = answerDailyQuestion(
            "server", "wrong-user", first.question.id, wrongOption
        );

        assert.equal(result.correct, false);
        assert.equal(result.xpAwarded, 0);
        assert.equal(getXP("server", "wrong-user"), 0);
        assert.equal(result.progress.answered, 1);
    });

    it("stops after five questions, even when started again", function () {
        let progress = startDailyChallenge("server", "limit-user");

        for (let i = 0; i < 5; i++) {
            const id = progress.question.id;
            progress = answerDailyQuestion(
                "server", "limit-user", id, correctOption(id)
            ).progress;
        }

        assert.equal(progress.complete, true);
        assert.equal(getXP("server", "limit-user"), 50);
        assert.equal(
            startDailyChallenge("server", "limit-user").complete,
            true
        );

        assert.throws(() => answerDailyQuestion(
            "server", "limit-user", "sports-01", 0
        ), /finished/);
    });

    it("keeps different users and servers separate", function () {
        assert.equal(
            startDailyChallenge("server", "another-user").answered,
            0
        );

        assert.equal(
            startDailyChallenge("another-server", "correct-user").answered,
            0
        );

        assert.equal(getXP("another-server", "correct-user"), 0);
    });
});