const express = require("express");
const axios = require("axios");
const app = express();

const PORT = process.env.PORT || 3000;
const DEVELOPER = "@AKASHHACKER";
const DB_URL = "https://github.com/anonymous404-hash/akash-addhar-info-api/releases/download/v1.0/database.json"; // Direct download link yahan daalein

const KEYS_DB = {
  "AKASH_VIP": { expiry: "2026-12-31", status: "Premium" }
};

app.get("/search", async (req, res) => {
  const { phone, addhar, key } = req.query;

  // 1. Key & Params Validation
  if (!key || !KEYS_DB[key]) return res.status(401).json({ success: false, message: "Invalid Key!" });
  if (!phone && !addhar) return res.status(400).json({ success: false, message: "Phone or Aadhar required" });

  // 2. Expiry Check
  const today = new Date();
  const expiryDate = new Date(KEYS_DB[key].expiry);
  if (today > expiryDate) return res.status(403).json({ success: false, message: "Key Expired!" });

  try {
    // 3. Database Stream Setup
    const response = await axios({
      method: 'get',
      url: DB_URL,
      responseType: 'stream',
      timeout: 9000 // Vercel limit ke andar rakhne ke liye
    });

    let buffer = "";
    let isFound = false;

    response.data.on("data", (chunk) => {
      if (isFound) return;
      
      buffer += chunk.toString();

      // Memory leak rokne ke liye buffer limit
      if (buffer.length > 5 * 1024 * 1024) { 
          buffer = buffer.slice(-1024 * 1024); 
      }

      let idx;
      while ((idx = buffer.indexOf("},")) !== -1) {
        let piece = buffer.slice(0, idx + 1).trim();
        buffer = buffer.slice(idx + 2);

        if (piece.startsWith("[")) piece = piece.slice(1);

        const matchPhone = phone && piece.includes(`"Phone Number": ${phone}`);
        const matchAadhar = addhar && piece.includes(`"Aadhaar Number": ${addhar}`);

        if (matchPhone || matchAadhar) {
          isFound = true;
          response.data.destroy(); // Stream turant band karein
          
          try {
            let cleanPiece = piece.endsWith("]") ? piece.slice(0, -1) : piece;
            return res.json({
              success: true,
              developer: DEVELOPER,
              data: JSON.parse(cleanPiece)
            });
          } catch (e) {
            return res.status(500).json({ success: false, message: "Parse Error" });
          }
        }
      }
    });

    response.data.on("end", () => {
      if (!isFound && !res.headersSent) {
        res.status(404).json({ success: false, message: "No record found" });
      }
    });

    response.data.on("error", (err) => {
      if (!res.headersSent) res.status(500).json({ success: false, message: "Stream Interrupted" });
    });

  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "DB Link Error or Timeout" });
    }
  }
});

module.exports = app; // Vercel ke liye zaruri hai
