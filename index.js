const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DB_FILE = "database.json"; 
const DEVELOPER = "@AKASHHACKER";

const KEYS_DB = {
  "AKASH_VIP": { expiry: "2026-12-31", status: "Premium" }
};

app.get("/search", (req, res) => {
  const { phone, addhar, key } = req.query;

  // 1. Key Check
  if (!key || !KEYS_DB[key]) return res.status(401).json({ success: false, message: "Invalid Key!", developer: DEVELOPER });

  // 2. Expiry Calculation Logic
  const today = new Date();
  const expiryDate = new Date(KEYS_DB[key].expiry);
  const timeDiff = expiryDate - today;
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Days convert karne ke liye

  if (today > expiryDate) {
    return res.status(403).json({ 
      success: false, 
      message: "Key Expired!", 
      expiry_date: KEYS_DB[key].expiry,
      developer: DEVELOPER 
    });
  }

  if (!phone && !addhar) return res.status(400).json({ success: false, message: "Phone or Aadhar required" });

  const filePath = path.join(__dirname, DB_FILE);
  const stream = fs.createReadStream(filePath, { encoding: "utf8", highWaterMark: 128 * 1024 }); 
  let buffer = "";
  let isFound = false;

  stream.on("data", (chunk) => {
    if (isFound) return;
    buffer += chunk;

    let idx;
    while ((idx = buffer.indexOf("},")) !== -1) {
      let piece = buffer.slice(0, idx + 1).trim();
      buffer = buffer.slice(idx + 2);

      if (piece.startsWith("[")) piece = piece.slice(1);

      const matchPhone = phone && (
        piece.includes(`"Phone Number": ${phone}.0`) || 
        piece.includes(`"Phone Number": ${phone}`)
      );
      
      const matchAadhar = addhar && (
        piece.includes(`"Aadhaar Number": ${addhar}.0`) || 
        piece.includes(`"Aadhaar Number": ${addhar}`)
      );

      if (matchPhone || matchAadhar) {
        isFound = true;
        stream.destroy();
        try {
          let cleanPiece = piece;
          if (cleanPiece.endsWith("]")) cleanPiece = cleanPiece.slice(0, -1);
          
          return res.json({
            success: true,
            developer: DEVELOPER,
            key_status: KEYS_DB[key].status,
            expiry_date: KEYS_DB[key].expiry, // Expiry date dikhayega
            days_left: daysLeft > 0 ? `${daysLeft} days` : "Last day today", // Kitne din bache hain
            data: JSON.parse(cleanPiece)
          });
        } catch (e) {
          return res.status(500).json({ success: false, message: "JSON Data Error" });
        }
      }
    }
    if (buffer.length > 1000000) buffer = buffer.slice(-200000);
  });

  stream.on("end", () => {
    if (!isFound) res.status(404).json({ success: false, message: "No record found", developer: DEVELOPER });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API LIVE | Dev: ${DEVELOPER} | Port: ${PORT}`);
});
