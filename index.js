const express = require("express");
const axios = require("axios");
const app = express();

const PORT = process.env.PORT || 3000;
const DEVELOPER = "@AKASHHACKER";
const DB_URL = "https://github.com/anonymous404-hash/akash-addhar-info-api/releases/download/v1.0/database.json"; // GitHub Raw/Release direct link

const KEYS_DB = {
  "AKASH_VIP": { expiry: "2026-12-31", status: "Premium" }
};

app.get("/search", async (req, res) => {
  const { phone, addhar, key } = req.query;

  if (!key || !KEYS_DB[key]) return res.status(401).json({ success: false, message: "Invalid Key!" });
  if (!phone && !addhar) return res.status(400).json({ success: false, message: "Phone or Aadhar required" });

  try {
    const response = await axios({
      method: 'get',
      url: DB_URL,
      responseType: 'stream',
      timeout: 15000 // Thoda zyada time diya hai
    });

    let buffer = "";
    let isFound = false;

    response.data.on("data", (chunk) => {
      if (isFound) return;
      
      buffer += chunk.toString();

      // Chunk processing to find a complete JSON object
      let startIndex = buffer.indexOf('{');
      let endIndex = buffer.indexOf('}');

      while (startIndex !== -1 && endIndex !== -1) {
        if (endIndex > startIndex) {
          const piece = buffer.substring(startIndex, endIndex + 1);
          
          // Fast check before parsing JSON
          const matchPhone = phone && piece.includes(`"Phone Number": ${phone}`);
          const matchAadhar = addhar && piece.includes(`"Aadhaar Number": ${addhar}`);

          if (matchPhone || matchAadhar) {
            isFound = true;
            response.data.destroy(); // Stop stream immediately
            
            try {
              const jsonData = JSON.parse(piece);
              return res.json({
                success: true,
                developer: DEVELOPER,
                data: jsonData
              });
            } catch (e) {
              // Agar parse fail ho toh agle piece pe jao
            }
          }
        }
        // Buffer se purana data hatao
        buffer = buffer.substring(endIndex + 1);
        startIndex = buffer.indexOf('{');
        endIndex = buffer.indexOf('}');
      }

      // Buffer size control (prevent memory crash)
      if (buffer.length > 1024 * 1024) buffer = buffer.slice(-5000);
    });

    response.data.on("end", () => {
      if (!isFound && !res.headersSent) {
        res.status(404).json({ success: false, message: "No record found" });
      }
    });

    response.data.on("error", () => {
      if (!res.headersSent) res.status(500).json({ success: false, message: "Stream Error" });
    });

  } catch (error) {
    if (!res.headersSent) res.status(500).json({ success: false, message: "Database Link Unreachable" });
  }
});

module.exports = app;
