const express = require("express");
const axios = require("axios"); // External link se data fetch karne ke liye
const app = express();
const PORT = process.env.PORT || 3000;

const DEVELOPER = "@AKASHHACKER";
// Yahan apna Release Database Direct Download Link daalein
const DB_URL = "https://github.com/anonymous404-hash/akash-addhar-info-api/releases/download/v1.0/database.json"; 

const KEYS_DB = {
  "AKASH_VIP": { expiry: "2026-12-31", status: "Premium" }
};

app.get("/search", async (req, res) => {
  const { phone, addhar, key } = req.query;

  // 1. Key Check
  if (!key || !KEYS_DB[key]) return res.status(401).json({ success: false, message: "Invalid Key!", developer: DEVELOPER });

  // 2. Expiry Logic
  const today = new Date();
  const expiryDate = new Date(KEYS_DB[key].expiry);
  const timeDiff = expiryDate - today;
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  if (today > expiryDate) {
    return res.status(403).json({ success: false, message: "Key Expired!", developer: DEVELOPER });
  }

  if (!phone && !addhar) return res.status(400).json({ success: false, message: "Phone or Aadhar required" });

  try {
    // External URL se data stream karna
    const response = await axios({
      method: 'get',
      url: DB_URL,
      responseType: 'stream'
    });

    let buffer = "";
    let isFound = false;

    response.data.on("data", (chunk) => {
      if (isFound) return;
      buffer += chunk.toString();

      let idx;
      while ((idx = buffer.indexOf("},")) !== -1) {
        let piece = buffer.slice(0, idx + 1).trim();
        buffer = buffer.slice(idx + 2);

        if (piece.startsWith("[")) piece = piece.slice(1);

        const matchPhone = phone && (piece.includes(`"Phone Number": ${phone}.0`) || piece.includes(`"Phone Number": ${phone}`));
        const matchAadhar = addhar && (piece.includes(`"Aadhaar Number": ${addhar}.0`) || piece.includes(`"Aadhaar Number": ${addhar}`));

        if (matchPhone || matchAadhar) {
          isFound = true;
          // Connection band kar dena search milne par
          response.data.destroy(); 
          
          try {
            let cleanPiece = piece;
            if (cleanPiece.endsWith("]")) cleanPiece = cleanPiece.slice(0, -1);
            
            return res.json({
              success: true,
              developer: DEVELOPER,
              key_status: KEYS_DB[key].status,
              days_left: daysLeft > 0 ? `${daysLeft} days` : "Last day",
              data: JSON.parse(cleanPiece)
            });
          } catch (e) {
            return res.status(500).json({ success: false, message: "JSON Parsing Error" });
          }
        }
      }
    });

    response.data.on("end", () => {
      if (!isFound) res.status(404).json({ success: false, message: "No record found", developer: DEVELOPER });
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Database link not working or unreachable" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API LIVE | Port: ${PORT}`);
});
