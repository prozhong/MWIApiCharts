const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");

let db = new sqlite3.Database(
  "./src/data/market.db",
  sqlite3.OPEN_READONLY,
  (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Connected to the database.");
  }
);
let nowTime = Date.now();
let startTime = nowTime - 24 * 60 * 60 * 1000 * 7;

let timestamp = Math.floor(startTime / 1000);
// console.log(new Date(startTime).toLocaleString())
// console.log(timestamp);
let nameList = [];
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
  if (ask) {
    item.ask = ask;
  }
  if (bid) {
    item.bid = bid;
  }
  item.timestamp = timestamp;
}

//db
let sqlCol = `WITH all_tables AS (SELECT name FROM sqlite_master WHERE type = 'table'and name='ask') 
SELECT at.name table_name, pti.name
FROM all_tables at INNER JOIN pragma_table_info(at.name) pti
ORDER BY table_name;`;
db.each(sqlCol, [], (err, row) => {
  if (err) {
    throw err;
  }
  if (row.name !== "time") {
    nameList.push(row.name);
  }
  // console.log(`${row.name}`);
});

let sql = `SELECT * FROM ask  WHERE time > ${timestamp} ORDER BY time`;
db.each(sql, [], (err, row) => {
  if (err) {
    throw err;
  }
  for (const key in row) {
    if (key !== "time") {
      updateItemsList(key, row[key], false, row.time);
    }
  }
  // console.log(`${row.time} ${row.Amber}`);
});

let sql2 = `SELECT * FROM bid  WHERE time > ${timestamp} ORDER BY time`;
db.each(sql2, [], (err, row) => {
  if (err) {
    throw err;
  }
  for (const key in row) {
    if (key !== "time") {
      updateItemsList(key, false, row[key], row.time);
    }
  }
  // console.log(`${row.time} ${row.Amber}`);
});

// close the database connection
db.close((err) => {
  console.log("db close");
});

setTimeout(() => {
  let jsonString = JSON.stringify(itemsList);
  fs.writeFile("./src/data/data.json", jsonString, (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return;
    }
    console.log("JSON data has been stored in data.json");
  });
}, 2000);
