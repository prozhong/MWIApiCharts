const fs = require("fs");
const request = require("request");
// 下载文件
let url = "https://raw.githubusercontent.com/holychikenz/MWIApi/main/market.db";
let stream = fs.createWriteStream("./src/data/market.db");
request(url)
  .pipe(stream)
  .on("close", function (err) {
    console.log("Download finished!");
  });
