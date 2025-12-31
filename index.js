const express = require("express");
const fetch = require("node-fetch");
const app = express();

const JSON_URL = "https://github.com/anonymous404-hash/Addharinfoapi/releases/download/v1.0/database.json";

app.get("/", (req, res) => {
  res.json({ status: true, message: "API Working 🎉" });
});

app.get("/data", async (req, res) => {
  const response = await fetch(JSON_URL);
  const data = await response.json();
  res.json(data);
});

app.listen(3000, () => console.log("Server Running"));
