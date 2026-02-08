const axios = require("axios");

let API_CACHE = null;
async function getApiConfig() {
	if (API_CACHE) return API_CACHE;
	const { data } = await axios.get(
		"https://raw.githubusercontent.com/MOHAMMAD-NAYAN-07/Nayan/main/api.json"
	);
	API_CACHE = data;
	return data;
}

module.exports = {
	config: {
		name: "bot",
		version: "2.4.0",
		role: 0,
		credits: "Alihsan Shourov (fixed)",
		description: "Smart chat bot (Simsimi style)",
		prefix: false,
		category: "fun"
	},

	onStart: async function ({ api, event, args, usersData }) {
		const { threadID, messageID, senderID } = event;
		const query = args.join(" ").trim();

		try {
			const apiConf = await getApiConfig();
			const apiUrl = apiConf.sim;
			const apiUrl2 = apiConf.api2;

			const userData = await usersData.get(senderID);
			const userName = userData?.name || "User";

			// ===== NO TEXT =====
			if (!query) {
				const replies = [
					"হুম বলো জান 😌",
					"আমাকে ডাকছো কেনো 🫣",
					"এই যে আমি শুনছি 👀",
					"বারবার ডাকলে প্রেমে পড়ে যাবো কিন্তু 😏"
				];
				return api.sendMessage(
					`「 ${userName} 」\n\n${replies[Math.floor(Math.random() * replies.length)]}`,
					threadID,
					messageID
				);
			}

			// ===== TEACH =====
			if (query.startsWith("teach")) {
				const p = query.replace("teach", "").trim().split("&");
				const q = p[0]?.replace("ask=", "").trim();
				const a = p[1]?.replace("ans=", "").trim();
				if (!q || !a)
					return api.sendMessage(
						"⚠️ teach ask=[q]&ans=[a]",
						threadID,
						messageID
					);

				const res = await axios.get(
					`${apiUrl}/sim?type=teach&ask=${encodeURIComponent(q)}&ans=${encodeURIComponent(a)}`
				);
				return api.sendMessage(res.data.msg || "✅ Done", threadID, messageID);
			}

			// ===== INFO =====
			if (query === "info") {
				const res = await axios.get(`${apiUrl}/sim?type=info`);
				return api.sendMessage(
					`📊 Total Ask: ${res.data.data.totalKeys}\n📊 Total Ans: ${res.data.data.totalResponses}`,
					threadID,
					messageID
				);
			}

			// ===== NORMAL CHAT =====
			const res = await axios.get(
				`${apiUrl}/sim?type=ask&ask=${encodeURIComponent(query)}`
			);
			let reply = res.data?.data?.msg || "🙂";

			// font fallback safe
			try {
				const font = await axios.get(
					`${apiUrl2}/bold?text=${encodeURIComponent(reply)}&type=serif`
				);
				reply = font.data?.data?.bolded || reply;
			} catch {}

			api.sendMessage(reply, threadID, (err, info) => {
				if (!err) {
					global.GoatBot.onReply.set(info.messageID, {
						commandName: "bot",
						author: senderID
					});
				}
			}, messageID);

		} catch (e) {
			console.error("BOT ERROR:", e);
			api.sendMessage("⚠️ Bot is tired, try later 😴", threadID, messageID);
		}
	},

	onReply: async function ({ api, event, Reply }) {
		const { senderID, threadID, messageID, body } = event;
		if (Reply.author !== senderID) return;
		if (!body || typeof body !== "string") return;

		try {
			const apiConf = await getApiConfig();
			const res = await axios.get(
				`${apiConf.sim}/sim?type=ask&ask=${encodeURIComponent(body)}`
			);
			let reply = res.data?.data?.msg || "🙂";

			try {
				const font = await axios.get(
					`${apiConf.api2}/bold?text=${encodeURIComponent(reply)}&type=serif`
				);
				reply = font.data?.data?.bolded || reply;
			} catch {}

			api.sendMessage(reply, threadID, (err, info) => {
				if (!err) {
					global.GoatBot.onReply.set(info.messageID, {
						commandName: "bot",
						author: senderID
					});
				}
			}, messageID);

		} catch (e) {
			console.error("REPLY ERROR:", e);
		}
	}
};