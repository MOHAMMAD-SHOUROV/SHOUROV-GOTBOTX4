const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "emojiVoice",
    version: "1.0.0",
    author: "Replit Agent",
    category: "events"
  },

  onStart: async function ({ event, api }) {
    const { body, threadID, messageID } = event;
    if (!body) return;

    // Mapping of text/emoji to audio filename
    const mapping = {
      "hello": "hello.mp3",
      "😂": "laugh.mp3",
      "sad": "cry.mp3"
    };

    const normalizedBody = body.toLowerCase().trim();
    const fileName = mapping[normalizedBody];

    if (fileName) {
      const filePath = path.join(__dirname, "voices", fileName);
      if (fs.existsSync(filePath)) {
        api.sendMessage({
          attachment: fs.createReadStream(filePath)
        }, threadID, messageID);
      }
    }
  }
};
