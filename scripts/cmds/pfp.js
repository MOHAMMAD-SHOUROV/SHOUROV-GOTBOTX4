const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pfp",
    aliases: ["avatar", "profilepic"],
    version: "1.1",
    author: "alihsan shourov (fixed)",
    countDown: 5,
    role: 0,
    description: {
      vi: "Lấy ảnh đại diện của người dùng",
      en: "Fetch user's profile picture"
    },
    category: "utility",
    guide: {
      en:
        "{pn}\n" +
        "{pn} @tag\n" +
        "{pn} uid\n" +
        "{pn} facebook profile link\n" +
        "(or reply to someone)"
    }
  },

  langs: {
    en: {
      fetching: "🔍 Fetching profile picture...",
      success: "✓ Profile picture of %1",
      error: "× Could not fetch profile picture: %1",
      invalidUID: "! Invalid UID"
    }
  },

  onStart: async function ({ api, message, args, event, getLang, usersData }) {
    try {
      let uid = event.senderID;

      /* ===== UID RESOLVE ===== */
      if (event.messageReply?.senderID) {
        uid = event.messageReply.senderID;
      }
      else if (event.mentions && Object.keys(event.mentions).length > 0) {
        uid = Object.keys(event.mentions)[0];
      }
      else if (args[0]) {
        if (!isNaN(args[0])) {
          uid = args[0];
        }
        else if (args[0].includes("facebook.com")) {
          // profile.php?id=
          let match = args[0].match(/profile\.php\?id=(\d+)/);
          if (match) {
            uid = match[1];
          } else {
            // vanity username
            const vanity = args[0].match(/facebook\.com\/([^/?]+)/);
            if (vanity) {
              try {
                const res = await axios.get(`https://www.facebook.com/${vanity[1]}`);
                const uidMatch = res.data.match(/"userID":"(\d+)"/);
                if (uidMatch) uid = uidMatch[1];
              } catch {
                return message.reply(getLang("error", "Cannot extract UID from link"));
              }
            }
          }
        }
      }

      if (!uid || isNaN(uid)) {
        return message.reply(getLang("invalidUID"));
      }

      await message.reply(getLang("fetching"));

      /* ===== USER NAME ===== */
      const userName =
        ((await usersData.get?(uid))?.name ||
          (await api.getUserInfo(uid))?.[uid]?.name ||
          "Unknown User");

      /* ===== GRAPH URL (UNCHANGED) ===== */
      const avatarURL =
        `https://graph.facebook.com/${uid}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const cacheDir = path.join(__dirname, "cache");
      const cachePath = path.join(cacheDir, `pfp_${uid}.jpg`);
      await fs.ensureDir(cacheDir);

      const res = await axios.get(avatarURL, { responseType: "arraybuffer" });
      fs.writeFileSync(cachePath, res.data);

      await message.reply({
        body: getLang("success", userName),
        attachment: fs.createReadStream(cachePath)
      });

      fs.unlinkSync(cachePath);

    } catch (err) {
      console.error("PFP ERROR:", err);
      return message.reply(getLang("error", err.message));
    }
  }
};