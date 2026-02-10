const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "levelsystem",
    version: "1.0.0",
    author: "alihsan shourov",
    countDown: 5,
    role: 0,
    shortDescription: "Level system with rank-up message",
    longDescription: "Increase XP on every message and send rank-up notification",
    category: "system",
    guide: ""
  },

  onChat: async function ({ threadsData, usersData, event, api }) {
    const { threadID, senderID } = event;
    const threadData = await threadsData.get(threadID);
    const sendRankup = threadData.settings?.sendRankup ?? true;

    if (!sendRankup) return;

    const userData = await usersData.get(senderID);
    let { exp = 0, level = 1, name } = userData;

    exp += 1;
    const nextLevelExp = Math.floor(5 * Math.pow(level, 2)) + 50 * level + 100;

    if (exp >= nextLevelExp) {
      level += 1;
      const rankUpMsg = `🎉 Congratulations ${name}, you reached level ${level}!`;
      const assetsDir = path.join(__dirname, "level_assets");
      
      let attachment;
      if (fs.existsSync(assetsDir)) {
        const files = fs.readdirSync(assetsDir);
        if (files.length > 0) {
          const randomFile = files[Math.floor(Math.random() * files.length)];
          attachment = fs.createReadStream(path.join(assetsDir, randomFile));
        }
      }

      const msg = { body: rankUpMsg };
      if (attachment) msg.attachment = attachment;

      api.sendMessage(msg, threadID);
    }

    await usersData.set(senderID, { exp, level });
  }
};
