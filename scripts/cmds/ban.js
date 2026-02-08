const { findUid } = global.utils;
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "ban",
    version: "1.5",
    author: "alihsan Shourov",
    countDown: 5,
    role: 1,
    description: {
      en: "Ban user from box chat"
    },
    category: "box chat"
  },

  langs: {
    en: {
      notFoundTarget: "⚠ | Please tag / reply / uid / fb link of the user",
      cantSelfBan: "⚠ | You can't ban yourself!",
      cantBanAdmin: "✗ | You can't ban an admin!",
      existedBan: "✗ | This user is already banned!",
      bannedSuccess: "✓ | Banned %1 from box chat!",
      unbannedSuccess: "✓ | Unbanned %1!",
      userNotBanned: "⚠ | This user is not banned",
      noReason: "No reason",
      noData: "≡ | No banned users",
      listBanned: "≡ | Banned list (page %1/%2)",
      content: "%1/ %2 (%3)\nReason: %4\nTime: %5\n\n"
    }
  },

  onStart: async function ({
    message,
    event,
    args = [],
    threadsData,
    usersData,
    api,
    getLang,
    resolveTargetID
  }) {

    const { senderID, threadID } = event;
    const dataBanned = await threadsData.get(threadID, "data.banned_ban", []);
    const { members, adminIDs } = await threadsData.get(threadID);

    /* ================= UNBAN ================= */
    if (args[0] === "unban") {
      const targetID = resolveTargetID(args.slice(1), event);
      if (!targetID)
        return message.reply(getLang("notFoundTarget"));

      const index = dataBanned.findIndex(u => u.id == targetID);
      if (index === -1)
        return message.reply(getLang("userNotBanned"));

      dataBanned.splice(index, 1);
      await threadsData.set(threadID, dataBanned, "data.banned_ban");

      const name =
        members[targetID]?.name ||
        ((await usersData.get?(targetID))?.name || "Unknown User");

      return message.reply(getLang("unbannedSuccess", name));
    }

    /* ================= LIST ================= */
    if (args[0] === "list") {
      if (!dataBanned.length)
        return message.reply(getLang("noData"));

      const limit = 10;
      const page = parseInt(args[1]) || 1;
      const start = (page - 1) * limit;
      const list = dataBanned.slice(start, start + limit);

      let msg = "";
      let i = start + 1;
      for (const u of list) {
        const name =
          members[u.id]?.name ||
          ((await usersData.get?(u.id))?.name || "Unknown User");
        msg += getLang("content", i++, name, u.id, u.reason, u.time);
      }

      return message.reply(
        getLang("listBanned", page, Math.ceil(dataBanned.length / limit)) +
          "\n\n" +
          msg
      );
    }

    /* ================= BAN ================= */
    const targetID = resolveTargetID(args, event);
    if (!targetID)
      return message.reply(getLang("notFoundTarget"));

    if (targetID == senderID)
      return message.reply(getLang("cantSelfBan"));

    if (adminIDs.includes(targetID))
      return message.reply(getLang("cantBanAdmin"));

    if (dataBanned.some(u => u.id == targetID))
      return message.reply(getLang("existedBan"));

    const reason = args.slice(1).join(" ") || getLang("noReason");
    const time = moment()
      .tz(global.GoatBot.config.timeZone)
      .format("HH:mm:ss DD/MM/YYYY");

    dataBanned.push({
      id: targetID,
      reason,
      time
    });

    await threadsData.set(threadID, dataBanned, "data.banned_ban");

    const name =
      members[targetID]?.name ||
      ((await usersData.get?(targetID))?.name || "Unknown User");

    message.reply(getLang("bannedSuccess", name));

    // auto kick if bot admin
    if (adminIDs.includes(api.getCurrentUserID())) {
      if (event.participantIDs?.includes(targetID))
        api.removeUserFromGroup(targetID, threadID);
    }
  },

  onEvent: async function ({ event, api, threadsData, getLang }) {
    if (event.logMessageType !== "log:subscribe") return;

    const dataBanned = await threadsData.get(event.threadID, "data.banned_ban", []);
    for (const user of event.logMessageData.addedParticipants || []) {
      const banned = dataBanned.find(u => u.id == user.userFbId);
      if (banned) {
        api.removeUserFromGroup(user.userFbId, event.threadID);
      }
    }
  }
};