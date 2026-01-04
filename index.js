const express = require("express");
const app = express();

const JSON_URL = "https://github.com/anonymous404-hash/akash-addhar-info-api/releases/download/v1.0/database2.json";

app.get("/search", async (req, res) => {
  const aadharNumber = req.query.aadharNumber;

  if (!aadharNumber) {
    return res.json({
      success: false,
      developer: "AKASHHACKER",
      message: "Please provide aadharNumber"
    });
  }

  // Set a timeout for the fetch
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 10000); // 10 seconds

  try {
    const response = await fetch(JSON_URL, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

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
    clearTimeout(timeout);
    console.error(err);
    return res.json({
      success: false,
      developer: "AKASHHACKER",
      message: "Database fetch problem",
      error: err.message // Only for debugging, remove in production
    });
  }
});
