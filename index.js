const express = require("express");
const fetch = require("node-fetch");
const app = express();

const JSON_URL = "http://among-sufficiently.gl.at.ply.gg:4635";

app.get("/", (req, res) => {
  res.json({ 
    status: true, 
    developer: "AKASHHACKER",
    message: "API Working 🎉" 
  });
});

app.get("/search", async (req, res) => {
  const aadharNumber = req.query.aadharNumber; // /search?aadharNumber=XXXX

  if (!aadharNumber) {
    return res.json({
      success: false,
      developer: "AKASHHACKER",
      message: "Please provide aadharNumber"
    });
  }

  try {
    const response = await fetch(JSON_URL);
    const data = await response.json();

    const result = data.find(item => item.aadharNumber == aadharNumber);

    if (!result) {
      return res.json({
        success: false,
        developer: "AKASHHACKER",
        message: "No records found"
      });
    }

    return res.json({
      success: true,
      developer: "AKASHHACKER",
      data: result
    });

  } catch (err) {
    return res.json({
      success: false,
      developer: "AKASHHACKER",
      message: "Database fetch problem"
    });
  }
});

app.listen(3000, () => console.log("Server Running"));
