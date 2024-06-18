import React, { useState } from "react";
import "./App.css";
// import ReactDOM from 'react-dom';
import { Line } from "@ant-design/plots";
import { Select } from "antd";
import iSelections from "./ItemsSelection.json";
import _data from "./data/data.json";

let naviLang = navigator.language || navigator.userLanguage;
let iszhCN = naviLang === "zh-CN";
const uiText = { serch: "Search to Select" };
if (iszhCN) {
  uiText.serch = "仅支持英文搜索";
}
let items = iSelections.market;
let curOptions = [];
let i = 1;
for (const key in items) {
  let option = { value: i, label: key };
  curOptions.push(option);
  i++;
}
var dataUpdateTime = 1718557202.6439815;

const handleINameSel = (name) => {
  let itemData = _data[name];
  if (!itemData) {
    return;
  }
  let lMin = 10000000000;
  let lMax = 1;

  itemData.forEach((item) => {
    // item.timestamp = new Date(Math.floor(1000 * item.timestamp));
    item.date = new Date(Math.floor(1000 * item.timestamp));
    if (dataUpdateTime < item.timestamp) {
      dataUpdateTime = item.timestamp;
    }
    if (lMin > item.bid) {
      lMin = item.bid;
    }
    if (lMax < item.ask) {
      lMax = item.ask;
    }

    if (item.ask === -1) {
      item.ask = NaN;
    }
    if (item.bid === -1) {
      item.bid = NaN;
    }
  });

  itemData.sort((a, b) => a.timestamp - b.timestamp);
  return { itemData, lMin, lMax };
};

handleINameSel("Apple");

const DemoLine = () => {
  const [iNameSel, setINameSel] = useState("");
  let handled = iNameSel && handleINameSel(iNameSel);
  let lMin = handled.lMin;
  let lMax = handled.lMax;
  let showDataStr = new Date(dataUpdateTime * 1000);

  const config = {
    data: handled.itemData,
    xField: "date",
    // connectNulls: {
    //   connect: true,
    //   connectStroke: "#aaa",
    // },
    axis: {
      y: {
        labelFormatter: (v) =>
          `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`),
      },
    },
    children: [
      {
        type: "line",
        yField: "ask",
        // shapeField: 'smooth',
        colorField: "#EE6666",
        // scale: { y: { domainMax: 30 } },
        // axis: {
        //   y: {
        //     title: 'Temperature (°C)',
        //     style: { titleFill: '#EE6666' },
        //   },
        // },
      },
      {
        type: "line",
        yField: "bid",
        // colorField: "#EE6666",
      },
    ],
    height: 800,
    width: 1200,
    style: {
      gradient: "y",
      lineWidth: 2,
      lineJoin: "round",
    },
    scale: {
      //   x: { utc: true },
      y: { domainMax: lMax * 1.05, domainMin: lMin * 0.8 },
    },
    // scale: { y: { domainMin: 5 } },
    // threshold: {},
    slider: {
      // x: { labelFormatter: (d) => format(d, 'YYYY/M/D') },
      // y: { labelFormatter: "~s" },
    },
  };
  const graph = handled && handled.itemData ? <Line {...config} /> : "";
  return (
    <div>
      <Select
        showSearch
        style={{
          width: 200,
          // marginLeft:0,
          // marginTop:0
        }}
        placeholder={uiText.serch}
        optionFilterProp="children"
        filterOption={(input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
        }
        filterSort={(optionA, optionB) =>
          (optionA?.label ?? "")
            .toLowerCase()
            .localeCompare((optionB?.label ?? "").toLowerCase())
        }
        options={curOptions}
        onChange={
          (value, label) => {
            // itemNameSelected = label.label;
            setINameSel(label.label);
          }
          // console.log(label.label)
          // window.location.reload()
        }
      />
      {graph}
      <br></br>
      <br></br>
      <br></br>last update : {showDataStr.toLocaleString()}
    </div>
  );
};

function App() {
  return (
    <>
      <DemoLine />
    </>
  );
}

export default App;
