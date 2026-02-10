const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { loadImage, createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "hug",
    aliases: ["embrace"],
    version: "1.1",
    author: "alihsan shourov",
    countDown: 5,
    role: 0,
    shortDescription: "Give someone a warm hug 💕",
    longDescription: "Warm hug image with reply & mention support",
    category: "fun",
    guide: "{pn} @mention OR reply"
  },

  onStart: async function ({ event, api, usersData, args }) {
    let processingMsg;
    try {
      processingMsg = await api.sendMessage(
        "🔄 Preparing a warm hug for you...",
        event.threadID
      );

      /* ===== TARGET RESOLVE (SAFE) ===== */
      let targetID = null;
      let targetName = "Friend";

      if (event.messageReply?.senderID) {
        targetID = event.messageReply.senderID;
        targetName =
          ((await usersData.get(targetID))?.name || "Friend");
      } else if (event.mentions && Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
        targetName = event.mentions[targetID];
      }

      if (!targetID) {
        await api.sendMessage(
          "💝 Please tag someone or reply to their message!",
          event.threadID,
          event.messageID
        );
        return api.unsendMessage(processingMsg.messageID);
      }

      if (targetID === event.senderID) {
        await api.sendMessage(
          "🤗 You can't hug yourself! Here's a virtual hug from me 💕",
          event.threadID
        );
        return api.unsendMessage(processingMsg.messageID);
      }

      const huggerID = event.senderID;
      const huggerName =
        ((await usersData.get(huggerID))?.name || "Someone");

      /* ===== TMP DIR ===== */
      const tmpDir = path.join(__dirname, "tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

      /* ===== AVATAR FETCH ===== */
      const getAvatar = async (uid) => {
        try {
          const avatarPath = path.join(tmpDir, `${uid}.png`);
          const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512`;
          const res = await axios.get(url, { responseType: "arraybuffer" });
          fs.writeFileSync(avatarPath, res.data);
          return avatarPath;
        } catch {
          return null;
        }
      };

      await api.sendMessage(
        "📸 Getting avatars...",
        event.threadID,
        processingMsg.messageID
      );

      const huggerAvatarPath = await getAvatar(huggerID);
      const targetAvatarPath = await getAvatar(targetID);

      if (!huggerAvatarPath || !targetAvatarPath) {
        await api.sendMessage(
          "❌ Failed to load avatars. Try again later!",
          event.threadID
        );
        return api.unsendMessage(processingMsg.messageID);
      }

      /* ===== CANVAS (UNCHANGED LOGIC) ===== */
      let bg;
      try {
        bg = await loadImage("https://files.catbox.moe/n7x1vy.jpg");
      } catch {
        bg = { width: 800, height: 600 };
      }

      const canvas = createCanvas(bg.width || 800, bg.height || 600);
      const ctx = canvas.getContext("2d");

      if (bg.width) ctx.drawImage(bg, 0, 0);
      else {
        const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        g.addColorStop(0, "#FFB6C1");
        g.addColorStop(1, "#FF69B4");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const huggerAvatar = await loadImage(huggerAvatarPath);
      const targetAvatar = await loadImage(targetAvatarPath);

      ctx.save();
      ctx.beginPath();
      ctx.arc(285, 160, 50, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(huggerAvatar, 235, 110, 110, 100);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(390, 200, 50, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(targetAvatar, 340, 150, 100, 100);
      ctx.restore();

      ctx.font = "bold 32px Arial";
      ctx.fillStyle = "#FF1493";
      ctx.textAlign = "center";
      ctx.fillText("💕 Virtual Hug 💕", canvas.width / 2, 50);

      ctx.font = "bold 22px Arial";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(huggerName, 210, 400);
      ctx.fillText(targetName, 490, 400);

      ctx.strokeStyle = "#FF69B4";
      ctx.lineWidth = 10;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      const outputPath = path.join(tmpDir, "hug.png");
      fs.writeFileSync(outputPath, canvas.toBuffer());

      /* ===== SEND ===== */
      const messages = [
        `💝 ${huggerName} gave ${targetName} a warm hug 🫂`,
        `🤗 ${huggerName} hugs ${targetName} with love 💕`,
        `💞 A special hug from ${huggerName} to ${targetName}`
      ];

      await api.sendMessage(
        {
          body: messages[Math.floor(Math.random() * messages.length)],
          attachment: fs.createReadStream(outputPath),
          mentions: [
            { id: huggerID, tag: huggerName },
            { id: targetID, tag: targetName }
          ]
        },
        event.threadID
      );

      /* ===== CLEANUP ===== */
      [outputPath, huggerAvatarPath, targetAvatarPath].forEach(f => {
        if (fs.existsSync(f)) fs.unlinkSync(f);
      });

      await api.unsendMessage(processingMsg.messageID);

    } catch (err) {
      console.error("HUG ERROR:", err);
      await api.sendMessage(
        "❌ Something went wrong while making the hug 😔",
        event.threadID
      );
      if (processingMsg?.messageID)
        api.unsendMessage(processingMsg.messageID).catch(() => {});
    }
  }
};