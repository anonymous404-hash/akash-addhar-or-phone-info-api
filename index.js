const express = require("express");
const fetch = require("node-fetch");
const app = express();

// JSON database URL
const JSON_URL = "https://github.com/anonymous404-hash/akash-addhar-info-api/releases/download/v1.0/database2.json";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Middleware (if needed for frontend)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({ 
    status: true, 
    developer: "AKASHHACKER",
    message: "Aadhar Information API Working 🎉",
    endpoints: {
      search: "/search?aadharNumber=XXXXXXXXXXXX",
      allData: "/all"
    },
    github: ""
  });
});

// Search by Aadhar Number
app.get("/search", async (req, res) => {
  const aadharNumber = req.query.aadharNumber;

  if (!aadharNumber) {
    return res.status(400).json({
      success: false,
      developer: "AKASHHACKER",
      message: "Please provide aadharNumber parameter",
      example: "/search?aadharNumber=123456789012"
    });
  }

  // Validate Aadhar number (12 digits)
  if (!/^\d{12}$/.test(aadharNumber)) {
    return res.status(400).json({
      success: false,
      developer: "AKASHHACKER",
      message: "Invalid Aadhar number. Must be 12 digits."
    });
  }

  try {
    const response = await fetch(JSON_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch database: ${response.status}`);
    }
    
    const data = await response.json();

    // Find matching Aadhar number
    const result = data.find(item => item.aadharNumber == aadharNumber);

    if (!result) {
      return res.status(404).json({
        success: false,
        developer: "AKASHHACKER",
        message: "No records found for this Aadhar number"
      });
    }

    return res.json({
      success: true,
      developer: "AKASHHACKER",
      timestamp: new Date().toISOString(),
      data: result
    });

  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).json({
      success: false,
      developer: "AKASHHACKER",
      message: "Database fetch problem",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get all data (optional)
app.get("/all", async (req, res) => {
  try {
    const response = await fetch(JSON_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch database: ${response.status}`);
    }
    
    const data = await response.json();

    return res.json({
      success: true,
      developer: "AKASHHACKER",
      count: data.length,
      timestamp: new Date().toISOString(),
      data: data
    });

  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).json({
      success: false,
      developer: "AKASHHACKER",
      message: "Failed to fetch all data",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    available_endpoints: ["/", "/search", "/all", "/health"]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Server configuration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Access URL: http://localhost:${PORT}`);
  console.log(`🔍 Search endpoint: http://localhost:${PORT}/search?aadharNumber=XXXXXXXXXXXX`);
});
