const axios = require("axios");
const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");

module.exports = {
  config: {
    name: "pair",
    countDown: 10,
    role: 0,
    shortDescription: { en: "Get to know your partner" },
    longDescription: { en: "Know your destiny partner" },
    category: "LOVE",
    guide: { en: "{pn} (reply / mention optional)" }
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      /* ===== ID RESOLVE (REPLY + MENTION SAFE) ===== */
      let id1;
      if (event.messageReply?.senderID) {
        id1 = event.messageReply.senderID;
      } else if (event.mentions && Object.keys(event.mentions).length > 0) {
        id1 = Object.keys(event.mentions)[0];
      } else {
        id1 = event.senderID;
      }

      const threadID = event.threadID;
      const botID = api.getCurrentUserID();

      /* ===== USER NAME ===== */
      const name1 =
        ((await usersData.get?(id1))?.name ||
          (await api.getUserInfo(id1))?.[id1]?.name ||
          "Unknown User");

      /* ===== THREAD USERS ===== */
      const threadInfo = await api.getThreadInfo(threadID);
      const allUsers = threadInfo.userInfo || [];

      let gender1 = null;
      for (const u of allUsers) {
        if (u.id == id1) gender1 = u.gender;
      }

      /* ===== PARTNER PICK ===== */
      const candidates = [];
      for (const u of allUsers) {
        if (u.id !== id1 && u.id !== botID) {
          if (gender1 === "MALE" && u.gender === "FEMALE") candidates.push(u.id);
          else if (gender1 === "FEMALE" && u.gender === "MALE") candidates.push(u.id);
          else if (!gender1) candidates.push(u.id);
        }
      }

      if (!candidates.length) {
        return api.sendMessage("❌ No suitable partner found.", threadID, event.messageID);
      }

      const id2 = candidates[Math.floor(Math.random() * candidates.length)];
      const name2 =
        ((await usersData.get?(id2))?.name ||
          (await api.getUserInfo(id2))?.[id2]?.name ||
          "Unknown User");

      /* ===== LOVE % (UNCHANGED LOGIC) ===== */
      const rand1 = Math.floor(Math.random() * 100) + 1;
      const crazy = ["0", "-1", "99,99", "-99", "-100", "101", "0,01"];
      const percentage = [rand1, rand1, rand1, crazy[Math.floor(Math.random() * crazy.length)]][Math.floor(Math.random() * 4)];

      const notes = [
        "𝐘𝐨𝐮𝐫 𝐥𝐨𝐯𝐞 𝐬𝐭𝐨𝐫𝐲 𝐣𝐮𝐬𝐭 𝐛𝐞𝐠𝐚𝐧 🌹",
        "𝐃𝐞𝐬𝐭𝐢𝐧𝐲 𝐜𝐡𝐨𝐬𝐞 𝐲𝐨𝐮 𝐭𝐰𝐨 💞",
        "𝐓𝐰𝐨 𝐬𝐨𝐮𝐥𝐬, 𝐨𝐧𝐞 𝐩𝐚𝐭𝐡 ✨",
        "𝐋𝐨𝐯𝐞 𝐟𝐢𝐧𝐝𝐬 𝐢𝐭𝐬 𝐰𝐚𝐲 💘"
      ];
      const note = notes[Math.floor(Math.random() * notes.length)];

      /* ===== PATHS ===== */
      const assets = path.join(__dirname, "assets");
      if (!fs.existsSync(assets)) fs.mkdirSync(assets);

      const bgPath = path.join(assets, "background.png");
      const a1 = path.join(assets, "avt1.png");
      const a2 = path.join(assets, "avt2.png");

      /* ===== DOWNLOAD IMAGES ===== */
      const getImg = async (url, save) => {
        const img = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(save, img.data);
      };

      await getImg(
        `https://graph.facebook.com/${id1}/picture?width=720&height=720`,
        a1
      );
      await getImg(
        `https://graph.facebook.com/${id2}/picture?width=720&height=720`,
        a2
      );
      await getImg(
        "https://i.ibb.co/RBRLmRt/Pics-Art-05-14-10-47-00.jpg",
        bgPath
      );

      /* ===== CANVAS (UNCHANGED GRAPH) ===== */
      const bg = await loadImage(bgPath);
      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0, bg.width, bg.height);
      ctx.drawImage(await loadImage(a1), 111, 175, 330, 330);
      ctx.drawImage(await loadImage(a2), 1018, 173, 330, 330);

      fs.writeFileSync(bgPath, canvas.toBuffer());

      fs.removeSync(a1);
      fs.removeSync(a2);

      /* ===== MESSAGE ===== */
      const m1 = { tag: `@${name1}`, id: id1 };
      const m2 = { tag: `@${name2}`, id: id2 };

      const body =
        `💞 𝐋𝐨𝐯𝐞 𝐏𝐚𝐢𝐫 𝐀𝐥𝐞𝐫𝐭 💞\n\n` +
        `💑 Congratulations ${m1.tag} & ${m2.tag}\n` +
        `💌 ${note}\n` +
        `🔗 Love Connection: ${percentage}% 💖`;

      await api.sendMessage(
        {
          body,
          mentions: [m1, m2],
          attachment: fs.createReadStream(bgPath)
        },
        threadID,
        () => fs.unlinkSync(bgPath),
        event.messageID
      );
    } catch (err) {
      console.error("PAIR ERROR:", err);
      api.sendMessage("❌ Pair command failed.", event.threadID, event.messageID);
    }
  }
};