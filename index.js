const express = require("express");
const fetch = require("node-fetch");
const app = express();

// ================= [ MULTI-USER KEYS DATABASE ] =================
const KEYS_DB = {
    "user1": { key: "AKASH_PAID31DAYS", expiry: "2026-03-31" },
    "user2": { key: "AKASH_TEST_KEY", expiry: "2026-02-20" },
    "trial": { key: "AKASH_FREE", expiry: "2026-02-15" },
};

const JSON_URL = "https://github.com/anonymous404-hash/akash-addhar-info-api/releases/download/v1.0/database.json";

app.get("/", (req, res) => {
    res.json({ status: true, message: "API is Running. Use /search with your key." });
});

app.get("/search", async (req, res) => {
    const query = req.query.aadharNumber || req.query.phoneNumber;
    const userKey = req.query.key; // User ko URL mein &key=... daalna hoga

    // 1. Check if Key is missing
    if (!userKey) {
        return res.status(401).json({ 
            success: false, 
            message: "API Key missing! Please provide ?key=YOUR_KEY" 
        });
    }

    // 2. Find Key in Database
    const foundUser = Object.values(KEYS_DB).find(u => u.key === userKey);

    if (!foundUser) {
        return res.status(401).json({ 
            success: false, 
            message: "Invalid API Key! Access Denied." 
        });
    }

    // 3. Expiry Check Logic
    const today = new Date();
    const expiryDate = new Date(foundUser.expiry);
    const timeDiff = expiryDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (today > expiryDate) {
        return res.status(403).json({ 
            success: false,
            status: "Expired",
            message: `Aapki key ${foundUser.expiry} ko khatam ho chuki hai.` 
        });
    }

    // 4. Check Search Input
    if (!query) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide aadharNumber or phoneNumber" 
        });
    }

    try {
        const response = await fetch(JSON_URL);
        const data = await response.json();

        // 5. Search in DB
        const result = data.find(item => 
            (item.aadharNumber === query) || (item.phoneNumber === query)
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "No records found in database"
            });
        }

        // 6. Success Response with Key Info
        return res.json({
            success: true,
            developer: "@Akashishare",
            key_details: {
                expiry_date: foundUser.expiry,
                days_remaining: daysLeft > 0 ? `${daysLeft} Days` : "Last Day Today",
                status: "Active"
            },
            data: result
        });

    } catch (err) {
        return res.status(500).json({ 
            success: false, 
            message: "Database connection error" 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
