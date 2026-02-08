const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "../levelData.json");

module.exports = {
  config: {
    name: "toplevel",
    aliases: ["top"],
    role: 0,
    description: "Show top chatters"
  },

  run: async ({ api, event, usersData }) => {
    if (!fs.existsSync(DATA_PATH)) {
      return api.sendMessage("❌ No data found", event.threadID);
    }

    const data = JSON.parse(fs.readFileSync(DATA_PATH));
    if (!Object.keys(data).length) {
      return api.sendMessage("❌ No users ranked yet", event.threadID);
    }

    const sorted = Object.entries(data)
      .sort((a, b) => b[1].msg - a[1].msg)
      .slice(0, 5);

    let msg = "🏆 TOP LEVEL USERS 🏆\n\n";
    let i = 1;

    for (const [uid, info] of sorted) {
      const name = await usersData.getName(uid);
      msg += `${i}. 👑 ${name}\n   ⭐ Level: ${info.level}\n   💬 Msg: ${info.msg}\n\n`;
      i++;
    }

    api.sendMessage(msg, event.threadID);
  }
};