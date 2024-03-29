const fonts = "/cache/Play-Bold.ttf"
const downfonts = "https://drive.google.com/u/0/uc?id=1uni8AiYk7prdrC7hgAmezaGTMH5R8gW8&export=download"
const fontsName = 35
const fontsInfo = 25
const fontsOthers = 27
const colorName = "#EEEEEE"
module.exports.config = {
    name: "checktt", // Tên lệnh, được sử dụng trong việc gọi lệnh
    version: "1.0.1", // phiên bản của module này
    hasPermssion: 0, // Quyền hạn sử dụng, với 0 là toàn bộ thành viên, 1 là quản trị viên trở lên, 2 là admin/owner
    credits: "DungUwU && Nghĩa", // Công nhận module sở hữu là ai
    description: "Check tương tác ngày/tuần/toàn bộ", // Thông tin chi tiết về lệnh
    commandCategory: "Thống kê", // Thuộc vào nhóm nào: system, other, game-sp, game-mp, random-img, edit-img, media, economy, ...
    usages: "< all/week/day >", // Cách sử dụng lệnh
    cooldowns: 5, // Thời gian một người có thể lặp lại lệnh
    dependencies: {
        "fs": "",
        "moment-timezone": "",
         canvas: "",
        "systeminformation": "",
        "fs-extra": ""
        
    }
};
function byte2mb(bytes) {
	const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	let l = 0, n = parseInt(bytes, 10) || 0;
	while (n >= 1024 && ++l) n = n / 1024;
	return `${n.toFixed(n < 10 && l > 0 ? 1 : 0)} ${units[l]}`;
}
 module.exports.circle = async (image) => {
  const jimp = global.nodemodule["jimp"];
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
}
const path = __dirname + '/cache/checktt/';
const { min } = require('moment-timezone');
const moment = require('moment-timezone');
const { format } = require('path');
 
module.exports.onLoad = () => {
    const fs = require('fs');
    if (!fs.existsSync(path) || !fs.statSync(path).isDirectory()) {
        fs.mkdirSync(path, { recursive: true });
    }
  setInterval(() => {
    const today = moment.tz("Asia/Ho_Chi_Minh").day();
    const checkttData = fs.readdirSync(path);
    checkttData.forEach(file => {
      let fileData = JSON.parse(fs.readFileSync(path + file));
      if (fileData.time != today) {
        setTimeout(() => {
          fileData = JSON.parse(fs.readFileSync(path + file));
          if (fileData.time != today) {
            fileData.time = today;
            fs.writeFileSync(path + file, JSON.stringify(fileData, null, 4));
          }
        }, 60 * 1000);
      }
    })
  }, 60 * 1000);
}
 
module.exports.handleEvent = async function ({ api, args, Users, event, Threads, }) {
  const threadInfo = await api.getThreadInfo(event.threadID)
    if (global.client.sending_top == true) return;
    const fs = global.nodemodule['fs'];
    const { threadID, senderID } = event;
    const today = moment.tz("Asia/Ho_Chi_Minh").day();
 
    if (!fs.existsSync(path + threadID + '.json')) {
        const newObj = {
            total: [],
            week: [],
            day: [],
            time: today
        };
        fs.writeFileSync(path + threadID + '.json', JSON.stringify(newObj, null, 4));
        const threadInfo = await Threads.getInfo(threadID) || {};
        if (threadInfo.hasOwnProperty('isGroup') && threadInfo.isGroup) {
            const UserIDs = threadInfo.participantIDs;
            for (user of UserIDs) {
                if (!newObj.total.find(item => item.id == user)) {
                    newObj.total.push({
                        id: user,
                        count: 0
                    });
                }
                if (!newObj.week.find(item => item.id == user)) {
                    newObj.week.push({
                        id: user,
                        count: 0
                    });
                }
                if (!newObj.day.find(item => item.id == user)) {
                    newObj.day.push({
                        id: user,
                        count: 0
                    });
                }
            }
        }
        fs.writeFileSync(path + threadID + '.json', JSON.stringify(newObj, null, 4));
    }
    const threadData = JSON.parse(fs.readFileSync(path + threadID + '.json'));
    if (threadData.time != today) {
      global.client.sending_top = true;
      setTimeout(() => global.client.sending_top = false, 5 * 60 * 1000);
    }
    const userData_week_index = threadData.week.findIndex(e => e.id == senderID);
    const userData_day_index = threadData.day.findIndex(e => e.id == senderID);
    const userData_total_index = threadData.total.findIndex(e => e.id == senderID);
    if (userData_total_index == -1) {
        threadData.total.push({
            id: senderID,
            count: 1,
        });
    } else threadData.total[userData_total_index].count++;
    if (userData_week_index == -1) {
        threadData.week.push({
            id: senderID,
            count: 1
        });
    } else threadData.week[userData_week_index].count++;
    if (userData_day_index == -1) {
        threadData.day.push({
            id: senderID,
            count: 1
        });
    } else threadData.day[userData_day_index].count++;
    // if (threadData.time != today) {
    //     threadData.day.forEach(e => {
    //         e.count = 0;
    //     });
    //     if (today == 1) {
    //         threadData.week.forEach(e => {
    //             e.count = 0;
    //         });
    //     }
    //     threadData.time = today;
    // }
 
    fs.writeFileSync(path + threadID + '.json', JSON.stringify(threadData, null, 4));
}
 
