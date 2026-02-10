const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "emojiVideo",
    version: "1.0.0",
    author: "alihsan shourov",
    category: "events"
  },

  onStart: async function ({ event, api }) {
    const { body, threadID, messageID } = event;
    if (!body) return;

    // Mapping of text/emoji to video filename
    const mapping = {
      "king": "cover.mp4",
      "🔥": "fire.mp4"
    };

    const normalizedBody = body.toLowerCase().trim();
    const fileName = mapping[normalizedBody];

    if (fileName) {
      const filePath = path.join(__dirname, "videos", fileName);
      if (fs.existsSync(filePath)) {
        api.sendMessage({
          attachment: fs.createReadStream(filePath)
        }, threadID, messageID);
      }
    }
  }
};
