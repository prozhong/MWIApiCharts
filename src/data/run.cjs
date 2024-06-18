const https = require("https");
const fs = require("fs");

const owner = "holychikenz"; // GitHub项目的所有者
const repo = "MWIApi"; // GitHub项目的名称
var sha = "";

// https://api.github.com/repos/holychikenz/MWIApi/commits?path=/milkyapi.json
// https://github.com/holychikenz/MWIApi/blob/e288c99d0fd048371bce4c79ec3f25f621b70404/milkyapi.json

var shaList = [];
var itemsList = {};

function updateItemsList(key, ask, bid, timestamp) {
  itemsList[key] = itemsList[key] || [];
  let item;
  itemsList[key].every((v) => {
    if (v.timestamp === timestamp) {
      item = v;
      return false;
    }
    return true;
  });
  if (!item) {
    item = {};
    itemsList[key].push(item);
  }
  item.ask = ask;
  item.bid = bid;
  item.timestamp = timestamp;
}
const options = {
  hostname: "api.github.com",
  path: `/repos/${owner}/${repo}/commits?path=/milkyapi.json&per_page=100`,
  method: "GET",
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.5410.0 Safari/537.36", // 请替换为你自己的User-Agent
  },
};
function queryEachFile() {
  let httpsOptions = {
    hostname: "raw.githubusercontent.com",
    path: `/${owner}/${repo}/${sha}/milkyapi.json`,
    method: "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.5410.0 Safari/537.36", // 请替换为你自己的User-Agent
    },
  };

  https
    .get(httpsOptions, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        let parsedJson = JSON.parse(data);
        // console.log(parsedJson); //{market: {…}, time: 1718602202.872736}
        for (const key in parsedJson.market) {
          updateItemsList(
            key,
            parsedJson.market[key].ask,
            parsedJson.market[key].bid,
            parsedJson.time
          );
            console.log(key);
        }
      });
    })
    .on("error", (err) => {
      console.error("Error: " + err.message);
    });
}

https
  .get(options, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      const commits = JSON.parse(data);
      commits.forEach((commit) => {
        shaList.push({ sha: commit.sha, time: commit.commit.committer.date });
      });
      // 处理下所有的
      shaList.sort((a, b) => new Date(a.time) - new Date(b.time));
      for (let i = 0; i < shaList.length; i++) {
        sha = shaList[i].sha;
        queryEachFile();
      }
      //   sha = shaList[0];
      //   queryEachFile();
    });
  })
  .on("error", (err) => {
    console.error("Error: " + err.message);
  });

// console.log(shaList.length);
setTimeout(() => {
  let jsonString = JSON.stringify(itemsList);
  fs.writeFile("data.json", jsonString, (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return;
    }
    console.log("JSON data has been stored in data.json");
  });
}, 15000);
