module.exports = {
  config: {
    name: "antiout",
    version: "1.1",
    author: "alihsan shourov (Fixed)",
    countDown: 5,
    role: 1,
    shortDescription: {
      en: "Prevent members from leaving the group"
    },
    longDescription: {
      en: "Automatically adds members back if they leave the group"
    },
    category: "admin",
    guide: {
      en: "{pn} on | off"
    }
  },

  langs: {
    en: {
      turnedOn: "🛡️ Anti-out has been ENABLED for this group",
      turnedOff: "🛡️ Anti-out has been DISABLED for this group",
      addedBack:
        "⚠️ Attention %1!\nThis group is protected.\nYou are not allowed to leave!",
      missingPermission:
        "❌ Failed to add %1 back.\nThey may have blocked the bot or Messenger is restricted."
    }
  },

  onStart: async function ({ args, message, event, threadsData, getLang }) {
    const option = args[0];

    if (option === "on") {
      await threadsData.set(event.threadID, true, "data.antiout");
      return message.reply(getLang("turnedOn"));
    }

    if (option === "off") {
      await threadsData.set(event.threadID, false, "data.antiout");
      return message.reply(getLang("turnedOff"));
    }

    return message.reply("❗ Use: antiout on | antiout off");
  },

  onEvent: async function ({ event, api, threadsData, usersData, getLang }) {
    if (event.logMessageType !== "log:unsubscribe") return;

    const antiout = await threadsData.get(event.threadID, "data.antiout");
    if (!antiout) return;

    const leftID = event.logMessageData.leftParticipantFbId;

    // Ignore bot itself
    if (leftID === api.getCurrentUserID()) return;

    const name =
      ((await usersData.get?.(leftID))?.name) || "Unknown User";

    try {
      await api.addUserToGroup(leftID, event.threadID);
      await api.sendMessage(
        getLang("addedBack", name),
        event.threadID
      );
    } catch (err) {
      await api.sendMessage(
        getLang("missingPermission", name),
        event.threadID
      );
    }
  }
};