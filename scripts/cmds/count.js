module.exports = {
	config: {
		name: "count",
		version: "1.4",
		author: "Alihsan Shourov)",
		countDown: 5,
		role: 0,
		description: {
			vi: "Xem số lượng tin nhắn của tất cả thành viên hoặc bản thân",
			en: "View the number of messages of all members or yourself"
		},
		category: "box chat"
	},

	langs: {
		en: {
			count: "📊 Message count:",
			endMessage: "Users not listed haven't sent any messages.",
			page: "Page [%1/%2]",
			reply: "Reply with page number to continue",
			result: "%1 is ranked %2 with %3 messages",
			yourResult: "You are ranked %1 with %2 messages",
			invalidPage: "Invalid page number"
		}
	},

	onStart: async function ({ args, threadsData, message, event, api, getLang }) {
		const { threadID, senderID } = event;

		const threadData = await threadsData.get(threadID);
		const members = threadData.members || [];
		const usersInGroup = (await api.getThreadInfo(threadID)).participantIDs;

		let arraySort = [];
		for (const user of members) {
			if (!usersInGroup.includes(user.userID)) continue;
			arraySort.push({
				name: user.name || `UID: ${user.userID}`,
				count: user.count || 0,
				uid: user.userID
			});
		}

		arraySort.sort((a, b) => b.count - a.count);
		arraySort.forEach((u, i) => u.stt = i + 1);

		// ALL
		if (args[0] === "all") {
			let msg = getLang("count");
			for (const u of arraySort)
				if (u.count > 0)
					msg += `\n${u.stt}. ${u.name}: ${u.count}`;
			return message.reply(msg);
		}

		// TAG
		if (Object.keys(event.mentions).length > 0) {
			let msg = "";
			for (const id in event.mentions) {
				const u = arraySort.find(i => i.uid == id);
				if (u)
					msg += `\n${getLang("result", u.name, u.stt, u.count)}`;
			}
			return message.reply(msg);
		}

		// SELF
		const me = arraySort.find(u => u.uid == senderID);
		if (me)
			return message.reply(getLang("yourResult", me.stt, me.count));
	},

	onChat: async ({ usersData, threadsData, event }) => {
		const { senderID, threadID } = event;

		let members = await threadsData.get(threadID, "members") || [];
		let member = members.find(u => u.userID == senderID);

		if (!member) {
			const userData = await usersData.get(senderID);
			members.push({
				userID: senderID,
				name: userData?.name || "Unknown User",
				count: 1
			});
		} else {
			member.count += 1;
		}

		await threadsData.set(threadID, members, "members");
	}
};