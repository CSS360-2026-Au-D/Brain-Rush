import {
    startDailyChallenge,
    answerDailyQuestion
} from "./dailyChallenge.js";

async function showQuestion(message, progress) {
    if (progress.complete) {
        await message.reply(
            "You finished today's five questions! " +
            "Come back after midnight UTC for your next challenge."
        );
        return;
    }

    const question = progress.question;

    const choices = question.options
        .map((option, index) => `${index + 1}. ${option}`)
        .join("\n");

    await message.reply({
        embeds: [{
            title: `Sports: Question ${progress.answered + 1}/${progress.total}`,
            description:
                `${question.question}\n\n${choices}\n\n` +
                "**Reply to this message** with `!answer 1`, " +
                "`!answer 2`, `!answer 3`, or `!answer 4`.",
            color: 0x5865F2,
            footer: {
                text: `brainrush:${message.author.id}:${question.id}`
            }
        }],
        allowedMentions: { repliedUser: false }
    });
}

export async function handleTrivia(message, client) {
    const parts = message.content.trim().split(/\s+/);
    const command = parts[0].toLowerCase();

    if (command !== "!daily" && command !== "!answer") {
        return false;
    }

    if (!message.guild) {
        await message.reply("Use this command in a server.");
        return true;
    }

    try {
        if (command === "!daily") {
            if (
                parts.length !== 2 ||
                parts[1].toLowerCase() !== "sports"
            ) {
                await message.reply("Usage: !daily sports");
                return true;
            }

            const progress = startDailyChallenge(
                message.guild.id,
                message.author.id
            );

            await showQuestion(message, progress);
            return true;
        }

        if (parts.length !== 2 || !/^[1-4]$/.test(parts[1])) {
            await message.reply(
                "Reply to your question with !answer followed by 1, 2, 3, or 4."
            );
            return true;
        }

        if (!message.reference?.messageId) {
            await message.reply(
                "Reply directly to your Brain Rush question message."
            );
            return true;
        }

        const prompt = await message.fetchReference().catch(() => null);

        if (!prompt || prompt.author.id !== client.user.id) {
            await message.reply("Reply to a question sent by this bot.");
            return true;
        }

        const footer = prompt.embeds[0]?.footer?.text || "";
        const match = /^brainrush:(\d+):(sports-\d+)$/.exec(footer);

        if (!match || match[1] !== message.author.id) {
            await message.reply("Reply to your own Brain Rush question.");
            return true;
        }

        const result = answerDailyQuestion(
            message.guild.id,
            message.author.id,
            match[2],
            Number(parts[1]) - 1
        );

        const feedback = result.correct
            ? `Correct! +${result.xpAwarded} XP.`
            : `Incorrect. The answer was: ${result.correctAnswer}. No XP lost.`;

        await message.reply({
            content: feedback,
            allowedMentions: { repliedUser: false }
        });

        await showQuestion(message, result.progress);
    } catch (error) {
        const expectedMessages = [
            "Start today's challenge with !daily sports.",
            "You finished today's five questions!",
            "That question is no longer active."
        ];

        if (expectedMessages.includes(error.message)) {
            await message.reply(error.message);
        } else {
            console.error("Trivia command failed:", error);
            await message.reply(
                "Something went wrong. Use !daily sports to resume your challenge."
            );
        }
    }

    return true;
}