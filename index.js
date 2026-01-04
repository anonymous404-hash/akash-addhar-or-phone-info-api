export default async function handler(req, res) {
  const JSON_URL =
    "https://github.com/anonymous404-hash/akash-addhar-info-api/releases/download/v1.0/database2.json";

  const aadharNumber = req.query.aadharNumber;

  if (!aadharNumber) {
    return res.status(400).json({
      success: false,
      developer: "AKASHHACKER",
      message: "Please provide aadharNumber"
    });
  }

  // timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(JSON_URL, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // search
    const result = data.find(
      item => String(item.aadharNumber) === String(aadharNumber)
    );

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
    return res.json({
      success: false,
      developer: "AKASHHACKER",
      message: "Database fetch problem",
      error: err.message
    });
  }
}
