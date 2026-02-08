const fs = require("fs-extra");
const path = require("path");

const bankDataPath = path.join(__dirname, "bankData.json");

function ensureBankFile() {
  if (!fs.existsSync(bankDataPath)) {
    fs.writeJsonSync(bankDataPath, {});
  }
}

function getBankData() {
  ensureBankFile();
  return fs.readJsonSync(bankDataPath);
}

function saveBankData(data) {
  fs.writeJsonSync(bankDataPath, data, { spaces: 2 });
}

module.exports = {
  config: {
    name: "bank",
    version: "1.3",
    author: "Chitron Bhattacharjee (patched)",
    role: 0,
    countDown: 10,
    category: "𝗪𝗔𝗟𝗟𝗘𝗧",
    description: "Deposit, withdraw, interest, transfer, loan system",
    guide: {
      en:
        "{pn} deposit <amount>\n" +
        "{pn} withdraw <amount>\n" +
        "{pn} balance\n" +
        "{pn} interest\n" +
        "{pn} transfer <amount> <uid>\n" +
        "{pn} richest\n" +
        "{pn} loan <amount>\n" +
        "{pn} payloan <amount>"
    }
  },

  onStart: async function ({ args, message, event, usersData, api }) {
    const uid = event.senderID;
    const userMoney = await usersData.get(uid, "money") || 0;

    const bankData = getBankData();

    if (!bankData[uid]) {
      bankData[uid] = {
        bank: 0,
        lastInterestClaimed: 0,
        loan: 0,
        loanPayed: true
      };
      saveBankData(bankData);
    }

    const userBank = bankData[uid];
    const cmd = args[0]?.toLowerCase();
    const amount = parseFloat(args[1]);

    /* ============ BALANCE ============ */
    if (cmd === "balance") {
      return message.reply(
        `🏦 BANK BALANCE\n\n💰 Bank: $${formatNumber(userBank.bank)}`
      );
    }

    /* ============ DEPOSIT ============ */
    if (cmd === "deposit") {
      if (!amount || amount <= 0)
        return message.reply("❌ Enter a valid amount");

      if (amount > userMoney)
        return message.reply("❌ You don't have enough money");

      userBank.bank += amount;
      await usersData.set(uid, { money: userMoney - amount });
      saveBankData(bankData);

      return message.reply(`✅ Deposited $${amount}`);
    }

    /* ============ WITHDRAW ============ */
    if (cmd === "withdraw") {
      if (!amount || amount <= 0)
        return message.reply("❌ Enter a valid amount");

      if (amount > userBank.bank)
        return message.reply("❌ Not enough bank balance");

      userBank.bank -= amount;
      await usersData.set(uid, { money: userMoney + amount });
      saveBankData(bankData);

      return message.reply(`✅ Withdrawn $${amount}`);
    }

    /* ============ INTEREST ============ */
    if (cmd === "interest") {
      const now = Date.now();
      if (now - userBank.lastInterestClaimed < 86400000) {
        return message.reply("⏳ You can claim interest once every 24 hours");
      }

      if (userBank.bank <= 0)
        return message.reply("❌ No money in bank");

      const interest = userBank.bank * 0.001;
      userBank.bank += interest;
      userBank.lastInterestClaimed = now;

      saveBankData(bankData);
      return message.reply(`💹 Interest earned: $${formatNumber(interest)}`);
    }

    /* ============ TRANSFER ============ */
    if (cmd === "transfer") {
      const target = args[2];
      if (!amount || amount <= 0 || !target)
        return message.reply("❌ Usage: transfer <amount> <uid>");

      if (!bankData[target])
        return message.reply("❌ Target user not found");

      if (amount > userBank.bank)
        return message.reply("❌ Not enough bank balance");

      userBank.bank -= amount;
      bankData[target].bank += amount;
      saveBankData(bankData);

      return message.reply(`✅ Transferred $${amount} to ${target}`);
    }

    /* ============ RICHEST ============ */
    if (cmd === "richest") {
      const top = Object.entries(bankData)
        .sort((a, b) => b[1].bank - a[1].bank)
        .slice(0, 10);

      let msg = "👑 TOP 10 RICHEST\n\n";
      let i = 1;
      for (const [id, data] of top) {
        const name =
          ((await usersData.get?(id))?.name || "Unknown User");
        msg += `${i++}. ${name} - $${formatNumber(data.bank)}\n`;
      }
      return message.reply(msg);
    }

    /* ============ LOAN ============ */
    if (cmd === "loan") {
      if (!amount || amount <= 0)
        return message.reply("❌ Enter loan amount");

      if (!userBank.loanPayed)
        return message.reply("❌ Pay your previous loan first");

      userBank.loan = amount;
      userBank.loanPayed = false;
      userBank.bank += amount;

      saveBankData(bankData);
      return message.reply(`💸 Loan taken: $${amount}`);
    }

    /* ============ PAY LOAN ============ */
    if (cmd === "payloan") {
      if (!amount || amount <= 0)
        return message.reply("❌ Enter amount");

      if (userBank.loan <= 0)
        return message.reply("✅ No loan remaining");

      if (amount > userMoney)
        return message.reply("❌ Not enough money");

      userBank.loan -= amount;
      await usersData.set(uid, { money: userMoney - amount });

      if (userBank.loan <= 0) {
        userBank.loan = 0;
        userBank.loanPayed = true;
      }

      saveBankData(bankData);
      return message.reply(`✅ Loan paid: $${amount}`);
    }

    /* ============ DEFAULT ============ */
    return message.reply(
      "🏦 BANK COMMANDS\n\n" +
        "deposit / withdraw / balance / interest\n" +
        "transfer / richest / loan / payloan"
    );
  }
};

/* ============ FORMAT NUMBER ============ */
function formatNumber(num) {
  return Number(num).toLocaleString("en-US", {
    maximumFractionDigits: 2
  });
}