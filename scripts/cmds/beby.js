const axios = require("axios");

const BASE_API = "https://baby-apisx.vercel.app";

module.exports = {
  config: {
    name: "bby",
    aliases: ["baby"],
    version: "1.0.0",
    author: "Aryan + Fixed by Shourov",
    role: 0,
    description: "Smart baby chat bot (safe & no crash)",
    category: "chat"
  },

  onStart: async ({ api, event, args, usersData }) => {
    try {
      const uid = event.senderID;
      const threadID = event.threadID;
      const text = (args.join(" ") || "").toLowerCase();

      if (!text) {
        const replies = ["Bolo baby 🥰", "Hum 😚", "Type baby hi", "Yes jaan?"];
        return api.sendMessage(
          replies[Math.floor(Math.random() * replies.length)],
          threadID,
          event.messageID
        );
      }

      // remove / rm
      if (text.startsWith("remove") || text.startsWith("rm")) {
        const key = text.replace(/^(remove|rm)\s*/, "");
        if (!key) return api.sendMessage("Format: remove [text]", threadID);
        const res = await axios.get(`${BASE_API}/baby?remove=${encodeURIComponent(key)}&senderID=${uid}`);
        return api.sendMessage(res.data?.message || "Done", threadID);
      }

      // list
      if (text === "list") {
        const res = await axios.get(`${BASE_API}/baby?list=all`);
        return api.sendMessage(
          `Total Teach: ${res.data?.length || 0}`,
          threadID
        );
      }

      // teach
      if (text.startsWith("teach ")) {
        if (!text.includes("-"))
          return api.sendMessage("Format: teach question - answer", threadID);

        const [q, a] = text.replace("teach ", "").split(/\s*-\s*/);
        if (!q || !a) return api.sendMessage("Invalid format", threadID);

        const res = await axios.get(
          `${BASE_API}/baby?teach=${encodeURIComponent(q)}&reply=${encodeURIComponent(a)}&senderID=${uid}`
        );

        const user = await usersData.get(uid);
        return api.sendMessage(
          `✅ Added\nTeacher: ${user?.name || "Unknown"}`,
          threadID
        );
      }

      // normal chat
      const res = await axios.get(
        `${BASE_API}/baby?text=${encodeURIComponent(text)}&senderID=${uid}&font=1`
      );

      const reply = res.data?.reply || "🙂";
      api.sendMessage(reply, threadID, (e, info) => {
        if (!e) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "bby",
            author: uid
          });
        }
      }, event.messageID);

    } catch (e) {
      console.log("BBY ERROR:", e);
      api.sendMessage("❌ Error occurred", event.threadID);
    }
  },

  onReply: async ({ api, event, Reply }) => {
    try {
      if (Reply.author !== event.senderID) return;

      const body = typeof event.body === "string" ? event.body.toLowerCase() : "";
      if (!body) return;

      const res = await axios.get(
        `${BASE_API}/baby?text=${encodeURIComponent(body)}&senderID=${event.senderID}&font=1`
      );

      api.sendMessage(res.data?.reply || "🙂", event.threadID);
    } catch (e) {
      console.log("BBY REPLY ERROR:", e);
    }
  },

  onChat: async ({ api, event }) => {
    try {
      const body = typeof event.body === "string" ? event.body.toLowerCase() : "";
      if (!/^(baby|bby|bot|jan|babu|janu)\b/.test(body)) return;

      const msg = body.replace(/^\S+\s*/, "");
      if (!msg) {
        return api.sendMessage("Yes jaan? 😚", event.threadID);
      }

      const res = await axios.get(
        `${BASE_API}/baby?text=${encodeURIComponent(msg)}&senderID=${event.senderID}&font=1`
      );

      api.sendMessage(res.data?.reply || "🙂", event.threadID);
    } catch (e) {
      console.log("BBY CHAT ERROR:", e);
    }
  }
};