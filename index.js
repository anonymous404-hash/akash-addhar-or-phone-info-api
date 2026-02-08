const express = require("express");
const fetch = require("node-fetch");
const app = express();

const JSON_URL = "https://github.com/anonymous404-hash/akash-addhar-info-api/releases/download/v1.0/database.json";

app.get("/", (req, res) => {
  res.json({ 
    status: true, 
    developer: "AKASHHACKER",
    message: "API Working 🎉" 
  });
});

app.get("/search", async (req, res) => {
  // Dono query parameters ko check karega
  const aadharNumber = req.query.aadharNumber;
  const phoneNumber = req.query.phoneNumber;

  // Agar dono khali hain toh error dega
  if (!aadharNumber && !phoneNumber) {
    return res.json({
      success: false,
      developer: "AKASHHACKER",
      message: "Please provide either aadharNumber or phoneNumber"
    });
  }

  try {
    const response = await fetch(JSON_URL);
    const data = await response.json();

    // Logic: Agar aadharNumber match ho ya phoneNumber match ho
    const result = data.find(item => {
      return (aadharNumber && item.aadharNumber === aadharNumber) || 
             (phoneNumber && item.phoneNumber === phoneNumber);
    });

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Running on port ${PORT}`));
