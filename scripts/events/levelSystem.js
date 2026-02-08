const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "levelData.json");
const LEVEL_UP_GIF = "https://files.catbox.moe/lxzpta.gif";
const MSG_PER_LEVEL = 10;

// Load data
function loadData() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
}

// Save data
function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "levelSystem",

  onChat: async ({ api, event, usersData }) => {
    try {
      // ignore bot & empty msg
      if (!event.senderID) return;
      if (event.senderID === api.getCurrentUserID()) return;
      if (!event.body || event.body.trim().length < 1) return;

      const uid = event.senderID;
      const data = loadData();

      if (!data[uid]) {
        data[uid] = {
          msg: 0,
          level: 1
        };
      }

      // increase message count
      data[uid].msg += 1;

      // calculate level properly
      const expectedLevel =
        Math.floor(data[uid].msg / MSG_PER_LEVEL) + 1;

      // level up only once
      if (expectedLevel > data[uid].level) {
        data[uid].level = expectedLevel;

        // find top chatter
        let topUID = uid;
        for (const id in data) {
          if (data[id].msg > data[topUID].msg) {
            topUID = id;
          }
        }

        const name =
          (await usersData.get?(uid))?.name ||
          (await api.getUserInfo(uid))?.[uid]?.name ||
          "User";

        const topName =
          (await usersData.get?(topUID))?.name ||
          (await api.getUserInfo(topUID))?.[topUID]?.name ||
          "Unknown";

        await api.sendMessage(
          {
            body:
`🎉 LEVEL UP 🎉

👤 Name: ${name}
⬆️ New Level: ${data[uid].level}
💬 Total Messages: ${data[uid].msg}

🏆 TOP CHATTER
👑 ${topName}
💬 ${data[topUID].msg} messages

✨ Keep chatting & stay active!`,
            attachment: await global.utils.getStreamFromURL(LEVEL_UP_GIF)
          },
          event.threadID
        );
      }

      saveData(data);

    } catch (err) {
      console.log("LevelSystem Error:", err);
    }
  }
};