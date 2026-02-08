const axios = require("axios");

module.exports = {
  config: {
    name: "bot",
    version: "2.3.2",
    role: 0,
    credits: "Alihsan Shourov",
    description: "Chat with Simsimi-like bot (reply + trigger words + teach system)",
    prefix: false,
    category: "fun",
    guide: {
      en:
        "{pn} [message]\n" +
        "{pn} teach ask=[q]&ans=[a]\n" +
        "{pn} delete ask=[q]&ans=[a]\n" +
        "{pn} edit old=[q]&new=[new]\n" +
        "{pn} askinfo [q]\n" +
        "{pn} info"
    }
  },

  // ================= START =================
  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID } = event;
    const query = args.join(" ");

    try {
      // ===== LOAD API CONFIG =====
      const { data } = await axios.get(
        "https://raw.githubusercontent.com/MOHAMMAD-NAYAN-07/Nayan/main/api.json"
      );
      const apiUrl = data.sim;   // sim api
      const apiUrl2 = data.api2; // font api

      const userName = (await usersData.getName(senderID)) || "User";

      // ================= NO QUERY (GREETING) =================
      if (!query) {
        const greetings = [
          "আহ শুনা আমার তোমার অলিতে গলিতে উম্মাহ 😇😘",
          "কি গো সোনা আমাকে ডাকছ কেনো",
          "বার বার আমাকে ডাকস কেন 😡",
          "আহ শোনা আমার আমাকে এতো ডাকছো কেনো আসো বুকে আশো 🥱",
          "হুম জান তোমার ঐখানে উম্মমাহ 😷😘",
          "আসসালামু আলাইকুম, আপনার জন্য কি করতে পারি?",
          "আমাকে এতো না ডেকে বস সৌরভকে একটা গিফট দে 🙄",
          "jang hanga korba",
          "jang bal falaba 🙂"
        ];

        const rand = greetings[Math.floor(Math.random() * greetings.length)];

        return api.sendMessage(
          {
            body: `「 ${userName} 」\n\n${rand}`,
            mentions: [{ tag: userName, id: senderID }]
          },
          threadID,
          (err, info) => {
            if (!err) {
              global.GoatBot.onReply.set(info.messageID, {
                commandName: "bot",
                author: senderID
              });
            }
          },
          messageID
        );
      }

      // ================= TEACH =================
      if (query.startsWith("teach")) {
        const params = query.replace("teach", "").trim().split("&");
        const question = params[0]?.replace("ask=", "").trim();
        const answer = params[1]?.replace("ans=", "").trim();

        if (!question || !answer)
          return api.sendMessage(
            "⚠️ Format:\nteach ask=[question]&ans=[answer]",
            threadID,
            messageID
          );

        const res = await axios.get(
          `${apiUrl}/sim?type=teach&ask=${encodeURIComponent(question)}&ans=${encodeURIComponent(answer)}`
        );

        const { msg, data } = res.data;

        return api.sendMessage(
          msg.includes("already")
            ? `📝 Already exists\nASK: ${data.ask}\nANS: ${data.ans}`
            : `✅ Added Successfully\nASK: ${data.ask}\nANS: ${data.ans}`,
          threadID,
          messageID
        );
      }

      // ================= DELETE =================
      if (query.startsWith("delete")) {
        const params = query.replace("delete", "").trim().split("&");
        const question = params[0]?.replace("ask=", "").trim();
        const answer = params[1]?.replace("ans=", "").trim();

        if (!question || !answer)
          return api.sendMessage(
            "⚠️ Format:\ndelete ask=[question]&ans=[answer]",
            threadID,
            messageID
          );

        const res = await axios.get(
          `${apiUrl}/sim?type=delete&ask=${encodeURIComponent(question)}&ans=${encodeURIComponent(answer)}&uid=${senderID}`
        );

        return api.sendMessage(res.data.msg || "✅ Deleted", threadID, messageID);
      }

      // ================= EDIT =================
      if (query.startsWith("edit")) {
        const params = query.replace("edit", "").trim().split("&");
        const oldQ = params[0]?.replace("old=", "").trim();
        const newQ = params[1]?.replace("new=", "").trim();

        if (!oldQ || !newQ)
          return api.sendMessage(
            "⚠️ Format:\nedit old=[old]&new=[new]",
            threadID,
            messageID
          );

        const res = await axios.get(
          `${apiUrl}/sim?type=edit&old=${encodeURIComponent(oldQ)}&new=${encodeURIComponent(newQ)}&uid=${senderID}`
        );

        return api.sendMessage(res.data.msg || "✏️ Edited", threadID, messageID);
      }

      // ================= INFO =================
      if (query === "info") {
        const res = await axios.get(`${apiUrl}/sim?type=info`);
        return api.sendMessage(
          `📊 Total Ask: ${res.data.data.totalKeys}\n📊 Total Answers: ${res.data.data.totalResponses}`,
          threadID,
          messageID
        );
      }

      // ================= ASK INFO =================
      if (query.startsWith("askinfo")) {
        const question = query.replace("askinfo", "").trim();
        if (!question)
          return api.sendMessage("⚠️ Please provide a question", threadID, messageID);

        const res = await axios.get(
          `${apiUrl}/sim?type=keyinfo&ask=${encodeURIComponent(question)}`
        );

        const answers = res.data.data.answers || [];
        if (!answers.length)
          return api.sendMessage(`❌ No data for "${question}"`, threadID, messageID);

        const msg =
          `ℹ️ Info for "${question}"\n\n` +
          answers.map((a, i) => `${i + 1}. ${a}`).join("\n") +
          `\n\nTotal: ${answers.length}`;

        return api.sendMessage(msg, threadID, messageID);
      }

      // ================= NORMAL CHAT =================
      const simRes = await axios.get(
        `${apiUrl}/sim?type=ask&ask=${encodeURIComponent(query)}`
      );

      const replyText = simRes.data.data.msg || "🙂";

      const fontRes = await axios.get(
        `${apiUrl2}/bold?text=${encodeURIComponent(replyText)}&type=serif`
      );

      const styled = fontRes.data.data.bolded || replyText;

      api.sendMessage(
        styled,
        threadID,
        (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: "bot",
              author: senderID
            });
          }
        },
        messageID
      );

    } catch (err) {
      console.error("BOT ERROR:", err);
      api.sendMessage("⚠️ Something went wrong, try later.", threadID, messageID);
    }
  },

  // ================= REPLY MODE =================
  onReply: async ({ api, event, Reply }) => {
    const { threadID, messageID, senderID, body } = event;
    if (Reply.author !== senderID) return;

    try {
      const { data } = await axios.get(
        "https://raw.githubusercontent.com/MOHAMMAD-NAYAN-07/Nayan/main/api.json"
      );

      const apiUrl = data.sim;
      const apiUrl2 = data.api2;

      const simRes = await axios.get(
        `${apiUrl}/sim?type=ask&ask=${encodeURIComponent(body)}`
      );

      const replyText = simRes.data.data.msg || "🙂";

      const fontRes = await axios.get(
        `${apiUrl2}/bold?text=${encodeURIComponent(replyText)}&type=serif`
      );

      const styled = fontRes.data.data.bolded || replyText;

      api.sendMessage(
        styled,
        threadID,
        (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: "bot",
              author: senderID
            });
          }
        },
        messageID
      );

    } catch (err) {
      console.error("REPLY ERROR:", err);
      api.sendMessage("⚠️ Reply error.", threadID, messageID);
    }
  }
};