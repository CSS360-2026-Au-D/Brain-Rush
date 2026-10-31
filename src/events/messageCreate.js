import { awardXP, calculateLevel } from "../xp/xpManager";
import { getXP } from "../xp/xpStorage";

const event = {
    name: "messageCreate",

    async execute(message, client){
        if (message.author.bot){
            return;
        }
        
        const parts = message.content.trim().split(/\s+/);

        if(parts[0] === "!testxp"){
            if (!message.guild || !message.member){
                console.log("This command must be used in a serve!");
                return;
            }

            if(!message.member.permissions.has("Administrator")){
                console.log("You don't have permission to be use this command!");
                return;
            }
            const user = message.mentions.users.first();

            if(!user){
                console.log("No user was mentioned!");
                return;
            }

            const amountText = parts[2];
            if(parts.length !== 3 || !/^\d+$/.test(amountText)){
                console.log("Invalid XP amount!");
                return;
            }

            const amount = Number(amountText);

            if(!Number.isSafeInteger(amount) || amount <= 0){
                console.log("Invalid XP amount!");
                return;
            }

            const member = await message.guild.members.fetch(user.id).catch(()=> null);

            if(!member) {
                await message.reply("That user is not a member of this server!");
                return;
            }

            try{
                const result = awardXP(message.guild.id, user.id, amount);

                let response = `Added ${amount} XP to ${user}!\n`;
                response += `Total XP: ${result.xp}\n`;
                response += `Current Level: ${result.level}`;

                if(result.leveledUp){
                    response += `\n🎉 ${user} leveled up!`;
                }

                await message.reply(response);
            } catch(error){
                console.error("Error awarding XP: ", error);
                await message.reply("Something went wrong while awarding XP.");
            }
        }

        if (parts[0] === "!level"){
            if (!message.guild){
                return;
            }

            const user = message.mentions.users.first();

            if(parts.length !== 2 || !user){
                await message.reply("Usage : !level @user");
                return;
            }

            const member = await message.guild.members.fetch(user.id);

            if (!member) {
                await message.reply("That user is not in this serevr!");
                return;
            }

            const xp = getXP(message.guild.id, user.id);
            const level = calculateLevel(xp);
            const xpNeeded = level * 100 - xp;

            await message.reply(
                `${user}'s Progress: \n` +
                `Level: ${level}\n` +
                `Total XP: ${xp}\n` +
                `XP until next level: ${xpNeeded}`
            );
        }
    },
};

export default event;