module.exports.run = async function ({ api, event, args, Users, Threads }) {
  let threadInfo = await api.getThreadInfo(event.threadID);
    await new Promise(resolve => setTimeout(resolve, 500));
    const fs = global.nodemodule['fs'];
    const { threadID, messageID, senderID, mentions } = event;
    if (!fs.existsSync(path + threadID + '.json')) {
        return api.sendMessage("Chưa có thống kê dữ liệu", threadID);
    }
    const threadData = JSON.parse(fs.readFileSync(path + threadID + '.json'));
    const query = args[0] ? args[0].toLowerCase() : '';
    
    if(query == 'locmem') {
        let threadInfo = await api.getThreadInfo(threadID);
        if(!threadInfo.adminIDs.some(e => e.id == senderID)) return api.sendMessage("[⚜️]➜ Bạn không có quyền sử dụng lệnh này", threadID);
        if(!threadInfo.isGroup) return api.sendMessage("[⚜️]➜ Chỉ có thể sử dụng trong nhóm", threadID);
        if(!threadInfo.adminIDs.some(e => e.id == api.getCurrentUserID())) return api.sendMessage("[⚜️]➜ Bot cần qtv để thực hiện lệnh", threadID);
        if(!args[1] || isNaN(args[1])) return api.sendMessage("Error", threadID);
        let minCount = args[1],
            allUser = threadInfo.participantIDs;
        for(let user of allUser) {
            if(user == api.getCurrentUserID()) continue;
            if(!threadData.total.some(e => e.id == user) || threadData.total.find(e => e.id == user).count < minCount) {
                setTimeout(async () => {
                    await api.removeUserFromGroup(user, threadID);
                    for(let e in threadData) {
                        if(e == 'time') continue;
                        if(threadData[e].some(e => e.id == user)) {
                            threadData[e].splice(threadData[e].findIndex(e => e.id == user), 1);
                        }
                    }
                }, 1000);
            }
        }
        return api.sendMessage(`[⚜️]➜ Đã xóa ${allUser.length - threadData.total.filter(e => e.count >= minCount).length} thành viên không đủ ${minCount} lần`, threadID);
    }

    var header = '',
        body = '',
        footer = '',
        msg = '',
        count = 1,
        storage = [],
        data = 0;
    if (query == 'all' || query == '-a') {
        header = '===𝗧𝗨̛𝗢̛𝗡𝗚 𝗧𝗔́𝗖 𝗔𝗟𝗟===\n';
        data = threadData.total;
    } else if (query == 'week' || query == '-w') {
        header = '===𝗧𝗨̛𝗢̛𝗡𝗚 𝗧𝗔́𝗖 𝗧𝗨𝗔̂̀𝗡===\n';
        data = threadData.week;
    } else if (query == 'day' || query == '-d') {
        header = '===𝗧𝗨̛𝗢̛𝗡𝗚 𝗧𝗔́𝗖 𝗡𝗚𝗔̀𝗬===\n';
        data = threadData.day;
    } else {
        data = threadData.total;
    }
    for (const item of data) {
        const userName = await Users.getNameUser(item.id) || 'Tên không tồn tại';
        const itemToPush = item;
        itemToPush.name = userName;
        storage.push(itemToPush);
    };
    let check = ['all', '-a', 'week', '-w', 'day', '-d'].some(e => e == query);
    if (!check && Object.keys(mentions).length > 0) {
        storage = storage.filter(e => mentions.hasOwnProperty(e.id));
    }
    //sort by count from high to low if equal sort by name
    storage.sort((a, b) => {
        if (a.count > b.count) {
            return -1;
        }
        else if (a.count < b.count) {
            return 1;
        } else {
            return a.name.localeCompare(b.name);
        }
    });
    if ((!check && Object.keys(mentions).length == 0) || (!check && Object.keys(mentions).length == 1) || (!check && event.type == 'message_reply')) {
        const UID = event.messageReply ? event.messageReply.senderID : Object.keys(mentions)[0] ? Object.keys(mentions)[0] : senderID;
        const userRank = storage.findIndex(e => e.id == UID);
        const userTotal = threadData.total.find(e => e.id == UID) ? threadData.total.find(e => e.id == UID).count : 0;
        const userTotalWeek = threadData.week.find(e => e.id == UID) ? threadData.week.find(e => e.id == UID).count : 0;
        const userTotalDay = threadData.day.find(e => e.id == UID) ? threadData.day.find(e => e.id == UID).count : 0;
        const nameUID = storage[userRank].name || 'Tên không tồn tại';
        const target = UID == senderID ? 'Bạn' : nameUID;
      const moment = require("moment-timezone");
  const timeNow = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY || HH:mm:ss");
      var permission;
        if (global.config.ADMINBOT.includes(UID)) permission = `Admin Bot`;
else if
(global.config.NDH.includes(UID)) 
permission = `Người Hỗ Trợ`; else if (threadInfo.adminIDs.some(i => i.id == UID)) permission = `Quản Trị Viên`; else permission = `Thành Viên`;
      var thu = moment.tz('Asia/Ho_Chi_Minh').format('dddd');
  if (thu == 'Sunday') thu = '𝐂𝐡𝐮̉ 𝐍𝐡𝐚̣̂𝐭'
  if (thu == 'Monday') thu = '𝐓𝐡𝐮̛́ 𝐇𝐚𝐢'
  if (thu == 'Tuesday') thu = '𝐓𝐡𝐮̛́ 𝐁𝐚'
  if (thu == 'Wednesday') thu = '𝐓𝐡𝐮̛́ 𝐓𝐮̛'
  if (thu == "Thursday") thu = '𝐓𝐡𝐮̛́ 𝐍𝐚̆𝐦'
  if (thu == 'Friday') thu = '𝐓𝐡𝐮̛́ 𝐒𝐚́𝐮'
  if (thu == 'Saturday') thu = '𝐓𝐡𝐮̛́ 𝐁𝐚̉𝐲'
      let threadName = threadInfo.threadName;
        if (userRank == -1) {
            return api.sendMessage(`➜ ${target} chưa có thống kê dữ liệu`, threadID);
        }
        body +=
          `==== [ 𝗖𝗛𝗘𝗖𝗞 𝗧𝗨̛𝗢̛𝗡𝗚 𝗧𝗔́𝗖 ] =====\n━━━━━━━━━━━━━━━━━━\n\n[👤] ➜ 𝗡𝗮𝗺𝗲: ${nameUID}\n[📌] ➜ 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸: https://www.facebook.com/profile.php?id=${event.senderID}\n[🌸] ➜ 𝗜𝗗: ${event.senderID}\n[💓] ➜ 𝗖𝗵𝘂̛́𝗰 𝘃𝘂̣: ${permission}\n[🔰] ➜ 𝗧𝗲̂𝗻 𝗻𝗵𝗼́𝗺: ${threadName}\n━━━━━━━━━━━━━━━━━━\n[💌] ➜ 𝗧𝗶𝗻 𝗻𝗵𝗮̆́𝗻 𝘁𝗿𝗼𝗻𝗴 𝗻𝗴𝗮̀𝘆: ${userTotalDay}\n[💓] ➜ 𝗛𝗮̣𝗻𝗴 𝘁𝗿𝗼𝗻𝗴 𝗻𝗴𝗮̀𝘆: ${count++}\n[💬] ➜ 𝗧𝗶𝗻 𝗻𝗵𝗮̆́𝗻 𝘁𝗿𝗼𝗻𝗴 𝘁𝘂𝗮̂̀𝗻: ${userTotalWeek}\n[🧸] ➜ 𝗛𝗮̣𝗻𝗴 𝘁𝗿𝗼𝗻𝗴 𝘁𝘂𝗮̂̀𝗻: ${count++}\n[📚] ➜ 𝗧𝗼̂̉𝗻𝗴 𝘁𝗶𝗻 𝗻𝗵𝗮̆́𝗻: ${userTotal}\n[🥇] ➜ 𝗛𝗮̣𝗻𝗴 𝘁𝗼̂̉𝗻𝗴:  ${userRank + 1}\n━━━━━━━━━━━━━━━━━━\n[💮] ➜ 𝗡𝗲̂́𝘂 𝗺𝘂𝗼̂́𝗻 𝘅𝗲𝗺 𝘁𝗵𝗼̂𝗻𝗴 𝘁𝗶𝗻 𝗻𝗵𝗼́𝗺 𝗯𝗮̣𝗻 𝘁𝗵𝗮̉ 𝗰𝗮̉𝗺 𝘅𝘂́𝗰 "❤" 𝘃𝗮̀𝗼 𝘁𝗶𝗻 𝗻𝗵𝗮̆́𝗻 𝗻𝗮̀𝘆 𝗰𝘂̉𝗮 𝗯𝗼𝘁`.replace(/^ +/gm, '');
    } else {
        body = storage.map(item => {
            return `${count++}. ${item.name} (${item.count})`;
        }).join('\n');
        footer = `➜ Tổng Tin Nhắn: ${storage.reduce((a, b) => a + b.count, 0)}`;
    }
  async function streamURL(url, mime='jpg') {
    const dest = `${__dirname}/cache/${Date.now()}.${mime}`,
    downloader = require('image-downloader'),
    fse = require('fs-extra');
    await downloader.image({
        url, dest
    });
    setTimeout(j=>fse.unlinkSync(j), 60*1000, dest);
    return fse.createReadStream(dest);
};
    msg = `${header}\n${body}\n${footer}`;
    api.sendMessage({body: msg, attachment: [await streamURL(threadInfo.imageSrc), await streamURL(`https://graph.facebook.com/${event.senderID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`)]}, threadID, (err, info) => {
    global.client.handleReaction.push({
      name: this.config.name, 
      messageID: info.messageID,
      author: event.senderID,
    })
    },event.messageID);
                     }
