const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "levelData.json");
const LEVEL_UP_GIF = "https://files.catbox.moe/lxzpta.gif";
const MSG_PER_LEVEL = 10;

// load data
function loadData() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
}

// save data
function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
  onChat: async function ({ api, event, usersData }) {
    try {
      if (!event.body) return;
      if (event.senderID === api.getCurrentUserID()) return;

      const threadID = event.threadID;
      const uid = event.senderID;

      const data = loadData();

      if (!data[threadID]) data[threadID] = {};
      if (!data[threadID][uid]) {
        data[threadID][uid] = { msg: 0, level: 1 };
      }

      data[threadID][uid].msg += 1;

      // level up check
      if (data[threadID][uid].msg % MSG_PER_LEVEL === 0) {
        data[threadID][uid].level += 1;

        // find top chatter in this group
        let topUID = uid;
        for (const id in data[threadID]) {
          if (data[threadID][id].msg > data[threadID][topUID].msg) {
            topUID = id;
          }
        }

        const name =
          ((await usersData.get?(uid))?.name) || "User";
        const topName =
          ((await usersData.get?(topUID))?.name) || "Unknown";

        await api.sendMessage(
          {
            body:
`🎉 LEVEL UP 🎉

👤 Name: ${name}
⬆️ New Level: ${data[threadID][uid].level}
💬 Total Messages: ${data[threadID][uid].msg}

🏆 TOP CHATTER
👑 ${topName}
💬 ${data[threadID][topUID].msg} messages

✨ Keep chatting!`,
            attachment: await global.utils.getStreamFromURL(LEVEL_UP_GIF)
          },
          threadID
        );
      }

      saveData(data);
    } catch (e) {
      console.log("LEVEL SYSTEM ERROR:", e.message);
    }
  }
};