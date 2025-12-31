const express = require("express");
const fetch = require("node-fetch");
const app = express();

const JSON_URL = "YOUR_JSON_DIRECT_DOWNLOAD_LINK";

app.get("/", (req, res) => {
  res.json({ status: true, message: "API Working 🎉" });
});

app.get("/data", async (req, res) => {
  const response = await fetch(JSON_URL);
  const data = await response.json();
  res.json(data);
});

app.listen(3000, () => console.log("Server Running"));