module.exports.handleReaction = async ({ event, api, handleReaction, Currencies, Users}) => {
const axios = global.nodemodule["axios"];
const fs = global.nodemodule["fs-extra"];
  const { threadID, messageID, userID } = event;
  const moment = require("moment-timezone");
    var gio = moment.tz("Asia/Ho_Chi_Minh").format("D/MM/YYYY || HH:mm:ss");
    var thu = moment.tz('Asia/Ho_Chi_Minh').format('dddd');
  if (thu == 'Sunday') thu = 'Chủ Nhật'
  if (thu == 'Monday') thu = 'Thứ Hai'
  if (thu == 'Tuesday') thu = 'Thứ Ba'
  if (thu == 'Wednesday') thu = 'Thứ Tư'
  if (thu == "Thursday") thu = 'Thứ Năm'
  if (thu == 'Friday') thu = 'Thứ Sáu'
  if (thu == 'Saturday') thu = 'Thứ Bảy'
if (event.userID != handleReaction.author) return;
if (event.reaction != "❤") return; 
 api.unsendMessage(handleReaction.messageID);
        var msg = `=== [ 𝗠𝗘𝗡𝗨 𝗧𝗛𝗢̂𝗡𝗚 𝗧𝗜𝗡 ] ===\n━━━━━━━━━━━━━━━━━━\n𝟭. 𝗫𝗲𝗺 𝘁𝗵𝗼̂𝗻𝗴 𝘁𝗶𝗻 𝗰𝘂̉𝗮 𝗻𝗵𝗼́𝗺\n𝟮. 𝗧𝗵𝗼̂𝗻𝗴 𝘁𝗶𝗻 𝗹𝗶𝗲̂𝗻 𝗵𝗲̣̂ 𝗮𝗱𝗺𝗶𝗻 𝗯𝗼𝘁\n𝟯. 𝗟𝗼̣𝗰 𝗻𝗴𝘂̛𝗼̛̀𝗶 𝗱𝘂̀𝗻𝗴 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸\n𝟰. 𝗧𝗵𝗼̂𝗻𝗴 𝘁𝗶𝗻 𝘃𝗲̂̀ 𝗯𝗼𝘁\n𝟱. 𝗧𝗵𝗼̂𝗻𝗴 𝘁𝗶𝗻 𝗰𝗮́ 𝗻𝗵𝗮̂𝗻 𝗰𝘂̉𝗮 𝗯𝗮̣𝗻\n𝟲. 𝗟𝗮̂́𝘆 𝗨𝗜𝗗 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 𝗰𝘂̉𝗮 𝗯𝗮̣𝗻\n𝟳. 𝗫𝗲𝗺 𝘁𝗵𝗼̂𝗻𝗴 𝘁𝗶𝗻 𝘃𝗲̂̀ 𝗰𝗼𝘃𝗶𝗱\n𝟴. 𝗚𝗵𝗲́𝗽 đ𝗼̂𝗶 𝘃𝗼̛́𝗶 𝗯𝗮̣𝗻 𝗿𝗮𝗻𝗱𝗼𝗺 𝘁𝗿𝗼𝗻𝗴 𝗻𝗵𝗼́𝗺\n𝟵. 𝗧𝗵𝗼̂𝗻𝗴 𝘁𝗶𝗻 𝗺𝗮́𝘆 𝗰𝗵𝘂̉ 𝗯𝗼𝘁\n𝟭𝟬. 𝗖𝗮𝗽 𝗪𝗮𝗹𝗹 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 𝗰𝘂̉𝗮 𝗯𝗮̣𝗻\n\n[⚜️] ➜ 𝗥𝗲𝗽𝗹𝘆 𝘁𝗶𝗻 𝗻𝗵𝗮̆́𝗻 𝗻𝗮̀𝘆 𝘁𝗵𝗲𝗼 𝘀𝗼̂́ đ𝗲̂̉ 𝘅𝗲𝗺 𝘁𝗵𝗼̂𝗻𝗴 𝘁𝗶𝗻 𝗯𝗮̣𝗻 𝗺𝘂𝗼̂́𝗻 𝘅𝗲𝗺\n━━━━━━━━━━━━━━━━━━\n===「${thu} || ${gio}」===`
        return api.sendMessage({body: msg, attachment: (await global.nodemodule["axios"]({
url: (await global.nodemodule["axios"]('https://docs-api.jrtxtracy.repl.co/images/anime?apikey=JRTvip_2200708248')).data.data,
method: "GET",
responseType: "stream"
})).data
},event.threadID,(error, info) => {
        
            global.client.handleReply.push({
                type: "choosee",
                name: this.config.name,
                author: event.senderID,
                messageID: info.messageID
            })
        })
    }
