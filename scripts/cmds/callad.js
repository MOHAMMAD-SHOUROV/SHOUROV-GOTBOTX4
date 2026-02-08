const { getStreamsFromAttachment, log } = global.utils;

const mediaTypes = ["photo", "animated_image", "video", "audio", "sticker", "gif"];

module.exports = {
	config: {
		name: "callad",
		version: "2.1.0",
		author: "Alihsan Shourov (fixed)",
		countDown: 5,
		role: 0,
		description: {
			en: "Send feedback to admin or admin broadcast (GIF/Sticker supported)",
			vi: "Gửi phản hồi tới admin hoặc admin gửi thông báo"
		},
		category: "contacts admin"
	},

	langs: {
		en: {
			missingMessage: "Please enter a message or attach media!",
			success: "Sent successfully to %1 target(s)!",
			noAdmin: "Bot has no admin",
			replySuccess: "Reply sent successfully!",
			error: "Error while sending message",
			adminNotification: "📢 ADMIN NOTICE\n\nFrom: %1\n\n%2\n\nReply to chat",
			replyFrom: "📩 Reply from %1\n────────────\n%2"
		}
	},

	onStart: async function ({ args, message, event, usersData, threadsData, api, getLang }) {
		try {
			const { senderID, threadID, isGroup } = event;
			const admins = global.GoatBot.config.adminBot;

			if (!admins || admins.length === 0)
				return message.reply(getLang("noAdmin"));

			const text = args.join(" ");
			const atts = [
				...(event.attachments || []),
				...(event.messageReply?.attachments || [])
			].filter(a => mediaTypes.includes(a.type));

			if (!text && atts.length === 0)
				return message.reply(getLang("missingMessage"));

			const user = await usersData.get(senderID);
			const senderName = user?.name || "Unknown User";
			const isAdmin = admins.includes(senderID);

			// ===== ADMIN BROADCAST =====
			if (isAdmin) {
				const allThreads = await threadsData.getAll();
				const groups = allThreads.filter(t => t.isGroup && t.threadID !== threadID);
				let sent = 0;

				for (const t of groups) {
					try {
						const info = await api.sendMessage({
							body: getLang("adminNotification", senderName, text || "(Attachment)"),
							attachment: await getStreamsFromAttachment(atts)
						}, t.threadID);

						global.GoatBot.onReply.set(info.messageID, {
							commandName: "callad",
							threadID,
							type: "adminToGroup"
						});
						sent++;
					} catch {}
				}
				return message.reply(getLang("success", sent));
			}

			// ===== USER → ADMIN =====
			let count = 0;
			for (const admin of admins) {
				try {
					const info = await api.sendMessage({
						body:
							`📨 CALL ADMIN\n\nFrom: ${senderName}\nUID: ${senderID}` +
							(isGroup ? `\nGroup ID: ${threadID}` : "") +
							`\n\n${text || "(Attachment)"}`,
						attachment: await getStreamsFromAttachment(atts)
					}, admin);

					global.GoatBot.onReply.set(info.messageID, {
						commandName: "callad",
						threadID,
						type: "userToAdmin"
					});
					count++;
				} catch {}
			}
			return message.reply(getLang("success", count));
		}
		catch (e) {
			log.err("CALLAD", e);
			return message.reply(getLang("error"));
		}
	},

	onReply: async function ({ args, event, api, message, Reply, usersData, getLang }) {
		try {
			const text = args.join(" ");
			const atts = (event.attachments || []).filter(a => mediaTypes.includes(a.type));
			if (!text && atts.length === 0) return;

			const user = await usersData.get(event.senderID);
			const senderName = user?.name || "Unknown User";

			const msg = {
				body: getLang("replyFrom", senderName, text || "(Attachment)"),
				attachment: await getStreamsFromAttachment(atts)
			};

			await api.sendMessage(msg, Reply.threadID);
			return message.reply(getLang("replySuccess"));
		}
		catch (e) {
			log.err("CALLAD_REPLY", e);
			return message.reply(getLang("error"));
		}
	}
};