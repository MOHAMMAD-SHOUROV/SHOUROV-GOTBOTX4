const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "daily",
		version: "1.3",
		author: "alihsan Shourov",
		countDown: 5,
		role: 0,
		description: {
			en: "Receive daily reward"
		},
		category: "game",
		envConfig: {
			rewardFirstDay: {
				coin: 100,
				exp: 10
			}
		}
	},

	langs: {
		en: {
			monday: "Monday",
			tuesday: "Tuesday",
			wednesday: "Wednesday",
			thursday: "Thursday",
			friday: "Friday",
			saturday: "Saturday",
			sunday: "Sunday",
			alreadyReceived: "❌ You already received today's reward",
			received: "🎁 You received %1 coin and %2 exp"
		}
	},

	onStart: async function ({ args, message, event, envCommands, usersData, commandName, getLang }) {
		const reward = envCommands[commandName].rewardFirstDay;
		const { senderID } = event;

		// INFO
		if (args[0] === "info") {
			let msg = "📅 Daily rewards:\n\n";
			const days = [
				getLang("sunday"),
				getLang("monday"),
				getLang("tuesday"),
				getLang("wednesday"),
				getLang("thursday"),
				getLang("friday"),
				getLang("saturday")
			];

			for (let i = 1; i <= 7; i++) {
				const coin = Math.floor(reward.coin * Math.pow(1.2, i - 1));
				const exp = Math.floor(reward.exp * Math.pow(1.2, i - 1));
				msg += `${days[i % 7]}: ${coin} coin, ${exp} exp\n`;
			}
			return message.reply(msg);
		}

		// TIME
		const today = moment.tz("Asia/Dhaka").format("DD/MM/YYYY");
		const currentDay = new Date().getDay(); // 0 sunday

		// USER DATA
		const userData = await usersData.get(senderID);
		if (!userData.data) userData.data = {};

		if (userData.data.lastTimeGetReward === today)
			return message.reply(getLang("alreadyReceived"));

		// CALC REWARD
		const dayIndex = currentDay === 0 ? 7 : currentDay;
		const coin = Math.floor(reward.coin * Math.pow(1.2, dayIndex - 1));
		const exp = Math.floor(reward.exp * Math.pow(1.2, dayIndex - 1));

		userData.data.lastTimeGetReward = today;

		await usersData.set(senderID, {
			money: (userData.money || 0) + coin,
			exp: (userData.exp || 0) + exp,
			data: userData.data
		});

		message.reply(getLang("received", coin, exp));
	}
};