module.exports.handleReply = async function ({
    args,
    event,
    Users,
    Threads,
    api,
    handleReply,
    Currencies,
    __GLOBAL
}) {
  const { threadID, messageID, userID } = event;
  const axios = require("axios");
  const fs = require("fs-extra");
        api.sendMessage(`[⚜️] ➜ Vui lòng chờ 1 xíu !!!`, event.threadID, (err, info) =>
	setTimeout(() => {api.unsendMessage(info.messageID) } , 100000));
  const request = require("request");
       const nameUser = (await Users.getData(event.senderID)).name || (await Users.getInfo(envent.senderID)).name;
  let data = (await Currencies.getData(event.senderID)).ghepTime;
 
    
    switch (handleReply.type) {
    case "choosee": {
        switch (event.body) {
        case "1": {
          const axios = global.nodemodule["axios"];
const fs = global.nodemodule["fs-extra"];
const { threadID, messageID, userID } = event;
  async function streamURL(url, mime='jpg') {
    const dest = `${__dirname}/cache/${Date.now()}.${mime}`,
    downloader = require('image-downloader'),
    fse = require('fs-extra');
    await downloader.image({
        url, dest
    });
    setTimeout(j=>fse.unlinkSync(j), 60*1000, dest);
    return fse.createReadStream(dest);
};
  let threadInfo = await api.getThreadInfo(event.threadID);
  let threadName = threadInfo.threadName;
  let id = threadInfo.threadID;
  let sex = threadInfo.approvalMode;
  var pd = sex == false ? 'Tắt' : sex == true ? 'Bật' : '\n';
  let qtv = threadInfo.adminIDs.length;
  let color = threadInfo.color;
  let icon = threadInfo.emoji;
  let threadMem = threadInfo.participantIDs.length;
  api.unsendMessage(handleReply.messageID);
        var msg = `=====「 𝗧𝗛𝗢̂𝗡𝗚 𝗧𝗜𝗡 𝗡𝗛𝗢́𝗠 」=====\n\n[🏘️] ➜ 𝗧𝗲̂𝗻 𝗻𝗵𝗼́𝗺: ${threadName}\n[⚙️] ➜ 𝗜𝗗 𝗻𝗵𝗼́𝗺: ${id}\n[👥] ➜ 𝗦𝗼̂́ 𝘁𝗵𝗮̀𝗻𝗵 𝘃𝗶𝗲̂𝗻 𝗻𝗵𝗼́𝗺: ${threadMem}\n[💞] ➜ 𝗤𝘂𝗮̉𝗻 𝘁𝗿𝗶̣ 𝘃𝗶𝗲̂𝗻: ${qtv}\n[🌷] ➜ 𝗣𝗵𝗲̂ 𝗱𝘂𝘆𝗲̣̂𝘁: ${pd}\n[😻] ➜ 𝗕𝗶𝗲̂̉𝘂 𝘁𝘂̛𝗼̛̣𝗻𝗴 𝗰𝗮̉𝗺 𝘅𝘂́𝗰: ${icon ? icon : 'Không sử dụng'}\n[💝] ➜ 𝗠𝗮̃ 𝗴𝗶𝗮𝗼 𝗱𝗶𝗲̣̂𝗻: ${color}\n━━━━━━━━━━━━━━━━━━\n[🍑] ➜ 𝗧𝗼̂̉𝗻𝗴 𝘀𝗼̂́ 𝘁𝗶𝗻 𝗻𝗵𝗮̆́𝗻 𝗰𝘂̉𝗮 𝗻𝗵𝗼́𝗺: ${threadInfo.messageCount}\n[🎀] ➜ 𝗣𝗵𝗶́𝗮 𝘁𝗿𝗲̂𝗻 𝗹𝗮̀ 𝘁𝗵𝗼̂𝗻𝗴 𝘁𝗶𝗻 𝗰𝘂̉𝗮 𝗻𝗵𝗼́𝗺 𝗯𝗮̣𝗻 𝗱𝘂̀𝗻𝗴 ${global.config.PREFIX}𝗯𝗼𝘅 𝗶𝗻𝗳𝗼 đ𝗲̂̉ 𝘅𝗲𝗺 𝗰𝗵𝗶 𝘁𝗶𝗲̂́𝘁 `
        return api.sendMessage({body: msg, attachment: [await streamURL(threadInfo.imageSrc), await streamURL(`https://graph.facebook.com/${event.senderID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`)]},event.threadID, event.messageID)
        }
        case "2": {
          api.unsendMessage(handleReply.messageID);
          const request = require('request');
          const fs = global.nodemodule["fs-extra"];
    var callback = () => api.sendMessage(

  {body:`[⚜️]=== 『 INFORMATION ADMIN 』 ===[⚜️]
◆━━━━━━━━━━━━━━━━◆

[👀]➜ Tên: Nguyễn Hải Đăng
[💮]➜ Biệt danh: JRT 
[❎]➜ Ngày tháng năm sinh: 26/02/2003 
[👤]➜ Giới tính: Nam
[💫]➜ Chiều cao cân nặng: 1m75 x 68 kg
[❤️]➜ Tên duyên phận: Nguyễn Hồng Phấn
[🧸]➜ Biệt danh: Tracy
[💥]➜ Ngày sinh: 07/12/2001
[💘]➜ Mối quan hệ: Đã đính hôn
[🌎]➜ Quê quán: Phú Thọ - Hà Nội
[🌸]➜ Tính cách: Hòa đồng, năng nổ, dứt khoát, thân thiện và hài hước
[🌀]➜ Sở thích: Thích cái đẹp, đi phượt, giao lưu ca hát, thưởng thức các món ẩm thực khác nhau

[⚜️]=== 『 CONTACT 』 ===[⚜️]
◆━━━━━━━━━━━━━━━━◆

[👉]➜ Information: https://bio.link/nhdjrt262
[☎]➜ SĐT & Zalo: 0396049649
[🌐]➜ Facebook: https://www.facebook.com/NHD.JRT.262
[⛱]➜ TikTok: https://www.tiktok.com/@hd.jrt03
[⛲]➜ Instagram: https://www.instagram.com/hd.jrt.2k3
[🔎]➜ Twitter: https://twitter.com/JRTOfficial_03
[📋]➜ Telegram: https://t.me/nhdjrt262
[🎬]➜ Youtube: https://www.youtube.com/channel/UCNK_WugSVHOSAIPKr2epEOQ
[✉️]➜ Email: dangz123456789z@gmail.com || lehonguyen2k3@gmail.com

[⚜️]=== 『 CONTACT 』 ===[⚜️]
◆━━━━━━━━━━━━━━━━◆

[💵]➜ MOMO: 0354838459 / https://i.imgur.com/Ed0rDrO.png / Nguyễn Hồng Phấn
[💵]➜ MOMO: 0396049649 / https://i.imgur.com/Hxbs1q0.png / Nguyễn Hải Đăng
[💵]➜ MBBANK: 0396049649 / https://imgur.com/NXX9Lnh / Nguyễn Hải Đăng
[💵]➜ MBBANK: 0396049649 / https://i.imgur.com/2yj1jqY.png / Nguyễn Hồng Phấn
[💵]➜ TIMO BANK: 9021288475332 / https://i.imgur.com/vTx2DQp.jpg / Nguyễn Hải Đăng
[💵]➜ ZALO PAY: 0396049649 / https://imgur.com/LBeXzsy / Nguyễn Hải Đăng
[💵]➜ AGRIBANK: 4810205345666 / https://i.imgur.com/DObUFKB.png / Nguyễn Hồng Phấn

[⚜️]=== 『 PROBLEM 』 ===[⚜️]
◆━━━━━━━━━━━━━━━━◆

[❗]➜ Mọi thắc mắc hay bot không hoạt động có thể hỏi trực tiếp admin theo các link ở trên.
[📌]➜ Hãy đồng hành cùng BOT JRT và mình nhé. Cảm ơn mọi người <3

✎﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏

[📝]➜ Bot được điều hành bởi JRT`,

    attachment: fs.createReadStream(__dirname + "/cache/1.png")}, event.threadID, () => 

    fs.unlinkSync(__dirname + "/cache/1.png"));  

      return request(

        encodeURI(`https://graph.facebook.com/${100033478361032}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`)).pipe(

fs.createWriteStream(__dirname+'/cache/1.png')).on('close',() => callback());

       };
        case "3": {
          api.unsendMessage(handleReply.messageID);
          var { userInfo, adminIDs } = await api.getThreadInfo(event.threadID);    
    var success = 0, fail = 0;
    var arr = [];
    for (const e of userInfo) {
        if (e.gender == undefined) {
            arr.push(e.id);
        }
    };

    adminIDs = adminIDs.map(e => e.id).some(e => e == api.getCurrentUserID());
    if (arr.length == 0) {
        return api.sendMessage("[⚜️] ➜ Trong nhóm bạn không tồn tại 'Người dùng Facebook'.", event.threadID);
    }
    else {
        api.sendMessage("[⚜️] ➜ Nhóm bạn hiện có " + arr.length + " 'Người dùng Facebook'.", event.threadID, function () {
            if (!adminIDs) {
                api.sendMessage("[⚜️] ➜ Nhưng bot không phải là quản trị viên nên không thể lọc được.", event.threadID);
            } else {
                api.sendMessage("[⚜️] ➜ Bắt đầu lọc..", event.threadID, async function() {
                    for (const e of arr) {
                        try {
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            await api.removeUserFromGroup(parseInt(e), event.threadID);   
                            success++;
                        }
                        catch {
                            fail++;
                        }
                    }
                  
                    api.sendMessage("[⚜️] ➜ Đã lọc thành công " + success + " người.", event.threadID, function() {
                        if (fail != 0) return api.sendMessage("[⚜️] ➜ Lọc thất bại " + fail + " người.", event.threadID);
                    });
                })
            }
        })
    }
}
        case "4": {
          api.unsendMessage(handleReply.messageID);
          async function streamURL(url, mime='jpg') {
    const dest = `${__dirname}/cache/${Date.now()}.${mime}`,
    downloader = require('image-downloader'),
    fse = require('fs-extra');
    await downloader.image({
        url, dest
    });
    setTimeout(j=>fse.unlinkSync(j), 60*1000, dest);
    return fse.createReadStream(dest);
}; 
  const moment = require("moment-timezone");
    var gio = moment.tz("Asia/Ho_Chi_Minh").format("D/MM/YYYY || HH:mm:ss");
    var thu = moment.tz('Asia/Ho_Chi_Minh').format('dddd');
  if (thu == 'Sunday') thu = 'Chủ Nhật'
  if (thu == 'Monday') thu = 'Thứ Hai'
  if (thu == 'Tuesday') thu = 'Thứ Ba'
  if (thu == 'Wednesday') thu = 'Thứ Tư'
  if (thu == "Thursday") thu = 'Thứ Năm'
  if (thu == 'Friday') thu = 'Thứ Sáu'
  if (thu == 'Saturday') thu = 'Thứ Bảy'
const admin = config.ADMINBOT
    const ndh = config.NDH
          const namebot = config.BOTNAME
          const { commands } = global.client;
          const axios = require('axios');
       api.unsendMessage(handleReply.messageID);
    return api.sendMessage({body: `==== [ 𝗕𝗢𝗧 𝗜𝗡𝗙𝗢 ] ====
━━━━━━━━━━━\n\n[🖥] ➜ 𝗠𝗼𝗱𝘂𝗹𝗲𝘀: 𝗖𝗼́ ${commands.size} 𝗹𝗲̣̂𝗻𝗵 𝗰𝗼́ 𝘁𝗵𝗲̂̉ 𝘀𝘂̛̉ 𝗱𝘂̣𝗻𝗴 𝘁𝗿𝗲̂𝗻 𝗯𝗼𝘁\n[📎] ➜ 𝗣𝗿𝗲𝗳𝗶𝘅: 𝗗𝗮̂́𝘂 𝗹𝗲̣̂𝗻𝗵 𝗵𝗲̣̂ 𝘁𝗵𝗼̂́𝗻𝗴 𝘁𝗿𝗲̂𝗻 𝗯𝗼𝘁 𝗹𝗮̀ [ ${global.config.PREFIX} ]\n[💓] ➜ 𝗡𝗮𝗺𝗲 𝗯𝗼𝘁: ${namebot}\n[💬] ➜ 𝗟𝗶𝘀𝘁𝗯𝗼𝘅: 𝗛𝗶𝗲̣̂𝗻 𝘁𝗮̣𝗶 𝗯𝗼𝘁 đ𝗮𝗻𝗴 𝗼̛̉ ${global.data.allThreadID.length} 𝗯𝗼𝘅\n[👑] ➜ 𝗛𝗶𝗲̣̂𝗻 𝘁𝗮̣𝗶 𝗯𝗼𝘁 đ𝗮𝗻𝗴 𝗰𝗼́ ${admin.length} 𝗮𝗱𝗺𝗶𝗻 𝘃𝗮̀  ${ndh.length} 𝗻𝗱𝗵\n━━━━━━━━━━━\n===「${thu} || ${gio}」===`, attachment: await streamURL(`https://graph.facebook.com/${event.senderID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`)},event.threadID, event.messageID)
        }
        case "5": {
          api.unsendMessage(handleReply.messageID);
   const fs = global.nodemodule["fs-extra"];
    const request = global.nodemodule["request"];
    const axios = global.nodemodule['axios'];
          const req = await axios.get(`https://golike.com.vn/func-api.php?user=${event.senderID}`);
  const finduid = req.data.data.uid;
  const finddate = req.data.data.date;   
  const moment = require("moment-timezone");
    var gio = moment.tz("Asia/Ho_Chi_Minh").format("D/MM/YYYY || HH:mm:ss");
    var thu = moment.tz('Asia/Ho_Chi_Minh').format('dddd');
  if (thu == 'Sunday') thu = 'Chủ Nhật'
  if (thu == 'Monday') thu = 'Thứ Hai'
  if (thu == 'Tuesday') thu = 'Thứ Ba'
  if (thu == 'Wednesday') thu = 'Thứ Tư'
  if (thu == "Thursday") thu = 'Thứ Năm'
  if (thu == 'Friday') thu = 'Thứ Sáu'
  if (thu == 'Saturday') thu = 'Thứ Bảy'        
          const res = await axios.get(`https://www.nguyenmanh.name.vn/api/fbInfo?id=${finduid}&apikey=LV7LWgAp`);  
  var gender = res.data.result.gender == 'male' ? "Nam" : res.data.result.gender == 'female' ? "Nữ" : "𝗞𝗵𝗼̂𝗻𝗴 𝘅𝗮́𝗰 đ𝗶̣𝗻𝗵";
    var birthday = res.data.result.birthday ? `${res.data.result.birthday}` : "𝗞𝗵𝗼̂𝗻𝗴 𝘅𝗮́𝗰 đ𝗶̣𝗻𝗵";
    var love = res.data.result.love ? `${res.data.result.love}` : "𝗞𝗵𝗼̂𝗻𝗴 𝘅𝗮́𝗰 đ𝗶̣𝗻𝗵"
    var website = res.data.result.website ? `${res.data.result.website}` : "𝗞𝗵𝗼̂𝗻𝗴 𝘅𝗮́𝗰 đ𝗶̣𝗻𝗵"
    var about = res.data.result.about ? `${res.data.result.about}` : "𝗞𝗵𝗼̂𝗻𝗴 𝘅𝗮́𝗰 đ𝗶̣𝗻𝗵" 
    var quotes = res.data.result.quotes ? `${res.data.result.quotes}` : "𝗞𝗵𝗼̂𝗻𝗴 𝘅𝗮́𝗰 đ𝗶̣𝗻𝗵"  
    var relationship = res.data.result.relationship ? `${res.data.result.relationship}` : "𝗞𝗵𝗼̂𝗻𝗴 𝘅𝗮́𝗰 đ𝗶̣𝗻𝗵"
    var location = res.data.result.location ? `${res.data.result.location}` : "𝗞𝗵𝗼̂𝗻𝗴 𝘅𝗮́𝗰 đ𝗶̣𝗻𝗵"
	var hometown = res.data.result.hometown ? `${res.data.result.hometown}` : "𝗞𝗵𝗼̂𝗻𝗴 𝘅𝗮́𝗰 đ𝗶̣𝗻𝗵"
    var url_profile = res.data.result.profileUrl  ? `${res.data.result.profileUrl}` : `${url_profile}`
    var callback = () => api.sendMessage({body:`=== 『 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡 』 ===\n━━━━━━━━━━━\n\n[👤]➜ 𝗧𝗲̂𝗻: ${res.data.result.name}\n[🔎]➜ 𝗨𝗜𝗗: ${finduid}\n[📆] ➜ 𝗡𝗴𝗮̀𝘆 𝘁𝗮̣𝗼 𝗮𝗰𝗰: ${finddate}\n[👀]➜ 𝗙𝗼𝗹𝗹𝗼𝘄: ${res.data.result.follow}\n[👭]➜ 𝗚𝗶𝗼̛́𝗶 𝘁𝗶́𝗻𝗵: ${gender}\n[🎉]➜ 𝗦𝗶𝗻𝗵 𝗻𝗵𝗮̣̂𝘁: ${birthday}\n[💌]➜ 𝗧𝗲̂𝗻 𝗱𝘂𝘆𝗲̂𝗻 𝗽𝗵𝗮̣̂𝗻: ${love}\n[❤️]➜ 𝗠𝗼̂́𝗶 𝗾𝘂𝗮𝗻 𝗵𝗲̣̂: ${relationship}\n[🏡]➜ 𝗦𝗼̂́𝗻𝗴 𝘁𝗮̣𝗶: ${location}\n[🌏]➜ Đ𝗲̂́𝗻 𝘁𝘂̛̀: ${hometown}\n[👉]➜ 𝗚𝗶𝗼̛́𝗶 𝘁𝗵𝗶𝗲̣̂𝘂 𝗯𝗮̉𝗻 𝘁𝗵𝗮̂𝗻:\n${about}\n[📝]➜ 𝗧𝗿𝗶́𝗰𝗵 𝗱𝗮̂̃𝗻:\n${quotes}\n[🌐]➜ 𝗪𝗲𝗯𝘀𝗶𝘁𝗲: ${website}\n[📌]➜ 𝗟𝗶𝗻𝗸 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸: ${url_profile}\n━━━━━━━━━━━\n===「${thu} || ${gio}」===`,
        attachment: fs.createReadStream(__dirname + "/cache/1.png")}, event.threadID,
        () => fs.unlinkSync(__dirname + "/cache/1.png"),event.messageID); 
    return request(encodeURI(`https://graph.facebook.com/${finduid}/picture?height=1500&width=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`)).pipe(fs.createWriteStream(__dirname+'/cache/1.png')).on('close',
        () => callback());
}
            case "6" : {
  const axios = require("axios")
  async function streamURL(url, mime='jpg') {
    const dest = `${__dirname}/cache/${Date.now()}.${mime}`,
    downloader = require('image-downloader'),
    fse = require('fs-extra');
    await downloader.image({
        url, dest
    });
    setTimeout(j=>fse.unlinkSync(j), 60*1000, dest);
    return fse.createReadStream(dest);
};
      const moment = require("moment-timezone");
var tpk = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss || D/MM/YYYY");
  const name = await Users.getNameUser(event.senderID)
  const res = await axios.get(`https://golike.com.vn/func-api.php?user=${event.senderID}`);
  if (res.status == 200) {
  const finduid = res.data.data.uid
  const finddate = res.data.data.date
  api.unsendMessage(handleReply.messageID);  
       api.sendMessage({body: `🌐==== [ 𝗨𝗜𝗗 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞 ] ====🌐
━━━━━━━━━━━━━━━━

[🍄] ➜ 𝗧𝗲̂𝗻: ${name}
[📌] ➜ 𝗜𝗗 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸: ${finduid}\n[📆] ➜ 𝗡𝗴𝗮̀𝘆 𝘁𝗮̣𝗼: ${finddate}`, attachment: await streamURL(`https://graph.facebook.com/${event.senderID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`)},event.threadID, event.messageID)
        }
            }
            case "7": {
          const axios_1 = require("axios");
  const moment = require("moment-timezone");
  var time = moment.tz("Asia/Ho_Chi_Minh").format("YYYY");
   let fetchdata = await axios_1.get("https://static.pipezero.com/covid/data.json");
  var jsondata = (await fetchdata.data).total;
  var vn = (await fetchdata.data).overview[6];
  var year = vn.date + `-` + time;
  var world = jsondata.world,
    nhiemtg = world.cases,
    chettg = world.death,
    hoiphuctg = world.recovered,
    //////////////////////////////
    nhiemvn = vn.cases,
    chetvn = vn.death,
    hoiphucvn = vn.recovered,
    dieutrivn = vn.treating,
    //////////////////////////////
    nhiemvn7days = vn.avgCases7day,
    hoiphucvn7days = vn.avgRecovered7day,
    chetvn7days = vn.avgDeath7day,
    //////////////////////////////
    ptchetvn = Math.round((chetvn * 100) / nhiemvn),
    pthoiphucvn = Math.round((hoiphucvn * 100) / nhiemvn),
    ptchettg = Math.round((chettg * 100) / nhiemtg),
    pthoiphuctg = Math.round((hoiphuctg * 100) / nhiemtg),
    pthoiphucvn = pthoiphucvn.toString().split(".")[0],
    ptdieutrivn = (100 - pthoiphucvn - ptchetvn).toString().split(".")[0];
  /////////////////////////////////
  ptchetvn = ptchetvn.toString().split(".")[0];
  pthoiphuctg = pthoiphuctg.toString().split(".")[0];
  ptchettg = ptchettg.toString().split(".")[0];
  api.unsendMessage(handleReply.messageID);
  return api.sendMessage(
    "====== Thế Giới ======\n" +
    `[😷] ➜ Nhiễm: ${nhiemtg}\n` +
    `[💚] ➜ Hồi phục: ${hoiphuctg} (${pthoiphuctg}%)\n` +
    `[💀] ➜ Tử vong: ${chettg} (${ptchettg}%)\n` +
    "====== Việt Nam ======\n" +
    `[😷] ➜ Nhiễm: ${nhiemvn}\n` +
    `[💉] ➜ Đang điều trị: ${dieutrivn} (${ptdieutrivn}%)\n` +
    `[💚] ➜ Hồi phục: ${hoiphucvn} (${pthoiphucvn}%)\n` +
    `[💀] ➜ Tử vong: ${chetvn} (${ptchetvn}%)\n` +
    `[🤨] ➜ Nhiễm 7 ngày: ${nhiemvn7days}\n` +
    `[❤] ➜ Hồi phục 7 ngày: ${hoiphucvn7days}\n` +
    `[☠️] ➜ Tử vong 7 ngày: ${chetvn7days}\n\n` +
    //`Tin tức: ${news.vietnam}\n` +
    `[⏱️] ➜ Cập nhật: ${year}`,
    event.threadID, event.messageID
  );
}
             case "8": {
             const fs = global.nodemodule["fs-extra"];
    const axios = global.nodemodule["axios"];
  let mung = [
    "Chúc 2 bạn trăm năm hạnh phút",
    "Chúc 2 bạn xây dựng được 1 tổ ấm hạnh phúc",
    "Chúc 2 bạn cùng nhau nương tựa đến cuối đời",
    "Chúc 2 bạn hạnh phúc",
    "Trách phận vô duyên...",
  "Hơi thấp nhưng không sao. Hãy cố gắng lên!",
  "3 phần duyên nợ, 7 phần cố gắng",
  "Tỷ lệ mà mối quan hệ này có thể nên duyên cũng khá là nhỏ đấy! Phải cố gắng hơn nữa",
  "Date với nhau đi. Để mối quan hệ này có thể tiến xa hơn",
  "Hãy chủ động bắt chuyện hơn nữa. Hai bạn khá là hợp đôi",
  "Hãy tin vào duyên số đi, vì nó có thật đấy!",
  "Hợp đôi lắm đấy. Quan tâm chăm sóc cho mối quan hệ này nhiều hơn nữa nhé!",
  "Lưu số nhau đi, bao giờ cưới thì gọi nhau lên lễ đường!",
  "Cưới đi chờ chi!"
  ]
  let chuc = mung[Math.floor(Math.random() * mung.length)]
    let {
        senderID,
        threadID,
        messageID
    } = event;
    const {
        loadImage,
        createCanvas
    } = require("canvas");
    let path = __dirname + "/cache/ghep.png";
    let pathAvata = __dirname + `/cache/avt${senderID}.png`;
    let pathAvataa = __dirname + `/cache/avtghep.png`;
    var { participantIDs } =(await Threads.getData(event.threadID)).threadInfo;
  var tle = Math.floor(Math.random() * 101);
    const botID = api.getCurrentUserID();
    const listUserID = event.participantIDs.filter(ID => ID != botID && ID != event.senderID);
    var id = listUserID[Math.floor(Math.random() * listUserID.length)];
    var name = (await Users.getData(id)).name
    var namee = (await Users.getData(event.senderID)).name
    let getAvatarOne = (await axios.get(`https://graph.facebook.com/${event.senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    let bg = (
        await axios.get(`https://i.imgur.com/RBOJ6ot.png`, {
            responseType: "arraybuffer",
        })
    ).data;
    fs.writeFileSync(pathAvata, Buffer.from(getAvatarOne, 'utf-8'));
    fs.writeFileSync(pathAvataa, Buffer.from(getAvatarTwo, 'utf-8'));
    fs.writeFileSync(path, Buffer.from(bg, "utf-8"));
    avataruser = await this.circle(pathAvata);
    avataruser2 = await this.circle(pathAvataa);
    let imgB = await loadImage(path);
    let baseAvata = await loadImage(avataruser);
    let baseAvataa = await loadImage(avataruser2);
    let canvas = createCanvas(imgB.width, imgB.height);
    let ctx = canvas.getContext("2d");
    ctx.drawImage(imgB, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseAvata, 92, 135, 100, 100);
    ctx.drawImage(baseAvataa, 652, 134, 100, 100);
    ctx.beginPath();
    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(path, imageBuffer);
    api.unsendMessage(handleReply.messageID);
    return api.sendMessage({body: `${namee} 💓 ${name}\n[⚜️]➜ Lời chúc: ${chuc}`,
            attachment: fs.createReadStream(path)
        },
        threadID,
        () => fs.unlinkSync(path),
        messageID
    );
};  
             case "9": {
               const { cpu, cpuTemperature, currentLoad, memLayout, diskLayout, mem, osInfo } = global.nodemodule["systeminformation"];
	const timeStart = Date.now();

	try {
		var { manufacturer, brand, speed, physicalCores, cores } = await cpu();
		var { main: mainTemp } = await cpuTemperature();
		var { currentLoad: load } = await currentLoad();
		var diskInfo = await diskLayout();
		var memInfo = await memLayout();
		var { total: totalMem, available: availableMem } = await mem();
		var { platform: OSPlatform, build: OSBuild } = await osInfo();

		var time = process.uptime();
		var hours = Math.floor(time / (60 * 60));
		var minutes = Math.floor((time % (60 * 60)) / 60);
		var seconds = Math.floor(time % 60);
		if (hours < 10) hours = "0" + hours;
		if (minutes < 10) minutes = "0" + minutes;
		if (seconds < 10) seconds = "0" + seconds;
    api.unsendMessage(handleReply.messageID);
		return api.sendMessage(
			"===[ System Info ]===" +
			"\n[⚜️] CPU [⚜️]" +
			"\n➜ CPU Model: " + manufacturer + brand +
			"\n➜ Speed: " + speed + "GHz" +
			"\n➜ Cores: " + physicalCores +
			"\n➜ Threads: " + cores +
			"\n➜ Temperature: " + mainTemp + "°C" +
			"\n➜ Load: " + load.toFixed(1) + "%" +
			"\n[⚜️] MEMORY [⚜️]" +
			"\n➜ Size: " + byte2mb(memInfo[0].size) +
			"\n➜ Type: " + memInfo[0].type +
			"\n➜ Total: " + byte2mb(totalMem) +
			"\n➜ Available: " + byte2mb(availableMem) +
			"\n[⚜️] DISK [⚜️]" +
			"\n➜ Name: " + diskInfo[0].name +
			"\n➜ Size: " + byte2mb(diskInfo[0].size) +
			"\n➜ Temperature: " + diskInfo[0].temperature + "°C" +
			"\n[⚜️] OS [⚜️]" +
			"\n➜ Platform: " + OSPlatform +
			"\n➜ Build: " + OSBuild +
			"\n➜ Uptime: " + hours + ":" + minutes + ":" + seconds +
			"\n➜ Ping: " + (Date.now() - timeStart) + "ms",
			event.threadID, event.messageID)
	}
	catch (e) {
		console.log(e)
	}
}
          case "10": {
            api.unsendMessage(handleReply.messageID);
            const axios = require('axios');
          const moment = require("moment-timezone");
  const tpkk = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY || HH:mm:ss");
  let name = await Users.getNameUser(event.senderID);
    let mentions = [];
    mentions.push({
      tag: name,
      id: event.senderID
    })
       api.unsendMessage(handleReply.messageID);
    api.sendMessage({body: `[⏳]➜ đ𝗼̛̣𝗶 𝘁𝗶́ 𝗻𝗵𝗮 ${name} 𝗯𝗼𝘁 đ𝗮𝗻𝗴 𝗰𝗮𝗽`, mentions}, event.threadID, event.messageID);
   if (Object.keys(event.mentions).length == 1) {
      var uid = Object.keys(event.mentions)[0];
    }
  else {
          var uid = event.senderID;
    }
    var cookies = `dbln=%7B%22100081774576028%22%3A%22ODXWNP4b%22%7D;sb=zMpyZNmqJ3ICWUJQsw3JaOxN;datr=zMpyZNKTSTughsvtmUNmD4jH;dpr=1.25;c_user=100081774576028;wd=1070x723;xs=21%3AVcson9zfTe8y3Q%3A2%3A1689529475%3A-1%3A6296%3A%3AAcXuf_TYM9i7k86XW6BNt-6nRuDHtrSnuUiwnT4EIw;fr=0by0O06G2aQsVnywY.AWXHgQLG2H-WwHUi5Mx4fD2I6G0.BkzJWV.9B.AAA.0.0.BkzJXj.AWVnAygMAjM;presence=C%7B%22lm3%22%3A%22g.6269717149791871%22%2C%22t3%22%3A%5B%5D%2C%22utc3%22%3A1691129322438%2C%22v%22%3A1%7D`,
    vaildItems = ['sb', 'datr', 'c_user', 'xs', 'm_pixel_ratio', 'locale', 'wd', 'fr', 'presence', 'xs', 'm_page_voice', 'fbl_st', 'fbl_ci', 'fbl_cs', 'vpd', 'wd', 'fr', 'presence'];
    var cookie = `dbln=%7B%22100081774576028%22%3A%22ODXWNP4b%22%7D;sb=zMpyZNmqJ3ICWUJQsw3JaOxN;datr=zMpyZNKTSTughsvtmUNmD4jH;dpr=1.25;c_user=100081774576028;wd=1070x723;xs=21%3AVcson9zfTe8y3Q%3A2%3A1689529475%3A-1%3A6296%3A%3AAcXuf_TYM9i7k86XW6BNt-6nRuDHtrSnuUiwnT4EIw;fr=0by0O06G2aQsVnywY.AWXHgQLG2H-WwHUi5Mx4fD2I6G0.BkzJWV.9B.AAA.0.0.BkzJXj.AWVnAygMAjM;presence=C%7B%22lm3%22%3A%22g.6269717149791871%22%2C%22t3%22%3A%5B%5D%2C%22utc3%22%3A1691129322438%2C%22v%22%3A1%7D`;
    cookies.split(';').forEach(item => {
        var data = item.split('=');
        if (vaildItems.includes(data[0])) cookie += `${data[0]}=${data[1]};`;
    });
    var url = encodeURI(encodeURI((`https://apicap.jrtxtracy.repl.co/screenshot/${uid}/${cookie}`))),
        path = __dirname + `/cache/${uid}.png`;
    axios({
        method: "GET",
        url: `https://api.screenshotmachine.com/?key=b1b3d9&url=${url}&dimension=480x800`,
        responseType: "arraybuffer"
    }).then(res => {
        fs.writeFileSync(path, Buffer.from(res.data, "utf-8"));
        api.sendMessage({body: `🌐==== [ 𝗖𝗔𝗣 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞 ] ====🌐
━━━━━━━━━━━━━━━━━━━
[🌸]➜ 𝗕𝗼𝘁 𝘃𝘂̛̀𝗮 𝗰𝗮𝗽 𝘅𝗼𝗻𝗴 𝘆𝗲̂𝘂 𝗰𝘂̉𝗮 𝗰𝘂̉𝗮 𝗯𝗮̣𝗻
━━━━━━━━━━━━━━━━━━━
[⚜️]➜ 𝗖𝗮𝗽 𝘄𝗮𝗹𝗹 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 𝗱𝗮̣𝗻𝗴 đ𝗶𝗲̣̂𝗻 𝘁𝗵𝗼𝗮̣𝗶 𝗻𝗲̂̀𝗻 𝘁𝗿𝗮̆́𝗻𝗴 𝗰𝘂̉𝗮 𝗯𝗮̣𝗻 đ𝗮̂𝘆 `,mentions, attachment: fs.createReadStream(path) }, event.threadID, () => fs.unlinkSync(path), event.messageID);
    }).catch(err => console.log(err));
        };
            break;
					default:
           const choose = parseInt(event.body);
            	if (isNaN(event.body)) return api.sendMessage("[⚜️] ➜ 𝐕𝐮𝐢 𝐥𝐨̀𝐧𝐠 𝐧𝐡𝐚̣̂𝐩 𝟏 𝐜𝐨𝐧 𝐬𝐨̂́", event.threadID, event.messageID);
            	if (choose > 10 || choose < 1) return api.sendMessage("[⚜️] ➜ 𝐋𝐮̛̣𝐚 𝐜𝐡𝐨̣𝐧 𝐤𝐡𝐨̂𝐧𝐠 𝐧𝐚̆̀𝐦 𝐭𝐫𝐨𝐧𝐠 𝐝𝐚𝐧𝐡 𝐬𝐚́𝐜𝐡.", event.threadID, event.messageID); 
    }
    }
}
}